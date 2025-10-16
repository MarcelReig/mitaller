"""
Serializers para la gestión de pagos con Stripe.
"""

from rest_framework import serializers
import stripe
from django.conf import settings
from django.utils import timezone
from decimal import Decimal

from orders.models import Order
from .models import Payment, PaymentStatus


# Configurar API key de Stripe
stripe.api_key = settings.STRIPE_SECRET_KEY


class PaymentSerializer(serializers.ModelSerializer):
    """
    Serializer para mostrar información de pagos.
    
    Incluye información anidada del pedido y artesano para evitar
    queries adicionales. Todos los campos son read-only.
    """
    
    # Información anidada del pedido
    order = serializers.SerializerMethodField()
    
    # Información anidada del artesano
    artist = serializers.SerializerMethodField()
    
    # Campos formateados
    formatted_amount = serializers.CharField(read_only=True)
    formatted_marketplace_fee = serializers.CharField(read_only=True)
    formatted_artist_amount = serializers.CharField(read_only=True)
    
    class Meta:
        model = Payment
        fields = [
            'id',
            'order',
            'artist',
            'amount',
            'marketplace_fee',
            'artist_amount',
            'formatted_amount',
            'formatted_marketplace_fee',
            'formatted_artist_amount',
            'status',
            'stripe_payment_intent_id',
            'failure_message',
            'created_at',
            'updated_at',
            'paid_at',
        ]
        read_only_fields = fields
    
    def get_order(self, obj: Payment) -> dict:
        """Retorna información básica del pedido."""
        return {
            'id': obj.order.id,
            'order_number': obj.order.order_number,
            'total_amount': str(obj.order.total_amount),
            'customer_name': obj.order.customer_name,
        }
    
    def get_artist(self, obj: Payment) -> dict:
        """Retorna información básica del artesano."""
        return {
            'id': obj.artist.id,
            'slug': obj.artist.slug,
            'display_name': obj.artist.display_name,
        }


class CheckoutSessionSerializer(serializers.Serializer):
    """
    Serializer para crear una sesión de checkout con Stripe.
    
    Valida que el pedido existe, no está pagado, tiene items,
    y el artesano puede recibir pagos. Luego crea el PaymentIntent
    en Stripe con la comisión del marketplace.
    """
    
    order_id = serializers.IntegerField(
        help_text='ID del pedido a pagar'
    )
    
    def validate_order_id(self, value: int) -> int:
        """
        Valida que el pedido existe y cumple los requisitos para pago.
        
        Verifica:
        - El pedido existe
        - No está ya pagado
        - Tiene al menos un item
        - El artesano puede recibir pagos (tiene Stripe configurado)
        
        Args:
            value: ID del pedido
            
        Returns:
            int: ID del pedido validado
            
        Raises:
            ValidationError: Si alguna validación falla
        """
        # Verificar que el pedido existe
        try:
            order = Order.objects.prefetch_related('items__artist').get(id=value)
        except Order.DoesNotExist:
            raise serializers.ValidationError("El pedido no existe.")
        
        # Verificar que no está ya pagado
        if order.is_paid:
            raise serializers.ValidationError("Este pedido ya está pagado.")
        
        # Verificar que tiene items
        if not order.items.exists():
            raise serializers.ValidationError("El pedido no tiene artículos.")
        
        # Verificar que todos los artesanos pueden recibir pagos
        # NOTA: Asumimos pedidos mono-artesano (todos los items del mismo artesano)
        # Para multi-artesano se necesitaría lógica más compleja con split payments
        artist = order.items.first().artist
        
        if not artist.can_receive_payments:
            raise serializers.ValidationError(
                f"El artesano {artist.display_name} aún no puede recibir pagos. "
                "Debe completar el proceso de verificación en Stripe."
            )
        
        # Guardar el order en el contexto para usarlo en create()
        self.context['order'] = order
        self.context['artist'] = artist
        
        return value
    
    def create(self, validated_data: dict) -> dict:
        """
        Crea un Payment y un PaymentIntent en Stripe.
        
        Flow:
        1. Crear Payment en estado PENDING
        2. Calcular comisión del marketplace
        3. Crear PaymentIntent en Stripe con transfer_data
        4. Guardar stripe_payment_intent_id en Payment
        5. Retornar client_secret para frontend
        
        Args:
            validated_data: Datos validados (order_id)
            
        Returns:
            dict: Contiene payment_intent_id, client_secret, public_key, payment_id
            
        Raises:
            ValidationError: Si falla la creación en Stripe
        """
        order = self.context['order']
        artist = self.context['artist']
        
        # Crear Payment con comisiones calculadas
        payment = Payment(
            order=order,
            artist=artist,
            amount=order.total_amount,
            marketplace_fee=Decimal('0'),  # Temporal
            artist_amount=Decimal('0'),  # Temporal
        )
        
        # Calcular comisiones antes de guardar
        payment.calculate_fees()
        payment.save()
        
        try:
            # Crear PaymentIntent en Stripe
            # amount debe ser en centavos (EUR cents)
            amount_cents = int(payment.amount * 100)
            application_fee_cents = int(payment.marketplace_fee * 100)
            
            payment_intent = stripe.PaymentIntent.create(
                amount=amount_cents,
                currency='eur',
                payment_method_types=['card'],
                
                # Transfer automático al artesano
                transfer_data={
                    'destination': artist.stripe_account_id,
                },
                
                # Comisión del marketplace
                application_fee_amount=application_fee_cents,
                
                # Metadata para tracking
                metadata={
                    'order_id': order.id,
                    'order_number': order.order_number,
                    'artist_id': artist.id,
                    'artist_slug': artist.slug,
                    'marketplace_name': 'MiTaller.art',
                },
            )
            
            # Guardar PaymentIntent ID
            payment.stripe_payment_intent_id = payment_intent.id
            payment.save()
            
            # Retornar datos necesarios para el frontend
            return {
                'payment_intent_id': payment_intent.id,
                'client_secret': payment_intent.client_secret,
                'public_key': settings.STRIPE_PUBLIC_KEY,
                'payment_id': payment.id,
            }
            
        except stripe.error.StripeError as e:
            # Si falla la creación en Stripe, marcar payment como FAILED
            payment.status = PaymentStatus.FAILED
            payment.failure_message = str(e)
            payment.save()
            
            raise serializers.ValidationError(
                f"Error al crear el pago en Stripe: {str(e)}"
            )

