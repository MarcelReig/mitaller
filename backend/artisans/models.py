"""
Modelos para la app artisans.
Define perfiles públicos de artesanos con información de taller y ubicación.
"""
from decimal import Decimal
from django.db import models
from django.conf import settings
from django.utils.text import slugify
from django.utils.translation import gettext_lazy as _
from payments.models import StripeAccountStatus
from profiles.models import BaseCreatorProfile


class CraftType(models.TextChoices):
    """
    Tipos de artesanía disponibles en la plataforma.
    Representa las distintas especialidades de los artesanos menorquines.
    """
    CERAMICS = 'ceramics', _('Cerámica')
    JEWELRY = 'jewelry', _('Joyería')
    LEATHER = 'leather', _('Marroquinería')
    TEXTILES = 'textiles', _('Textiles')
    WOOD = 'wood', _('Madera')
    GLASS = 'glass', _('Vidrio')
    OTHER = 'other', _('Otro')


class MenorcaLocation(models.TextChoices):
    """
    Municipios de Menorca donde pueden ubicarse los talleres.
    Incluye los 8 municipios principales de la isla.
    """
    MAO = 'mao', _('Maó')
    CIUTADELLA = 'ciutadella', _('Ciutadella')
    ALAIOR = 'alaior', _('Alaior')
    ES_CASTELL = 'es_castell', _('Es Castell')
    FERRERIES = 'ferreries', _('Ferreries')
    ES_MERCADAL = 'es_mercadal', _('Es Mercadal')
    ES_MIGJORN = 'es_migjorn', _('Es Migjorn Gran')
    SANT_LLUIS = 'sant_lluis', _('Sant Lluís')
    OTHER = 'other', _('Otro')


