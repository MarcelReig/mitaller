"""
Admin interface para Orders.

Proporciona gestión completa de pedidos con inlines de items,
filtros por estado, búsqueda y edición rápida de estados.
"""

from django.contrib import admin
from .models import Order, OrderItem


class OrderItemInline(admin.TabularInline):
    """
    Inline para mostrar items del pedido dentro del admin de Order.
    
    Permite ver todos los productos comprados directamente en la vista
    del pedido, sin necesidad de navegación adicional.
    """
    
    model = OrderItem
    fields = [
        'product',
        'product_name',
        'product_price',
        'quantity',
        'subtotal',
        'formatted_subtotal',
        'artisan'
    ]
    readonly_fields = ['formatted_subtotal', 'subtotal']
    extra = 0  # No mostrar filas vacías adicionales
    can_delete = False  # No permitir borrar items desde el admin por integridad
    
    def get_queryset(self, request):
        """Optimizar queries con select_related."""
        qs = super().get_queryset(request)
        return qs.select_related('product', 'artisan', 'artisan__user')


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    """
    Admin para gestión de pedidos.
    
    Features:
    - Vista de lista con totales y estados
    - Filtros por estado y fecha
    - Búsqueda por número, nombre, email
    - Edición rápida de estado desde list view
    - Campos readonly para datos críticos
    - Inline de items para ver productos
    """
    
    list_display = [
        'order_number',
        'customer_name',
        'customer_email',
        'status',
        'total_amount',
        'formatted_total',
        'created_at'
    ]
    
    list_filter = [
        'status',
        'created_at',
        'shipping_country'
    ]
    
    search_fields = [
        'order_number',
        'customer_name',
        'customer_email',
        'customer_phone'
    ]
    
    readonly_fields = [
        'order_number',
        'total_amount',
        'formatted_total',
        'created_at',
        'updated_at'
    ]
    
    # Permitir cambio rápido de estado desde list view
    list_editable = ['status']
    
    # Organización en fieldsets para mejor UX
    fieldsets = (
        ('Información del Pedido', {
            'fields': (
                'order_number',
                'status',
                'created_at',
                'updated_at'
            )
        }),
        ('Datos del Cliente', {
            'fields': (
                'customer_email',
                'customer_name',
                'customer_phone'
            )
        }),
        ('Dirección de Envío', {
            'fields': (
                'shipping_address',
                'shipping_city',
                'shipping_postal_code',
                'shipping_country'
            )
        }),
        ('Totales', {
            'fields': (
                'total_amount',
                'formatted_total'
            )
        }),
        ('Notas', {
            'fields': ('notes',),
            'classes': ('collapse',)  # Colapsado por defecto
        })
    )
    
    inlines = [OrderItemInline]
    
    # Paginación
    list_per_page = 50
    
    def get_queryset(self, request):
        """
        Optimizar queries con prefetch_related para evitar N+1.
        
        Carga de forma eficiente todos los items y sus relaciones
        (producto y artesano) en una sola query.
        """
        qs = super().get_queryset(request)
        return qs.prefetch_related(
            'items',
            'items__product',
            'items__artisan',
            'items__artisan__user'
        )


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    """
    Admin para gestión individual de items de pedido.
    
    Útil para análisis de ventas, auditoría y soporte.
    Permite filtrar por artesano y ver detalles de cada venta.
    """
    
    list_display = [
        'order',
        'artisan',
        'product_name',
        'quantity',
        'product_price',
        'subtotal',
        'created_at'
    ]
    
    list_filter = [
        'artisan',
        'order__status',
        'created_at'
    ]
    
    search_fields = [
        'order__order_number',
        'product_name',
        'artisan__display_name',
        'artisan__user__email'
    ]
    
    readonly_fields = [
        'subtotal',
        'formatted_subtotal',
        'created_at'
    ]
    
    # Organización de campos
    fieldsets = (
        ('Pedido', {
            'fields': ('order',)
        }),
        ('Producto (Snapshot)', {
            'fields': (
                'product',
                'product_name',
                'product_price',
                'quantity'
            ),
            'description': 'Estos campos son snapshot del momento de compra'
        }),
        ('Artesano', {
            'fields': ('artisan',)
        }),
        ('Cálculos', {
            'fields': (
                'subtotal',
                'formatted_subtotal',
                'created_at'
            )
        })
    )
    
    list_per_page = 100
    
    def get_queryset(self, request):
        """Optimizar queries con select_related."""
        qs = super().get_queryset(request)
        return qs.select_related(
            'order',
            'product',
            'artisan',
            'artisan__user'
        )

