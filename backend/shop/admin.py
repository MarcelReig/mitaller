"""
Configuración del admin de Django para la app shop.
Define la interfaz de administración para productos.
"""
from django.contrib import admin
from .models import Product


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    """
    Configuración del admin para el modelo Product.
    
    Características:
    - Vista de lista con información clave del producto
    - Filtros por artesano, categoría, estado y fecha
    - Búsqueda por nombre, descripción y artesano
    - Campos de solo lectura para datos calculados y Stripe
    - Edición rápida de is_active desde la lista
    - Fieldsets organizados por tipo de información
    - Optimización con select_related para queries eficientes
    """
    
    # Campos mostrados en la vista de lista
    list_display = (
        'name',
        'artist',
        'category',
        'price',
        'stock',
        'is_active',
        'is_available',
        'created_at',
    )
    
    # Filtros laterales
    list_filter = (
        'artist',
        'category',
        'is_active',
        'created_at',
    )
    
    # Campos de búsqueda
    search_fields = (
        'name',
        'description',
        'artist__display_name',
    )
    
    # Campos de solo lectura
    readonly_fields = (
        'created_at',
        'updated_at',
        'stripe_product_id',
        'stripe_price_id',
        'is_available',
        'formatted_price',
    )
    
    # Campos editables desde la lista
    list_editable = ('is_active',)
    
    # Organización en fieldsets
    fieldsets = (
        ('Información Básica', {
            'fields': (
                'artist',
                'name',
                'description',
                'category',
            )
        }),
        ('Precio e Inventario', {
            'fields': (
                'price',
                'stock',
                'formatted_price',
                'is_available',
            )
        }),
        ('Imágenes', {
            'fields': (
                'thumbnail_url',
                'images',
            ),
            'description': 'URLs de imágenes almacenadas en Cloudinary'
        }),
        ('Configuración', {
            'fields': ('is_active',)
        }),
        ('Integración Stripe', {
            'fields': (
                'stripe_product_id',
                'stripe_price_id',
            ),
            'classes': ('collapse',),
            'description': 'Información de sincronización con Stripe Connect'
        }),
        ('Metadata', {
            'fields': (
                'created_at',
                'updated_at',
            ),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        """
        Optimiza las queries con select_related para evitar N+1.
        
        Carga de forma anticipada las relaciones necesarias:
        - artist: para mostrar display_name
        - artist__user: para acceder al usuario del artesano
        """
        queryset = super().get_queryset(request)
        return queryset.select_related('artist', 'artist__user')
