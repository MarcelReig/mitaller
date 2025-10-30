"""
Models para el sistema de pedidos.

Define Order (pedido completo con datos del comprador invitado),
OrderItem (línea de pedido con snapshot del producto) y OrderStatus.
"""

from django.db import models
from django.conf import settings
from decimal import Decimal
import random
import string
from datetime import datetime
from shop.models import Product
from payments.models import PaymentStatus


class OrderStatus(models.TextChoices):
    """
    Estados posibles de un pedido.
    
    Flujo típico: PENDING -> PROCESSING -> SHIPPED -> DELIVERED
    Cancelación posible en cualquier momento antes de DELIVERED.
    """
    PENDING = 'pending', 'Pendiente'
    PROCESSING = 'processing', 'Procesando'
    SHIPPED = 'shipped', 'Enviado'
    DELIVERED = 'delivered', 'Entregado'
    CANCELLED = 'cancelled', 'Cancelado'


class Order(models.Model):
    """
    Pedido completo realizado por un comprador invitado.
    
    Los compradores NO necesitan registro - solo proporcionan email y datos
    de envío. Esto reduce fricción y aumenta conversiones.
    
    El order_number se genera automáticamente en formato ORD-YYYYMMDD-XXXXXX
    para facilitar búsqueda y soporte al cliente.
    """
    
    # Identificación única del pedido
    order_number = models.CharField(
        max_length=50,
        unique=True,
        editable=False,
        help_text='Número único de orden generado automáticamente (ORD-YYYYMMDD-XXXXXX)'
    )
    
    # Datos del comprador invitado
    customer_email = models.EmailField(
        help_text='Email del comprador invitado para confirmación y seguimiento'
    )
    customer_name = models.CharField(
        max_length=200,
        help_text='Nombre completo del comprador'
    )
    customer_phone = models.CharField(
        max_length=20,
        blank=True,
        help_text='Teléfono de contacto opcional'
    )
    
    # Dirección de envío
    shipping_address = models.TextField(
        help_text='Dirección de envío completa (calle, número, piso)'
    )
    shipping_city = models.CharField(
        max_length=100,
        help_text='Ciudad o población'
    )
    shipping_postal_code = models.CharField(
        max_length=20,
        help_text='Código postal'
    )
    shipping_country = models.CharField(
        max_length=100,
        default='España',
        help_text='País de envío'
    )
    
    # Estado y totales
    status = models.CharField(
        max_length=20,
        choices=OrderStatus.choices,
        default=OrderStatus.PENDING,
        help_text='Estado actual del pedido'
    )
    payment_status = models.CharField(
        max_length=20,
        choices=PaymentStatus.choices,
        default=PaymentStatus.PENDING,
        help_text='Estado del pago'
    )
    total_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text='Total del pedido en EUR (calculado automáticamente)'
    )
    
    # Notas adicionales
    notes = models.TextField(
        blank=True,
        help_text='Notas adicionales del comprador (ej: instrucciones de entrega)'
    )
    
    # Timestamps
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text='Fecha y hora de creación del pedido'
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        help_text='Última actualización del pedido'
    )
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['order_number']),
            models.Index(fields=['customer_email']),
            models.Index(fields=['status', '-created_at']),
            models.Index(fields=['payment_status']),
        ]
        verbose_name = 'Pedido'
        verbose_name_plural = 'Pedidos'
    
    def __str__(self) -> str:
        return f'Pedido {self.order_number} - {self.customer_name}'
    
    def save(self, *args, **kwargs) -> None:
        """
        Override save para generar order_number automáticamente.
        
        Formato: ORD-YYYYMMDD-XXXXXX donde XXXXXX son 6 caracteres aleatorios
        alfanuméricos en mayúsculas. Esto da ~2 billones de combinaciones por día.
        """
        if not self.order_number:
            # Generar fecha en formato YYYYMMDD
            date_str = datetime.now().strftime('%Y%m%d')
            
            # Generar 6 caracteres aleatorios (A-Z, 0-9)
            random_chars = ''.join(
                random.choices(string.ascii_uppercase + string.digits, k=6)
            )
            
            # Formato final: ORD-20251012-AB12CD
            self.order_number = f'ORD-{date_str}-{random_chars}'
        
        super().save(*args, **kwargs)
    
    @property
    def formatted_total(self) -> str:
        """Retorna el total formateado para display."""
        return f'{self.total_amount} EUR'
    
    @property
    def is_paid(self) -> bool:
        """Verifica si el pedido está pagado."""
        return self.payment_status == PaymentStatus.SUCCEEDED


class OrderItem(models.Model):
    """
    Línea individual dentro de un pedido.
    
    IMPORTANTE: Guarda SNAPSHOT del producto (nombre, precio) en el momento
    de la compra. Esto es crucial porque:
    
    1. El artesano puede cambiar precio/nombre del producto después
    2. Necesitamos registro histórico exacto para facturación
    3. Los totales del pedido deben ser inmutables
    4. Auditoría y cumplimiento legal requieren datos exactos
    
    También mantiene FK al artesano para queries directas de ventas.
    """
    
    # Relaciones
    order = models.ForeignKey(
        'orders.Order',
        on_delete=models.CASCADE,
        related_name='items',
        help_text='Pedido al que pertenece este artículo'
    )
    product = models.ForeignKey(
        'shop.Product',
        on_delete=models.PROTECT,
        related_name='order_items',
        help_text='Producto comprado (PROTECT para mantener historial)'
    )
    artisan = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='sales',
        limit_choices_to={'role': 'artisan'},
        help_text='Artisan seller (denormalized for efficient queries)'
    )
    
    # Snapshot del producto en el momento de compra
    product_name = models.CharField(
        max_length=200,
        help_text='Nombre del producto en el momento de compra (snapshot)'
    )
    product_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text='Precio unitario en el momento de compra (snapshot)'
    )
    
    # Cantidad y cálculos
    quantity = models.PositiveIntegerField(
        default=1,
        help_text='Cantidad de unidades compradas'
    )
    subtotal = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text='Subtotal = precio x cantidad (calculado automáticamente)'
    )
    
    # Timestamp
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text='Fecha y hora de creación del item'
    )
    
    class Meta:
        ordering = ['order', '-created_at']
        indexes = [
            models.Index(fields=['order']),
            models.Index(fields=['artisan', '-created_at']),
            models.Index(fields=['product']),
        ]
        verbose_name = 'Artículo de pedido'
        verbose_name_plural = 'Artículos de pedido'
    
    def __str__(self) -> str:
        return f'{self.quantity}x {self.product_name} (Pedido {self.order.order_number})'
    
    def save(self, *args, **kwargs) -> None:
        """
        Override save para calcular subtotal automáticamente.
        subtotal = product_price * quantity
        """
        self.subtotal = self.product_price * self.quantity
        super().save(*args, **kwargs)
    
    @property
    def formatted_subtotal(self) -> str:
        """Retorna el subtotal formateado para display."""
        return f'{self.subtotal} EUR'

