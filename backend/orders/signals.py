"""
Signals para Orders.

Gestiona restauración de stock cuando se cancelan pedidos o items.
"""

from django.db.models.signals import post_save, post_delete, pre_save
from django.dispatch import receiver
from .models import Order, OrderItem, OrderStatus


@receiver(post_delete, sender=OrderItem)
def restore_stock_on_item_delete(sender, instance: OrderItem, **kwargs) -> None:
    """
    Restaurar stock cuando se elimina un OrderItem.
    
    Esto puede ocurrir cuando:
    - Se cancela el pedido completo (cascade delete)
    - Se elimina un item individual (admin)
    
    Args:
        sender: Modelo emisor (OrderItem)
        instance: OrderItem eliminado
        **kwargs: Argumentos adicionales del signal
    """
    # Restaurar stock al producto
    product = instance.product
    product.stock += instance.quantity
    product.save(update_fields=['stock'])
    
    print(f'✓ Stock restaurado: {instance.quantity}x {product.name} '
          f'(nuevo stock: {product.stock})')


@receiver(pre_save, sender=Order)
def store_previous_status(sender, instance: Order, **kwargs) -> None:
    """
    Guardar estado anterior antes de guardar.
    
    Esto permite detectar cambios de estado en post_save.
    """
    if instance.pk:
        try:
            old_instance = Order.objects.get(pk=instance.pk)
            instance._previous_status = old_instance.status
        except Order.DoesNotExist:
            instance._previous_status = None
    else:
        instance._previous_status = None


@receiver(post_save, sender=Order)
def handle_order_cancellation(sender, instance: Order, created: bool, **kwargs) -> None:
    """
    Manejar cancelación de pedidos.
    
    Cuando un Order cambia a estado CANCELLED, restaura el stock
    de todos los productos en el pedido.
    
    Args:
        sender: Modelo emisor (Order)
        instance: Order guardado
        created: True si es nuevo, False si es actualización
        **kwargs: Argumentos adicionales del signal
    """
    # Solo procesar si cambió de otro estado a CANCELLED
    if (not created and 
        instance.status == OrderStatus.CANCELLED and 
        hasattr(instance, '_previous_status') and
        instance._previous_status != OrderStatus.CANCELLED):
        
        # Restaurar stock de todos los items
        for item in instance.items.all():
            product = item.product
            product.stock += item.quantity
            product.save(update_fields=['stock'])
            
            print(f'✓ Pedido {instance.order_number} cancelado: '
                  f'stock restaurado {item.quantity}x {product.name}')


# Alternativa: Si quieres más control sobre la cancelación
# y no depender del cascade delete
"""
@receiver(post_save, sender=Order)
def restore_stock_on_cancellation(sender, instance: Order, created: bool, **kwargs) -> None:
    '''
    Restaurar stock cuando un pedido se cancela.
    
    Esta versión NO elimina los OrderItems, solo restaura stock.
    Útil para mantener historial completo de cancelaciones.
    '''
    # Solo si no es creación y el estado es CANCELLED
    if not created and instance.status == OrderStatus.CANCELLED:
        # Verificar si el cambio fue a CANCELLED
        try:
            old_instance = Order.objects.get(pk=instance.pk)
            if old_instance.status != OrderStatus.CANCELLED:
                # Restaurar stock de todos los items
                for item in instance.items.all():
                    product = item.product
                    product.stock += item.quantity
                    product.save(update_fields=['stock'])
        except Order.DoesNotExist:
            pass
"""

