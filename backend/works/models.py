"""
Modelos para la app works (portfolio de obras).
Define las obras artísticas que los artesanos muestran en su portfolio público.

Diferencia clave:
- Work: Portfolio visual, obras destacadas para mostrar talento (NO venta directa)
- Product (shop): Productos disponibles para compra con precio y stock
"""
from django.db import models
from django.utils.translation import gettext_lazy as _
from artists.models import ArtistProfile


class WorkCategory(models.TextChoices):
    """
    Categorías de obras artísticas.
    Representa los distintos tipos de trabajos que puede mostrar un artesano.
    """
    CERAMICS = 'ceramics', _('Cerámica')
    JEWELRY = 'jewelry', _('Joyería')
    LEATHER = 'leather', _('Marroquinería')
    TEXTILES = 'textiles', _('Textiles')
    WOOD = 'wood', _('Madera')
    GLASS = 'glass', _('Vidrio')
    SCULPTURE = 'sculpture', _('Escultura')
    PAINTING = 'painting', _('Pintura')
    OTHER = 'other', _('Otro')


class Work(models.Model):
    """
    Obra artística en el portfolio de un artesano.
    
    Portfolio público (NO venta directa - para eso está shop.Product).
    Permite a los artesanos mostrar su trabajo, técnicas y proceso creativo.
    
    Cada obra pertenece a un artesano (ArtistProfile).
    Las obras se muestran en el perfil público del artesano.
    Soporta reordenamiento mediante display_order (drag & drop en frontend).
    
    Imágenes almacenadas en Cloudinary:
    - thumbnail_url: Imagen principal/miniatura
    - images: Lista de URLs adicionales para galería completa
    """
    
    # Relación con el artesano
    artist = models.ForeignKey(
        ArtistProfile,
        on_delete=models.CASCADE,
        related_name='works',
        verbose_name=_('artesano'),
        help_text=_('Artesano creador de esta obra')
    )
    
    # Información básica
    title = models.CharField(
        _('título'),
        max_length=200,
        help_text=_('Título de la obra')
    )
    
    description = models.TextField(
        _('descripción'),
        blank=True,
        help_text=_('Descripción detallada de la obra, técnica, materiales, proceso, etc.')
    )
    
    category = models.CharField(
        _('categoría'),
        max_length=20,
        choices=WorkCategory.choices,
        blank=True,
        null=True,
        help_text=_('Categoría o tipo de obra artística')
    )
    
    # Imágenes (Cloudinary)
    thumbnail_url = models.URLField(
        _('imagen principal'),
        max_length=500,
        help_text=_('URL de imagen principal almacenada en Cloudinary')
    )
    
    images = models.JSONField(
        _('galería de imágenes'),
        default=list,
        blank=True,
        help_text=_('Lista de URLs de imágenes adicionales almacenadas en Cloudinary')
    )
    
    # Ordenamiento y destacado
    display_order = models.IntegerField(
        _('orden de visualización'),
        default=0,
        help_text=_('Orden de visualización en el portfolio (menor = primero). Permite drag & drop.')
    )
    
    is_featured = models.BooleanField(
        _('destacada'),
        default=False,
        help_text=_('Obra destacada que aparece prominentemente en el perfil')
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
        verbose_name = _('Obra')
        verbose_name_plural = _('Obras')
        # Ordenar por artista, luego por display_order, luego más recientes primero
        ordering = ['artist', 'display_order', '-created_at']
        indexes = [
            # Índice para búsquedas por artista y orden
            models.Index(fields=['artist', 'display_order']),
            # Índice para filtros por categoría
            models.Index(fields=['category']),
            # Índice para obras destacadas
            models.Index(fields=['is_featured', '-created_at']),
        ]
    
    def __str__(self) -> str:
        """Retorna representación legible de la obra."""
        return f'{self.artist.display_name} - {self.title}'
    
    def save(self, *args, **kwargs) -> None:
        """
        Override save para auto-calcular display_order si no está establecido.
        
        Si display_order es 0 (valor por defecto), calcula automáticamente
        el siguiente orden disponible basado en las obras existentes del mismo artesano.
        Esto asegura que nuevas obras se agreguen al final del portfolio.
        """
        if self.display_order == 0:
            # Obtener el max display_order actual para este artesano
            max_order = Work.objects.filter(artist=self.artist).aggregate(
                models.Max('display_order')
            )['display_order__max']
            
            # Si hay obras existentes, siguiente orden = max + 1, sino = 1
            self.display_order = (max_order or 0) + 1
        
        super().save(*args, **kwargs)
    
    @property
    def total_images(self) -> int:
        """
        Retorna el número total de imágenes (thumbnail + galería).
        Útil para mostrar contador en UI.
        """
        return 1 + len(self.images) if isinstance(self.images, list) else 1
