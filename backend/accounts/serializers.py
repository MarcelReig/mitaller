"""
Serializers para la app accounts.
Maneja registro, login y gestión de perfiles de usuario.
"""
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth import authenticate
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User, UserRole
import re


class RegisterSerializer(serializers.ModelSerializer):
    """
    Serializer para registro de nuevos usuarios (artesanos).
    
    Los artesanos se registran con is_approved=False y necesitan
    aprobación manual de un admin antes de poder vender.
    """
    password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )
    password_confirm = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )
    
    class Meta:
        model = User
        fields = (
            'email',
            'username',
            'password',
            'password_confirm',
            'first_name',
            'last_name',
        )
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name': {'required': True},
        }
    
    def validate_email(self, value: str) -> str:
        """
        Valida que el email sea único.
        """
        if User.objects.filter(email=value.lower()).exists():
            raise serializers.ValidationError(
                'Ya existe un usuario registrado con este email.'
            )
        return value.lower()
    
    def validate_username(self, value: str) -> str:
        """
        Valida que el username sea único y slug-friendly.
        Solo permite letras, números, guiones y guiones bajos.
        """
        # Validar formato slug-friendly
        if not re.match(r'^[a-zA-Z0-9_-]+$', value):
            raise serializers.ValidationError(
                'El nombre de usuario solo puede contener letras, números, '
                'guiones (-) y guiones bajos (_).'
            )
        
        # Validar unicidad
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError(
                'Este nombre de usuario ya está en uso.'
            )
        
        return value
    
    def validate_password(self, value: str) -> str:
        """
        Valida que la contraseña cumpla los requisitos de seguridad:
        - Mínimo 8 caracteres
        - Al menos 1 letra
        - Al menos 1 número
        """
        if len(value) < 8:
            raise serializers.ValidationError(
                'La contraseña debe tener al menos 8 caracteres.'
            )
        
        if not re.search(r'[a-zA-Z]', value):
            raise serializers.ValidationError(
                'La contraseña debe contener al menos una letra.'
            )
        
        if not re.search(r'\d', value):
            raise serializers.ValidationError(
                'La contraseña debe contener al menos un número.'
            )
        
        return value
    
    def validate(self, attrs: dict) -> dict:
        """
        Valida que las contraseñas coincidan.
        """
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({
                'password_confirm': 'Las contraseñas no coinciden.'
            })
        
        return attrs
    
    def create(self, validated_data: dict) -> User:
        """
        Crea un nuevo usuario artesano.
        
        Por defecto:
        - role = ARTISAN
        - is_approved = False (necesita aprobación manual)
        - password hasheado con set_password()
        """
        # Eliminar password_confirm (no se guarda en BD)
        validated_data.pop('password_confirm')
        
        # Extraer password para procesarlo
        password = validated_data.pop('password')
        
        # Crear usuario con role ARTISAN por defecto
        user = User(
            role=UserRole.ARTISAN,
            is_approved=False,
            **validated_data
        )
        
        # Hashear password
        user.set_password(password)
        user.save()
        
        return user
    
    def to_representation(self, instance: User) -> dict:
        """
        Personaliza la respuesta para excluir el password.
        """
        return UserSerializer(instance).data


