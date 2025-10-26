"""
Modelos base abstractos para perfiles de creadores.
Define campos comunes compartidos entre Artesanos y Artistas.
"""
from django.db import models
from django.utils.translation import gettext_lazy as _


class BaseCreatorProfile(models.Model):
    """
    Modelo abstracto base para Artistas y Artesanos.
    Contiene campos comunes a ambos perfiles creadores.
    
    Este modelo NO crea tabla en la base de datos (abstract=True).
    ArtisanProfile y ArtistProfile heredan estos campos automáticamente.
    """
    
    # Identificación pública
    slug = models.SlugField(
        _('slug'),
        max_length=100,
        unique=True,
        help_text=_('URL única del creador')
    )
    
    # Información básica
    bio = models.TextField(
        _('biografía'),
        blank=True,
        help_text=_('Descripción del creador y su trabajo')
    )
    
    # Imágenes (almacenadas en Cloudinary)
    avatar = models.URLField(
        _('avatar'),
        max_length=500,
        blank=True,
        null=True,
        help_text=_('URL de foto de perfil almacenada en Cloudinary')
    )
    cover_image = models.URLField(
        _('imagen de portada'),
        max_length=500,
        blank=True,
        null=True,
        help_text=_('URL de imagen de portada almacenada en Cloudinary')
    )
    
    # Redes sociales
    website = models.URLField(
        _('sitio web'),
        blank=True,
        help_text=_('URL del sitio web personal')
    )
    instagram = models.CharField(
        _('instagram'),
        max_length=100,
        blank=True,
        help_text=_('Usuario de Instagram (sin @)')
    )
    facebook = models.CharField(
        _('facebook'),
        max_length=100,
        blank=True,
        help_text=_('Usuario de Facebook')
    )
    twitter = models.CharField(
        _('twitter'),
        max_length=100,
        blank=True,
        help_text=_('Usuario de Twitter (sin @)')
    )
    
    # Ubicación
    city = models.CharField(
        _('ciudad'),
        max_length=100,
        blank=True,
        help_text=_('Ciudad donde reside o trabaja')
    )
    country = models.CharField(
        _('país'),
        max_length=100,
        default='España',
        help_text=_('País de residencia')
    )
    
    # Metadatos
    created_at = models.DateTimeField(
        _('fecha de creación'),
        auto_now_add=True
    )
    updated_at = models.DateTimeField(
        _('última actualización'),
        auto_now=True
    )
    
    class Meta:
        abstract = True  # IMPORTANTE: No crea tabla en BD
    
    def __str__(self):
        return self.slug
    
    @property
    def instagram_url(self):
        """Retorna la URL completa de Instagram si existe."""
        if self.instagram:
            return f'https://instagram.com/{self.instagram}'
        return None
    
    @property
    def facebook_url(self):
        """Retorna la URL completa de Facebook si existe."""
        if self.facebook:
            return f'https://facebook.com/{self.facebook}'
        return None
    
    @property
    def twitter_url(self):
        """Retorna la URL completa de Twitter si existe."""
        if self.twitter:
            return f'https://twitter.com/{self.twitter}'
        return None
