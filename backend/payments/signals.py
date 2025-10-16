"""
Signals para la app Payments.

Gestiona las actualizaciones automáticas cuando cambia el estado de un pago.
"""

from django.db.models.signals import post_save
from django.dispatch import receiver
import logging

from .models import Payment, PaymentStatus
from orders.models import OrderStatus


logger = logging.getLogger(__name__)


@receiver(post_save, sender=Payment)
def update_order_on_payment_change(sender, instance, created, **kwargs):
    """
    Actualiza el Order cuando el Payment cambia de estado.
    
    Cuando un pago se marca como SUCCEEDED:
    - Actualiza Order.payment_status a SUCCEEDED
    - Si el Order estaba en PENDING, lo cambia a PROCESSING
    
    Args:
        sender: Model class (Payment)
        instance: Instancia de Payment que se guardó
        created: True si es un nuevo Payment
        **kwargs: Argumentos adicionales
    """
    # Solo actuar cuando el pago se marca como exitoso
    if instance.status == PaymentStatus.SUCCEEDED:
        order = instance.order
        
        # Actualizar payment_status del order
        if order.payment_status != PaymentStatus.SUCCEEDED:
            order.payment_status = PaymentStatus.SUCCEEDED
            
            # Si el order estaba pendiente, cambiar a procesando
            if order.status == OrderStatus.PENDING:
                order.status = OrderStatus.PROCESSING
                logger.info(
                    f"Order {order.order_number} moved to PROCESSING after payment"
                )
            
            order.save()
            
            logger.info(
                f"Order {order.order_number} payment_status updated to SUCCEEDED"
            )
    
    # Actualizar también cuando falla
    elif instance.status == PaymentStatus.FAILED:
        order = instance.order
        
        if order.payment_status != PaymentStatus.FAILED:
            order.payment_status = PaymentStatus.FAILED
            order.save()
            
            logger.warning(
                f"Order {order.order_number} payment_status updated to FAILED"
            )

