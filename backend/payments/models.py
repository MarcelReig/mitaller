"""
Modelos para la gestión de pagos con Stripe Connect.
"""

from django.db import models
from decimal import Decimal
from django.conf import settings


class StripeAccountStatus(models.TextChoices):
    """
    Estados posibles de una cuenta de Stripe Connect.
    
    - PENDING: Cuenta creada pero onboarding no completado
    - ACTIVE: Cuenta activa, puede recibir pagos
    - RESTRICTED: Cuenta con restricciones (requiere verificación adicional)
    - DISABLED: Cuenta deshabilitada
    """
    PENDING = 'pending', 'Pendiente'
    ACTIVE = 'active', 'Activa'
    RESTRICTED = 'restricted', 'Restringida'
    DISABLED = 'disabled', 'Deshabilitada'


class PaymentStatus(models.TextChoices):
    """
    Estados posibles de un pago.
    
    - PENDING: Pago creado pero no procesado
    - PROCESSING: Pago en proceso
    - SUCCEEDED: Pago completado exitosamente
    - FAILED: Pago fallido
    - REFUNDED: Pago reembolsado
    - CANCELLED: Pago cancelado
    """
    PENDING = 'pending', 'Pendiente'
    PROCESSING = 'processing', 'Procesando'
    SUCCEEDED = 'succeeded', 'Exitoso'
    FAILED = 'failed', 'Fallido'
    REFUNDED = 'refunded', 'Reembolsado'
    CANCELLED = 'cancelled', 'Cancelado'


class Payment(models.Model):
    """
    Modelo para gestionar pagos del marketplace con Stripe Connect.
    
    Cada pago está asociado a un pedido (Order) y a un artesano (ArtisanProfile).
    El monto total se divide entre el artesano y la comisión del marketplace.
    
    Flow:
    1. Se crea un Payment al iniciar el checkout
    2. Se calcula la comisión del marketplace
    3. Se crea un PaymentIntent en Stripe
    4. El cliente paga a través de Stripe
    5. Webhook confirma el pago y actualiza el estado
    6. Se transfiere el monto al artesano (automático con transfer_data)
    """
    
    # Relaciones
    order = models.OneToOneField(
        'orders.Order',
        on_delete=models.PROTECT,
        related_name='payment',
        verbose_name='Pedido',
        help_text='Pedido asociado a este pago'
    )
    
    artisan = models.ForeignKey(
        'accounts.User',
        on_delete=models.PROTECT,
        related_name='payments',
        limit_choices_to={'role': 'artisan'},
        verbose_name='Artesano',
        help_text='Artesano que recibe el pago (desnormalizado para queries)'
    )
    
    # Montos (en EUR)
    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name='Monto total',
        help_text='Monto total en EUR'
    )
    
    marketplace_fee = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name='Comisión marketplace',
        help_text='Comisión del marketplace en EUR'
    )
    
    artisan_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name='Monto artesano',
        help_text='Monto para el artesano en EUR'
    )
    
    # Estado del pago
    status = models.CharField(
        max_length=20,
        choices=PaymentStatus.choices,
        default=PaymentStatus.PENDING,
        verbose_name='Estado',
        help_text='Estado actual del pago'
    )
    
    # IDs de Stripe
    stripe_payment_intent_id = models.CharField(
        max_length=255,
        unique=True,
        blank=True,
        null=True,
        verbose_name='PaymentIntent ID',
        help_text='ID del PaymentIntent en Stripe'
    )
    
    stripe_charge_id = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        verbose_name='Charge ID',
        help_text='ID del Charge en Stripe'
    )
    
    stripe_transfer_id = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        verbose_name='Transfer ID',
        help_text='ID del Transfer al artesano'
    )
    
    # Mensajes de error
    failure_message = models.TextField(
        blank=True,
        null=True,
        verbose_name='Mensaje de error',
        help_text='Mensaje de error si el pago falló'
    )
    
    # Metadata adicional
    metadata = models.JSONField(
        default=dict,
        blank=True,
        verbose_name='Metadata',
        help_text='Metadata adicional del pago'
    )
    
    # Timestamps
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Fecha de creación'
    )
    
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name='Última actualización'
    )
    
    paid_at = models.DateTimeField(
        blank=True,
        null=True,
        verbose_name='Fecha de pago',
        help_text='Fecha cuando se completó el pago'
    )
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Pago'
        verbose_name_plural = 'Pagos'
        indexes = [
            models.Index(fields=['order']),
            models.Index(fields=['artisan']),
            models.Index(fields=['status']),
            models.Index(fields=['stripe_payment_intent_id']),
            models.Index(fields=['-created_at']),
        ]
    
    def __str__(self) -> str:
        return f"Payment {self.order.order_number} - {self.formatted_amount}"
    
    @property
    def formatted_amount(self) -> str:
        """Retorna el monto total formateado."""
        return f"{self.amount} EUR"
    
    @property
    def formatted_marketplace_fee(self) -> str:
        """Retorna la comisión del marketplace formateada."""
        return f"{self.marketplace_fee} EUR"
    
    @property
    def formatted_artisan_amount(self) -> str:
        """Retorna el monto del artesano formateado."""
        return f"{self.artisan_amount} EUR"
    
    def calculate_fees(self, marketplace_fee_percent: Decimal = None) -> None:
        """
        Calcula la comisión del marketplace y el monto para el artesano.
        
        Args:
            marketplace_fee_percent: Porcentaje de comisión (default: settings.MARKETPLACE_FEE_PERCENT)
        
        Example:
            >>> payment = Payment(amount=Decimal('100.00'))
            >>> payment.calculate_fees(marketplace_fee_percent=Decimal('10.0'))
            >>> payment.marketplace_fee
            Decimal('10.00')
            >>> payment.artisan_amount
            Decimal('90.00')
        """
        if marketplace_fee_percent is None:
            marketplace_fee_percent = settings.MARKETPLACE_FEE_PERCENT
        
        # Calcular comisión del marketplace
        self.marketplace_fee = (self.amount * marketplace_fee_percent) / Decimal('100')
        
        # Calcular monto para el artesano
        self.artisan_amount = self.amount - self.marketplace_fee

