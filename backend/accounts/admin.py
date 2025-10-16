from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _
from .models import User, UserRole


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """
    Admin personalizado para el modelo User.
    Optimizado para gestionar artesanos y sus aprobaciones.
    """
    
    # Campos que se muestran en la lista de usuarios
    list_display = [
        'email',
        'username',
        'first_name', 
        'last_name', 
        'role', 
        'is_approved', 
        'is_active',
        'date_joined'
    ]
    
    # Filtros en el sidebar
    list_filter = [
        'role', 
        'is_approved', 
        'is_active', 
        'is_staff',
        'date_joined'
    ]
    
    # Campos de búsqueda
    search_fields = ['email', 'username', 'first_name', 'last_name']
    
    # Ordenamiento por defecto
    ordering = ['-date_joined']
    
    # Campos de solo lectura
    readonly_fields = ['date_joined', 'updated_at', 'last_login']
    
    # Acciones personalizadas
    actions = ['approve_artisans', 'disapprove_artisans']
    
    # Configuración de los fieldsets (formulario de edición)
    fieldsets = (
        (_('Información de login'), {
            'fields': ('email', 'username', 'password')
        }),
        (_('Información personal'), {
            'fields': ('first_name', 'last_name')
        }),
        (_('Permisos y rol'), {
            'fields': ('role', 'is_approved', 'is_active', 'is_staff', 'is_superuser')
        }),
        (_('Grupos y permisos'), {
            'fields': ('groups', 'user_permissions'),
            'classes': ('collapse',)  # Colapsado por defecto
        }),
        (_('Fechas importantes'), {
            'fields': ('last_login', 'date_joined', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    # Fieldsets para crear nuevo usuario
    add_fieldsets = (
        (_('Credenciales'), {
            'fields': ('email', 'username', 'password1', 'password2'),
        }),
        (_('Información personal'), {
            'fields': ('first_name', 'last_name'),
        }),
        (_('Rol y permisos'), {
            'fields': ('role', 'is_approved', 'is_active'),
            'description': _('Los artesanos necesitan aprobación manual. Los admins se aprueban automáticamente.')
        }),
    )
    
    # Acciones personalizadas
    @admin.action(description=_('✅ Aprobar artesanos seleccionados'))
    def approve_artisans(self, request, queryset):
        """Aprueba los artesanos seleccionados para que puedan vender."""
        artisans = queryset.filter(role=UserRole.ARTISAN)
        updated = artisans.update(is_approved=True)
        self.message_user(
            request,
            _(f'{updated} artesano(s) aprobado(s) correctamente.'),
            level='success'
        )
    
    @admin.action(description=_('❌ Desaprobar artesanos seleccionados'))
    def disapprove_artisans(self, request, queryset):
        """Desaprueba artesanos (no podrán vender hasta nueva aprobación)."""
        artisans = queryset.filter(role=UserRole.ARTISAN)
        updated = artisans.update(is_approved=False)
        self.message_user(
            request,
            _(f'{updated} artesano(s) desaprobado(s).'),
            level='warning'
        )

