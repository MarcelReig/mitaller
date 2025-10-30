"""
Modelos para la app shop (tienda de productos).
Define productos artesanales disponibles para compra con precio y stock.

Diferencia clave entre Works y Products:
- Work: Portfolio visual, obras destacadas para mostrar talento (NO genera ingresos)
  * Muestra el talento y técnica del artesano
  * Sin precio ni stock
  * Función: Atraer clientes y mostrar capacidades
  
- Product: Productos reales para venta con precio y stock (SÍ genera ingresos)
  * Listados en la tienda pública
  * Con precio, stock y gestión de inventario
  * Integración con Stripe Connect para pagos
  * Función: Generar ventas e ingresos reales

Ejemplo:
- Work: "Jarrón de cerámica azul - Técnica de gres" (portfolio, sin venta)
- Product: "Tazas de cerámica esmaltada - Pack de 4" (23.50€, stock: 12)
"""
from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from decimal import Decimal


class ProductCategory(models.TextChoices):
    """
    Categorías de productos artesanales disponibles en la tienda.
    Representa los distintos tipos de productos que los artesanos pueden vender.
    """
    CERAMICS = 'ceramics', _('Cerámica')
    JEWELRY = 'jewelry', _('Joyería')
    LEATHER = 'leather', _('Marroquinería')
    TEXTILES = 'textiles', _('Textiles')
    WOOD = 'wood', _('Madera')
    GLASS = 'glass', _('Vidrio')
    HOME_DECOR = 'home_decor', _('Decoración Hogar')
    ACCESSORIES = 'accessories', _('Accesorios')
    OTHER = 'other', _('Otro')


class Product(models.Model):
    """
    Producto artesanal disponible para compra en la tienda.
    
    A diferencia de Work (portfolio), Product representa un artículo real
    disponible para venta con:
    - Precio en EUR
    - Stock disponible
    - Integración con Stripe Connect para pagos
    - Gestión de inventario
    
    Cada producto pertenece a un artesano (ArtistProfile).
    Solo el artesano dueño puede crear/editar/eliminar sus productos.
    Los productos se muestran públicamente si están activos y tienen stock.
    
    Imágenes almacenadas en Cloudinary como URLs (no ImageField):
    - Razón: Mayor flexibilidad, independencia del servidor Django
    - thumbnail_url: Imagen principal del producto
    - images: Lista de URLs adicionales para galería completa
    - Beneficios: CDN, transformaciones on-the-fly, no consume storage Django
    
    Integración Stripe Connect:
    - stripe_product_id: ID del producto en Stripe
    - stripe_price_id: ID del precio en Stripe
    - Permite cobros directos a cuenta del artesano (marketplace model)
    """
    
    # Relationship with artisan user
    artisan = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='products',
        limit_choices_to={'role': 'artisan'},
        verbose_name=_('artesano'),
        help_text=_('Artisan seller of this product')
    )
    
    # Información básica del producto
    name = models.CharField(
        _('nombre'),
        max_length=200,
        help_text=_('Nombre del producto')
    )
    
    description = models.TextField(
        _('descripción'),
        blank=True,
        help_text=_('Descripción detallada del producto, materiales, dimensiones, etc.')
    )
    
    category = models.CharField(
        _('categoría'),
        max_length=20,
        choices=ProductCategory.choices,
        help_text=_('Categoría del producto artesanal')
    )
    
    # Precio e inventario
    price = models.DecimalField(
        _('precio'),
        max_digits=10,
        decimal_places=2,
        help_text=_('Precio en EUR')
    )
    
    stock = models.PositiveIntegerField(
        _('stock'),
        default=0,
        help_text=_('Cantidad disponible en inventario')
    )
    
    # Imágenes (Cloudinary)
    # Usamos URLField en lugar de ImageField por:
    # 1. Las imágenes ya están en Cloudinary (CDN externo)
    # 2. No necesitamos almacenarlas en el servidor Django
    # 3. Mayor flexibilidad para transformaciones (resize, crop, format)
    # 4. No consume storage del servidor
    # 5. URLs permanentes y accesibles globalmente
    thumbnail_url = models.URLField(
        _('URL imagen principal'),
        max_length=500,
        help_text=_('URL de imagen principal almacenada en Cloudinary')
    )
    
    images = models.JSONField(
        _('URLs galería'),
        default=list,
        blank=True,
        help_text=_('Lista de URLs de imágenes adicionales almacenadas en Cloudinary')
    )
    
    # Configuración y visibilidad
    is_active = models.BooleanField(
        _('activo'),
        default=True,
        help_text=_('Producto visible y disponible en la tienda')
    )

    is_featured = models.BooleanField(
        _('destacado'),
        default=False,
        help_text=_('Producto destacado por el artesano')
    )

    pickup_available = models.BooleanField(
        _('recogida disponible'),
        default=True,
        help_text=_('Permite recoger en taller')
    )
    
    # Integración con Stripe Connect
    stripe_product_id = models.CharField(
        _('ID producto Stripe'),
        max_length=100,
        blank=True,
        null=True,
        help_text=_('ID del producto en Stripe (ej: prod_xxx)')
    )
    
    stripe_price_id = models.CharField(
        _('ID precio Stripe'),
        max_length=100,
        blank=True,
        null=True,
        help_text=_('ID del precio en Stripe (ej: price_xxx)')
    )
    
    # Timestamps
    created_at = models.DateTimeField(
        _('fecha de creación'),
        auto_now_add=True
    )
    
    updated_at = models.DateTimeField(
        _('última actualización'),
        auto_now=True
    )
    
    class Meta:
        verbose_name = _('Producto')
        verbose_name_plural = _('Productos')
        # Ordenar por destacados primero, luego más recientes
        ordering = ['-is_featured', '-created_at']
        indexes = [
            # Índice para filtros por artesano y estado
            models.Index(fields=['artisan', 'is_active']),
            # Índice para filtros por artesano y categoría
            models.Index(fields=['artisan', 'category']),
            # Índice para listados públicos (activos, recientes primero)
            models.Index(fields=['is_active', '-created_at']),
            # Índice para productos destacados
            models.Index(fields=['is_featured', '-created_at']),
            # Índice para productos destacados de un artesano
            models.Index(fields=['artisan', 'is_featured', '-created_at']),
        ]
    
    def __str__(self) -> str:
        """Returns readable representation of the product."""
        artisan_name = self.artisan.get_full_name() or self.artisan.username
        return f'{artisan_name} - {self.name}'
    
    @property
    def is_available(self) -> bool:
        """
        Indica si el producto está disponible para compra.
        
        Un producto está disponible si:
        1. Está activo (is_active=True)
        2. Tiene stock disponible (stock > 0)
        
        Uso:
        - Filtrar productos en tienda pública
        - Mostrar badge "Disponible" o "Agotado" en UI
        - Habilitar/deshabilitar botón de compra
        
        Returns:
            bool: True si está disponible para compra, False si no
        """
        return self.is_active and self.stock > 0
    
    @property
    def formatted_price(self) -> str:
        """
        Retorna el precio formateado para mostrar en UI.
        
        Formato: "23.50 EUR"
        
        Returns:
            str: Precio formateado con símbolo de moneda
        """
        return f'{self.price} EUR'
