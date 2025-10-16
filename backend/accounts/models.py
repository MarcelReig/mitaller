from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.db import models
from django.utils.translation import gettext_lazy as _


class UserRole(models.TextChoices):
    """
    Roles disponibles en la plataforma.
    Solo artesanos y admins tienen cuenta - compradores son invitados.
    """
    ARTISAN = 'artisan', _('Artesano')
    ADMIN = 'admin', _('Administrador')


class CustomUserManager(BaseUserManager):
    """
    Manager personalizado para User donde email es el identificador único.
    """
    
    def create_user(self, email, password=None, **extra_fields):
        """
        Crea y guarda un User regular con email y password.
        """
        if not email:
            raise ValueError(_('El email es obligatorio'))
        
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, password=None, **extra_fields):
        """
        Crea y guarda un superuser con role ADMIN y todos los permisos.
        """
        extra_fields.setdefault('role', UserRole.ADMIN)
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_approved', True)  # Admins siempre aprobados
        
        if extra_fields.get('role') != UserRole.ADMIN:
            raise ValueError(_('Superuser debe tener role=ADMIN'))
        if extra_fields.get('is_staff') is not True:
            raise ValueError(_('Superuser debe tener is_staff=True'))
        if extra_fields.get('is_superuser') is not True:
            raise ValueError(_('Superuser debe tener is_superuser=True'))
        
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """
    Custom User model donde email es el identificador principal.
    
    Campos principales:
    - email: Identificador único para login
    - role: ARTISAN o ADMIN
    - is_approved: Los artesanos necesitan aprobación manual para vender
    
    Los compradores NO tienen cuenta (compran como invitados).
    """
    
    # Información básica
    email = models.EmailField(
        _('email'),
        unique=True,
        error_messages={
            'unique': _('Ya existe un usuario con este email'),
        }
    )
    username = models.CharField(
        _('nombre de usuario'),
        max_length=50,
        unique=True,
        help_text=_('Nombre único para la URL del perfil')
    )
    first_name = models.CharField(_('nombre'), max_length=150, blank=True)
    last_name = models.CharField(_('apellidos'), max_length=150, blank=True)
    
    # Role y permisos
    role = models.CharField(
        _('rol'),
        max_length=20,
        choices=UserRole.choices,
        default=UserRole.ARTISAN
    )
    
    # Aprobación manual para artesanos
    is_approved = models.BooleanField(
        _('aprobado'),
        default=False,
        help_text=_('Los artesanos necesitan aprobación manual antes de poder vender.')
    )
    
    # Flags de Django
    is_active = models.BooleanField(_('activo'), default=True)
    is_staff = models.BooleanField(_('staff'), default=False)
    
    # Timestamps
    date_joined = models.DateTimeField(_('fecha de registro'), auto_now_add=True)
    updated_at = models.DateTimeField(_('última actualización'), auto_now=True)
    
    # Configuración del manager y login
    objects = CustomUserManager()
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    
    class Meta:
        verbose_name = _('usuario')
        verbose_name_plural = _('usuarios')
        ordering = ['-date_joined']
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['username']),
            models.Index(fields=['role', 'is_approved']),
        ]
    
    def __str__(self):
        return self.email
    
    def get_full_name(self):
        """Retorna nombre completo del usuario."""
        return f'{self.first_name} {self.last_name}'.strip() or self.email
    
    def get_short_name(self):
        """Retorna nombre corto del usuario."""
        return self.first_name or self.email
    
    @property
    def is_artisan(self):
        """Verifica si el usuario es artesano."""
        return self.role == UserRole.ARTISAN
    
    @property
    def is_admin(self):
        """Verifica si el usuario es admin."""
        return self.role == UserRole.ADMIN
    
    @property
    def can_sell(self):
        """
        Verifica si el usuario puede vender.
        Solo artesanos aprobados o admins pueden vender.
        """
        return (self.is_artisan and self.is_approved) or self.is_admin
    
    def save(self, *args, **kwargs):
        """
        Override save para auto-aprobar admins.
        """
        # Los admins siempre están aprobados
        if self.role == UserRole.ADMIN:
            self.is_approved = True
            self.is_staff = True
        
        super().save(*args, **kwargs)

