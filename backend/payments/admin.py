"""
Configuración del admin para la app Payments.
"""

from django.contrib import admin
from .models import Payment


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    """
    Admin para gestionar pagos.
    
    Muestra información completa de cada pago incluyendo:
    - Detalles del pedido y artesano
    - Montos (total, comisión, monto artesano)
    - Estado del pago
    - IDs de Stripe para debugging
    - Timestamps y metadata
    
    La mayoría de campos son readonly para preservar integridad.
    Solo el status se puede modificar manualmente en casos especiales.
    """
    
    list_display = [
        'id',
        'order',
        'artisan',
        'amount',
        'marketplace_fee',
        'artisan_amount',
        'status',
        'paid_at',
        'created_at',
    ]
    
    list_filter = [
        'status',
        'artisan',
        'created_at',
        'paid_at',
    ]
    
    search_fields = [
        'order__order_number',
        'artisan__display_name',
        'stripe_payment_intent_id',
        'stripe_charge_id',
    ]
    
    readonly_fields = [
        'order',
        'artisan',
        'amount',
        'marketplace_fee',
        'artisan_amount',
        'formatted_amount',
        'formatted_marketplace_fee',
        'formatted_artisan_amount',
        'stripe_payment_intent_id',
        'stripe_charge_id',
        'stripe_transfer_id',
        'metadata',
        'created_at',
        'updated_at',
        'paid_at',
    ]
    
    fieldsets = [
        (
            'Información del Pedido',
            {
                'fields': [
                    'order',
                    'artisan',
                ]
            }
        ),
        (
            'Montos',
            {
                'fields': [
                    'amount',
                    'marketplace_fee',
                    'artisan_amount',
                    'formatted_amount',
                    'formatted_marketplace_fee',
                    'formatted_artisan_amount',
                ]
            }
        ),
        (
            'Estado del Pago',
            {
                'fields': [
                    'status',
                    'paid_at',
                    'failure_message',
                ]
            }
        ),
        (
            'IDs de Stripe',
            {
                'fields': [
                    'stripe_payment_intent_id',
                    'stripe_charge_id',
                    'stripe_transfer_id',
                ],
                'classes': ['collapse'],
            }
        ),
        (
            'Metadata y Timestamps',
            {
                'fields': [
                    'metadata',
                    'created_at',
                    'updated_at',
                ],
                'classes': ['collapse'],
            }
        ),
    ]
    
    def has_add_permission(self, request):
        """
        No permitir crear pagos manualmente.
        Los pagos se crean solo a través de la API.
        """
        return False
    
    def has_delete_permission(self, request, obj=None):
        """
        No permitir eliminar pagos.
        Preservar registro histórico para auditoría.
        """
        return False