class ArtisanProfile(BaseCreatorProfile):
    """
    Perfil público de un artesano.
    
    Relación 1:1 con User - solo usuarios con role ARTISAN tienen perfil público.
    Este modelo contiene toda la información que los compradores ven públicamente:
    - Información del taller y especialidad
    - Ubicación en Menorca
    - Biografía y redes sociales
    - Imágenes (avatar y portada)
    - Información de Stripe Connect para pagos
    - Estadísticas públicas (obras, productos)
    
    Hereda de BaseCreatorProfile:
    - slug, bio, avatar, cover_image
    - website, instagram, facebook, twitter
    - city, country
    - created_at, updated_at
    
    Cada artesano tiene una URL única basada en slug: /artesanos/{slug}/
    """
    
    # Relación con User (1:1)
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='artisan_profile',
        verbose_name=_('usuario'),
        help_text=_('Usuario asociado a este perfil de artesano')
    )
    
    # Nombre público (display_name)
    display_name = models.CharField(
        _('nombre público'),
        max_length=150,
        help_text=_('Nombre que aparece públicamente')
    )

    # Descripción corta para hero del perfil
    short_description = models.CharField(
        _('descripción corta'),
        max_length=200,
        blank=True,
        help_text=_('Texto breve que aparece en el hero del perfil (1-2 líneas)')
    )

    # Información del taller (campos específicos de artesanos)
    craft_type = models.CharField(
        _('tipo de artesanía'),
        max_length=20,
        choices=CraftType.choices,
        help_text=_('Especialidad principal del artesano')
    )
    location = models.CharField(
        _('ubicación'),
        max_length=20,
        choices=MenorcaLocation.choices,
        help_text=_('Municipio donde se encuentra el taller')
    )
    
    # Contacto (adicional a los de BaseCreatorProfile)
    phone = models.CharField(
        _('teléfono'),
        max_length=20,
        blank=True,
        null=True,
        help_text=_('Número de teléfono de contacto')
    )

    # Información de envío y recogida
    shipping_cost = models.DecimalField(
        _('coste de envío'),
        max_digits=10,
        decimal_places=2,
        default=Decimal('5.00'),
        help_text=_('Tarifa fija de envío del artesano (EUR)')
    )

    workshop_address = models.TextField(
        _('dirección del taller'),
        blank=True,
        help_text=_('Dirección completa para recogida en taller')
    )

    pickup_instructions = models.TextField(
        _('instrucciones de recogida'),
        blank=True,
        help_text=_('Ej: "Llamar 30min antes de venir"')
    )
    
    # Integración con Stripe Connect
    stripe_account_id = models.CharField(
        _('ID cuenta Stripe'),
        max_length=255,
        blank=True,
        null=True,
        unique=True,
        help_text=_('ID de cuenta Stripe Connect')
    )
    stripe_account_status = models.CharField(
        _('estado cuenta Stripe'),
        max_length=20,
        choices=StripeAccountStatus.choices,
        default=StripeAccountStatus.PENDING,
        help_text=_('Estado de la cuenta Stripe')
    )
    stripe_onboarding_completed = models.BooleanField(
        _('onboarding Stripe completado'),
        default=False,
        help_text=_('Si completó onboarding Stripe')
    )
    stripe_charges_enabled = models.BooleanField(
        _('pagos habilitados'),
        default=False,
        help_text=_('Si puede recibir pagos')
    )
    stripe_payouts_enabled = models.BooleanField(
        _('transferencias habilitadas'),
        default=False,
        help_text=_('Si puede recibir transferencias')
    )
    stripe_onboarding_url = models.TextField(
        _('URL onboarding Stripe'),
        blank=True,
        null=True,
        help_text=_('URL de onboarding Stripe temporal')
    )
    
    # Estadísticas públicas
    total_works = models.IntegerField(
        _('total obras'),
        default=0,
        help_text=_('Número total de obras en portfolio')
    )
    total_products = models.IntegerField(
        _('total productos'),
        default=0,
        help_text=_('Número total de productos en venta')
    )
    
    # Destacado
    is_featured = models.BooleanField(
        _('destacado'),
        default=False,
        help_text=_('Artesano destacado en la página principal')
    )
    
    # Campos heredados de BaseCreatorProfile:
    # - slug, bio, avatar, cover_image
    # - website, instagram, facebook, twitter
    # - city, country
    # - created_at, updated_at
    
    class Meta:
        verbose_name = _('perfil de artesano')
        verbose_name_plural = _('perfiles de artesanos')
        ordering = ['-is_featured', '-created_at']
        indexes = [
            models.Index(fields=['slug']),
            models.Index(fields=['location']),
            models.Index(fields=['craft_type']),
            models.Index(fields=['-is_featured', '-created_at']),
        ]
    
    def __str__(self) -> str:
        """Retorna el nombre público del artesano."""
        return self.display_name
    
    def get_absolute_url(self) -> str:
        """
        Retorna la URL pública del perfil del artesano.
        Ejemplo: /artesanos/juan-ceramista/
        """
        return f'/artesanos/{self.slug}/'
    
    def save(self, *args, **kwargs) -> None:
        """
        Override save para auto-generar slug si no existe.
        El slug se genera a partir del username del usuario.
        """
        if not self.slug:
            # Generar slug base desde username
            base_slug = slugify(self.user.username)
            slug = base_slug
            counter = 1
            
            # Asegurar que el slug sea único
            while ArtisanProfile.objects.filter(slug=slug).exists():
                slug = f'{base_slug}-{counter}'
                counter += 1
            
            self.slug = slug
        
        super().save(*args, **kwargs)
    
    @property
    def full_location(self) -> str:
        """
        Retorna la ubicación completa formateada.
        Ejemplo: "Taller en Maó, Menorca"
        """
        return f'Taller en {self.get_location_display()}, Menorca'
    
    @property
    def can_receive_payments(self) -> bool:
        """
        Verifica si el artesano puede recibir pagos.
        
        Requiere que:
        - stripe_charges_enabled sea True (puede recibir cargos)
        - stripe_payouts_enabled sea True (puede recibir transferencias)
        - stripe_account_status sea ACTIVE
        
        Returns:
            bool: True si puede recibir pagos, False en caso contrario
        """
        return (
            self.stripe_charges_enabled and
            self.stripe_payouts_enabled and
            self.stripe_account_status == StripeAccountStatus.ACTIVE
        )
    
    def needs_stripe_onboarding(self) -> bool:
        """
        Verifica si el artesano necesita completar el onboarding de Stripe.
        
        Returns:
            bool: True si necesita onboarding, False si ya está completo
        """
        return (
            not self.stripe_onboarding_completed or
            self.stripe_account_status != StripeAccountStatus.ACTIVE
        )
