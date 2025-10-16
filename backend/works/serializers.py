"""
Serializers para la app works.
Maneja la serialización de obras para la API REST.
"""
from rest_framework import serializers
from .models import Work, WorkCategory


class WorkSerializer(serializers.ModelSerializer):
    """
    Serializer completo para obras del portfolio.
    
    Usado en vistas de detalle y creación/edición de obras.
    Incluye validación de imágenes y representación anidada del artesano.
    
    El artista se muestra con información básica para contexto,
    pero no es editable (se asigna automáticamente al crear).
    """
    
    # Artista anidado con información básica (solo lectura)
    artist = serializers.SerializerMethodField()
    
    # Campo calculado para número total de imágenes
    total_images = serializers.ReadOnlyField()
    
    class Meta:
        model = Work
        fields = (
            'id',
            'artist',
            'title',
            'description',
            'category',
            'thumbnail_url',
            'images',
            'display_order',
            'is_featured',
            'total_images',
            'created_at',
            'updated_at',
        )
        read_only_fields = (
            'id',
            'artist',
            'total_images',
            'created_at',
            'updated_at',
        )
    
    def get_artist(self, obj: Work) -> dict:
        """
        Retorna información básica del artesano asociado.
        Incluye datos necesarios para mostrar el perfil del artesano.
        """
        return {
            'id': obj.artist.id,
            'slug': obj.artist.slug,
            'display_name': obj.artist.display_name,
            'avatar': obj.artist.avatar.url if obj.artist.avatar else None,
        }
    
    def validate_images(self, value):
        """
        Valida el campo images (galería adicional).
        
        Validaciones:
        1. Debe ser una lista (JSONField)
        2. Cada elemento debe ser una string (URL)
        3. Cada URL debe tener formato válido
        4. Limitar a máximo 10 imágenes adicionales
        
        Args:
            value: Lista de URLs de imágenes
            
        Returns:
            Lista validada de URLs
            
        Raises:
            ValidationError: Si la validación falla
        """
        # Verificar que sea una lista
        if not isinstance(value, list):
            raise serializers.ValidationError(
                'El campo images debe ser una lista de URLs'
            )
        
        # Verificar cada elemento
        for i, url in enumerate(value):
            # Verificar que sea string
            if not isinstance(url, str):
                raise serializers.ValidationError(
                    f'El elemento {i} debe ser una URL válida (string)'
                )
            
            # Verificar formato de URL básico
            if not url.startswith(('http://', 'https://')):
                raise serializers.ValidationError(
                    f'El elemento {i} debe ser una URL válida que comience con http:// o https://'
                )
        
        # Limitar número de imágenes adicionales
        if len(value) > 10:
            raise serializers.ValidationError(
                'Máximo 10 imágenes adicionales permitidas en la galería'
            )
        
        return value
    
    def validate_thumbnail_url(self, value):
        """
        Valida que la URL del thumbnail sea válida.
        """
        if not value:
            raise serializers.ValidationError(
                'La imagen principal es requerida'
            )
        
        if not value.startswith(('http://', 'https://')):
            raise serializers.ValidationError(
                'Debe ser una URL válida que comience con http:// o https://'
            )
        
        return value


class WorkListSerializer(serializers.ModelSerializer):
    """
    Serializer simplificado para listados de obras.
    
    Usado en vistas de listado y portfolio del artesano.
    Solo incluye campos esenciales para tarjetas/previews:
    - Identificación básica
    - Imagen principal
    - Categoría y estado destacado
    
    Más ligero que WorkSerializer para optimizar respuestas
    con múltiples obras.
    """
    
    class Meta:
        model = Work
        fields = (
            'id',
            'title',
            'thumbnail_url',
            'category',
            'is_featured',
            'display_order',
        )


class WorkReorderSerializer(serializers.Serializer):
    """
    Serializer para el endpoint de reordenamiento de obras.
    
    Usado en la acción custom 'reorder' para actualizar
    el orden de visualización mediante drag & drop.
    
    Recibe una lista de IDs en el nuevo orden deseado.
    """
    
    work_ids = serializers.ListField(
        child=serializers.IntegerField(min_value=1),
        min_length=1,
        help_text='Lista de IDs de obras en el nuevo orden deseado'
    )
    
    def validate_work_ids(self, value):
        """
        Valida que todos los IDs sean únicos.
        """
        if len(value) != len(set(value)):
            raise serializers.ValidationError(
                'La lista contiene IDs duplicados'
            )
        return value

