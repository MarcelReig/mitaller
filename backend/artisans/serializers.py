"""
Serializers para la app artisans.
Maneja la serialización de perfiles de artesanos para la API pública.
"""
from rest_framework import serializers
from .models import ArtisanProfile, CraftType, MenorcaLocation


class ArtisanProfileBasicSerializer(serializers.ModelSerializer):
    """
    Serializer básico para artesanos.
    
    Usado en relaciones nested donde solo necesitamos info mínima
    (ej: en OrderItems para mostrar quién vendió).
    
    Solo incluye campos esenciales para identificar al artesano.
    """
    
    class Meta:
        model = ArtisanProfile
        fields = (
            'id',
            'slug',
            'display_name',
            'avatar',
        )
        read_only_fields = fields


class ArtisanProfileUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer para edición de perfil de artesano.
    
    Usado por artesanos para actualizar su propio perfil.
    Permite editar campos editables excluyendo:
    - user, slug (automáticos)
    - total_works, total_products (calculados por signals)
    - stripe_account_id, stripe_onboarding_completed (solo admin)
    - is_featured (solo admin)
    
    Imágenes: Acepta URLs de Cloudinary (subidas desde frontend).
    Las imágenes se suben a Cloudinary desde el frontend y se envían las URLs.
    """
    
    class Meta:
        model = ArtisanProfile
        fields = (
            'display_name',
            'short_description',
            'bio',
            'craft_type',
            'location',
            'avatar',
            'cover_image',
            'website',
            'instagram',
            'phone',
            'shipping_cost',
            'workshop_address',
            'pickup_instructions',
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


class ArtisanProfileSerializer(serializers.ModelSerializer):
    """
    Serializer completo para perfiles de artesanos.
    
    Usado en vistas de detalle (/artesanos/{slug}/).
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
        model = ArtisanProfile
        fields = (
            'id',
            'user',
            'slug',
            'display_name',
            'short_description',
            'bio',
            'craft_type',
            'location',
            'avatar',
            'cover_image',
            'website',
            'instagram',
            'instagram_url',
            'phone',
            'shipping_cost',
            'workshop_address',
            'pickup_instructions',
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
    
    def get_user(self, obj: ArtisanProfile) -> dict:
        """
        Retorna información básica del usuario asociado.
        Solo campos necesarios para perfil público (sin info sensible).
        """
        return {
            'email': obj.user.email,
            'username': obj.user.username,
        }


class ArtisanProfileListSerializer(serializers.ModelSerializer):
    """
    Serializer simplificado para listados de artesanos.
    
    Usado en vistas de listado (/artesanos/).
    Solo incluye campos esenciales para tarjetas/previews:
    - Identificación básica
    - Imágenes
    - Estadísticas resumidas
    
    Más ligero que ArtisanProfileSerializer para optimizar
    respuestas con múltiples artesanos.
    """
    
    class Meta:
        model = ArtisanProfile
        fields = (
            'slug',
            'display_name',
            'short_description',
            'craft_type',
            'location',
            'avatar',
            'total_works',
            'total_products',
            'is_featured',
        )

