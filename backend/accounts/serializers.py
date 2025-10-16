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


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer para representación de datos de usuario.
    Usado en perfiles y respuestas de autenticación.
    """
    can_sell = serializers.SerializerMethodField()
    
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
            'date_joined',
        )
        read_only_fields = (
            'id',
            'role',
            'is_approved',
            'can_sell',
            'date_joined',
        )
    
    def get_can_sell(self, obj: User) -> bool:
        """
        Retorna si el usuario puede vender productos.
        True si es artesano aprobado o admin.
        """
        return obj.can_sell


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Serializer personalizado para login con JWT.
    Además de los tokens, retorna datos del usuario.
    """
    
    def validate(self, attrs: dict) -> dict:
        """
        Valida credenciales y retorna tokens + datos de usuario.
        """
        # Obtener tokens del serializer padre
        data = super().validate(attrs)
        
        # Agregar datos del usuario a la respuesta
        user_data = UserSerializer(self.user).data
        data['user'] = user_data
        
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

