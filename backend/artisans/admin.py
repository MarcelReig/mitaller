"""
Configuración del admin para la app artisans.
Gestión de perfiles de artesanos desde el panel de administración.
"""
from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from .models import ArtisanProfile


@admin.register(ArtisanProfile)
class ArtisanProfileAdmin(admin.ModelAdmin):
    """
    Admin para gestionar perfiles de artesanos.
    
    Funcionalidades:
    - Visualización de info clave en listado
    - Filtros por tipo de artesanía, ubicación, destacados
    - Búsqueda por nombre, email, username
    - Campos readonly para slug, timestamps y estadísticas
    - Acciones para destacar/quitar destaque de artesanos
    """
    
    # Columnas en el listado
    list_display = (
        'display_name',
        'user',
        'craft_type',
        'location',
        'is_featured',
        'total_works',
        'total_products',
        'created_at',
    )
    
    # Filtros laterales
    list_filter = (
        'craft_type',
        'location',
        'is_featured',
        'stripe_onboarding_completed',
    )
    
    # Búsqueda
    search_fields = (
        'display_name',
        'user__email',
        'user__username',
        'slug',
    )
    
    # Campos de solo lectura
    readonly_fields = (
        'slug',
        'created_at',
        'updated_at',
        'total_works',
        'total_products',
        'stripe_account_id',
    )
    
    # Organización en fieldsets
    fieldsets = (
        (_('Información Básica'), {
            'fields': (
                'user',
                'display_name',
                'slug',
            )
        }),
        (_('Taller'), {
            'fields': (
                'craft_type',
                'location',
                'bio',
            )
        }),
        (_('Imágenes'), {
            'fields': (
                'avatar',
                'cover_image',
            )
        }),
        (_('Contacto y Redes'), {
            'fields': (
                'website',
                'instagram',
                'phone',
            )
        }),
        (_('Stripe'), {
            'fields': (
                'stripe_account_id',
                'stripe_onboarding_completed',
            ),
            'description': _('Información de integración con Stripe Connect')
        }),
        (_('Estadísticas'), {
            'fields': (
                'total_works',
                'total_products',
                'is_featured',
            )
        }),
        (_('Metadata'), {
            'fields': (
                'created_at',
                'updated_at',
            ),
            'classes': ('collapse',)
        }),
    )
    
    # Acciones personalizadas
    actions = ['make_featured', 'remove_featured']
    
    @admin.action(description=_('Destacar artesanos seleccionados'))
    def make_featured(self, request, queryset):
        """
        Marca los artesanos seleccionados como destacados.
        Los artesanos destacados aparecen primero en listados públicos.
        """
        updated = queryset.update(is_featured=True)
        self.message_user(
            request,
            _(f'{updated} artesano(s) marcado(s) como destacado(s).')
        )
    
    @admin.action(description=_('Quitar destaque de artesanos seleccionados'))
    def remove_featured(self, request, queryset):
        """
        Quita el destaque de los artesanos seleccionados.
        """
        updated = queryset.update(is_featured=False)
        self.message_user(
            request,
            _(f'{updated} artesano(s) ya no están destacado(s).')
        )
    
    def get_queryset(self, request):
        """
        Optimiza queries con select_related para evitar N+1 queries.
        """
        qs = super().get_queryset(request)
        return qs.select_related('user')