class ArtistProfileBasicSerializer(serializers.Serializer):
    """
    Serializer básico para el perfil de artista anidado en UserSerializer.
    Solo incluye campos esenciales para el frontend.
    """
    id = serializers.IntegerField()
    slug = serializers.CharField()
    display_name = serializers.CharField()
    avatar = serializers.URLField(allow_null=True)
    craft_type = serializers.CharField()
    location = serializers.CharField()
    bio = serializers.CharField(allow_null=True)
    is_featured = serializers.BooleanField()
    stripe_account_status = serializers.CharField()


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer para representación de datos de usuario.
    Usado en perfiles y respuestas de autenticación.
    """
    can_sell = serializers.SerializerMethodField()
    has_artist_profile = serializers.SerializerMethodField()
    artist_slug = serializers.SerializerMethodField()
    artist_profile = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = (
            'id',
            'email',
            'username',
            'first_name',
            'last_name',
            'role',
            'is_approved',
            'is_active',
            'can_sell',
            'has_artist_profile',
            'artist_slug',
            'artist_profile',
            'date_joined',
        )
        read_only_fields = (
            'id',
            'role',
            'is_approved',
            'can_sell',
            'has_artist_profile',
            'artist_slug',
            'artist_profile',
            'date_joined',
        )
    
    def get_can_sell(self, obj: User) -> bool:
        """
        Retorna si el usuario puede vender productos.
        True si es artesano aprobado o admin.
        """
        return obj.can_sell
    
    def get_has_artist_profile(self, obj: User) -> bool:
        """
        Retorna si el usuario tiene un ArtistProfile asociado.
        """
        return hasattr(obj, 'artist_profile')
    
    def get_artist_slug(self, obj: User) -> str | None:
        """
        Retorna el slug del perfil de artista si existe.
        """
        if hasattr(obj, 'artist_profile'):
            return obj.artist_profile.slug
        return None
    
    def get_artist_profile(self, obj: User) -> dict | None:
        """
        Retorna el perfil completo del artista si existe.
        Incluye avatar para mostrar en el navbar.
        """
        if hasattr(obj, 'artist_profile'):
            profile = obj.artist_profile
            return ArtistProfileBasicSerializer(profile).data
        return None


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Serializer personalizado para login con JWT.
    Además de los tokens, retorna datos del usuario.
    
    Usa 'email' como campo de identificación (en lugar de 'username').
    """
    # Cambiar el nombre del campo de username a email
    username_field = User.USERNAME_FIELD
    
    def validate(self, attrs: dict) -> dict:
        """
        Valida credenciales y retorna tokens + datos de usuario.
        """
        # DEBUG: Log para ver qué credenciales se están validando
        import logging
        logger = logging.getLogger(__name__)
        email = attrs.get(self.username_field, 'NO_EMAIL')
        logger.info(f"[LOGIN] Intentando autenticar usuario con email: {email}")
        
        # Obtener tokens del serializer padre
        data = super().validate(attrs)
        
        # El usuario autenticado está disponible en self.user después de super().validate()
        logger.info(f"[LOGIN] Usuario autenticado: {self.user.email} (ID: {self.user.id})")
        
        # Optimizar query para cargar artist_profile si existe
        from .models import User
        user_with_profile = User.objects.select_related('artist_profile').get(id=self.user.id)
        
        # Agregar datos del usuario a la respuesta (con artist_profile incluido)
        user_data = UserSerializer(user_with_profile).data
        data['user'] = user_data
        
        # DEBUG: Verificar que el usuario sea el correcto
        logger.info(f"[LOGIN] Datos del usuario en respuesta: email={user_data.get('email')}, id={user_data.get('id')}")
        
        return data


class LoginSerializer(serializers.Serializer):
    """
    Serializer para login (alternativa simple).
    Valida email y password, retorna user y tokens.
    """
    email = serializers.EmailField(required=True)
    password = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )
    
    def validate(self, attrs: dict) -> dict:
        """
        Valida las credenciales del usuario.
        """
        email = attrs.get('email', '').lower()
        password = attrs.get('password')
        
        if not email or not password:
            raise serializers.ValidationError(
                'Debes proporcionar email y contraseña.'
            )
        
        # Autenticar usuario
        user = authenticate(
            request=self.context.get('request'),
            username=email,  # USERNAME_FIELD es email
            password=password
        )
        
        if not user:
            raise serializers.ValidationError(
                'Credenciales inválidas. Verifica tu email y contraseña.'
            )
        
        if not user.is_active:
            raise serializers.ValidationError(
                'Esta cuenta ha sido desactivada.'
            )
        
        attrs['user'] = user
        return attrs

