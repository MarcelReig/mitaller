"""
Modelos para la app artists (artistas).
Define perfiles de artistas para futura implementación.
"""
from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from profiles.models import BaseCreatorProfile


class ArtistProfile(BaseCreatorProfile):
    """
    Perfil de Artista (visual/performing artist).
    Para personas que crean arte: pintura, escultura, música, danza, etc.
    
    Hereda de BaseCreatorProfile:
    - slug, bio, avatar, cover_image
    - website, instagram, facebook, twitter
    - city, country
    - created_at, updated_at
    """
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='artist_profile',
        verbose_name=_('usuario'),
        help_text=_('Usuario asociado a este perfil de artista')
    )
    
    # Campos específicos de artistas
    discipline = models.CharField(
        _('disciplina'),
        max_length=50,
        choices=[
            ('painting', _('Pintura')),
            ('sculpture', _('Escultura')),
            ('photography', _('Fotografía')),
            ('digital_art', _('Arte Digital')),
            ('music', _('Música')),
            ('dance', _('Danza')),
            ('theater', _('Teatro')),
            ('performance', _('Performance')),
            ('mixed_media', _('Técnica Mixta')),
            ('other', _('Otro')),
        ],
        blank=True,
        help_text=_('Disciplina artística principal')
    )
    
    # Historial profesional
    exhibition_history = models.TextField(
        _('historial de exposiciones'),
        blank=True,
        help_text=_('Exposiciones y eventos en los que ha participado')
    )
    awards = models.TextField(
        _('premios'),
        blank=True,
        help_text=_('Premios y reconocimientos recibidos')
    )
    
    # Disponibilidad para servicios
    available_for_commissions = models.BooleanField(
        _('disponible para encargos'),
        default=False,
        help_text=_('Acepta encargos personalizados')
    )
    available_for_events = models.BooleanField(
        _('disponible para eventos'),
        default=False,
        help_text=_('Disponible para eventos (conciertos, actuaciones)')
    )
    
    # Precio base (orientativo)
    base_price_range = models.CharField(
        _('rango de precios base'),
        max_length=50,
        blank=True,
        help_text=_('Ejemplo: €500-€2000')
    )
    
    class Meta:
        verbose_name = _('Artist Profile')
        verbose_name_plural = _('Artist Profiles')
    
    def __str__(self):
        return f"Artist: {self.user.username}"


