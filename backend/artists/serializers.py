"""
Serializers para la app artists.
Maneja la serialización de perfiles de artesanos para la API pública.
"""
from rest_framework import serializers
from .models import ArtistProfile, CraftType, MenorcaLocation


class ArtistProfileBasicSerializer(serializers.ModelSerializer):
    """
    Serializer básico para artesanos.
    
    Usado en relaciones nested donde solo necesitamos info mínima
    (ej: en OrderItems para mostrar quién vendió).
    
    Solo incluye campos esenciales para identificar al artesano.
    """
    
    class Meta:
        model = ArtistProfile
        fields = (
            'id',
            'slug',
            'display_name',
            'avatar',
        )
        read_only_fields = fields


class ArtistProfileUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer para edición de perfil de artesano.
    
    Usado por artesanos para actualizar su propio perfil.
    Permite editar campos editables excluyendo:
    - user, slug (automáticos)
    - total_works, total_products (calculados por signals)
    - stripe_account_id, stripe_onboarding_completed (solo admin)
    - is_featured (solo admin)
    
    Soporta upload de imágenes (avatar, cover_image).
    """
    
    class Meta:
        model = ArtistProfile
        fields = (
            'display_name',
            'bio',
            'craft_type',
            'location',
            'avatar',
            'cover_image',
            'website',
            'instagram',
            'facebook',
            'phone',
        )
    
    def validate_instagram(self, value):
        """
        Valida que el usuario de Instagram no incluya @ ni URL.
        Solo el username simple.
        """
        if value and ('@' in value or '/' in value):
            raise serializers.ValidationError(
                'Ingresa solo el nombre de usuario, sin @ ni URL'
            )
        return value


class ArtistProfileSerializer(serializers.ModelSerializer):
    """
    Serializer completo para perfiles de artesanos.
    
    Usado en vistas de detalle (/artistas/{slug}/).
    Incluye toda la información pública del artesano:
    - Datos básicos del usuario
    - Información del taller
    - Redes sociales y contacto
    - Estadísticas
    - URLs calculadas (Instagram, perfil)
    """
    
    # Usuario anidado con información básica
    user = serializers.SerializerMethodField()
    
    # Properties calculadas del modelo
    instagram_url = serializers.ReadOnlyField()
    full_location = serializers.ReadOnlyField()
    
    class Meta:
        model = ArtistProfile
        fields = (
            'id',
            'user',
            'slug',
            'display_name',
            'bio',
            'craft_type',
            'location',
            'avatar',
            'cover_image',
            'website',
            'instagram',
            'facebook',
            'instagram_url',
            'full_location',
            'total_works',
            'total_products',
            'is_featured',
            'created_at',
        )
        read_only_fields = (
            'id',
            'slug',
            'user',
            'total_works',
            'total_products',
            'created_at',
            'instagram_url',
            'full_location',
        )
    
    def get_user(self, obj: ArtistProfile) -> dict:
        """
        Retorna información básica del usuario asociado.
        Solo campos necesarios para perfil público (sin info sensible).
        """
        return {
            'email': obj.user.email,
            'username': obj.user.username,
        }


class ArtistProfileListSerializer(serializers.ModelSerializer):
    """
    Serializer simplificado para listados de artesanos.
    
    Usado en vistas de listado (/artistas/).
    Solo incluye campos esenciales para tarjetas/previews:
    - Identificación básica
    - Imágenes
    - Estadísticas resumidas
    
    Más ligero que ArtistProfileSerializer para optimizar
    respuestas con múltiples artesanos.
    """
    
    class Meta:
        model = ArtistProfile
        fields = (
            'slug',
            'display_name',
            'craft_type',
            'location',
            'avatar',
            'total_works',
            'total_products',
            'is_featured',
        )

