"""
Works Serializers
Serializers para crear/actualizar/leer obras
"""

from rest_framework import serializers
from .models import Work


class ArtistMinimalSerializer(serializers.Serializer):
    """
    Serializer mínimo para artista (solo info necesaria en obras)
    """
    id = serializers.IntegerField(read_only=True)
    slug = serializers.CharField(read_only=True)
    display_name = serializers.CharField(read_only=True)
    avatar = serializers.CharField(read_only=True, allow_null=True)


class WorkListSerializer(serializers.ModelSerializer):
    """
    Serializer ligero para listar obras (sin artista).
    Usado en listados públicos de obras de un artesano.
    
    Usado en: GET /api/v1/artists/{slug}/works/
    """
    total_images = serializers.SerializerMethodField()
    
    class Meta:
        model = Work
        fields = [
            'id',
            'title',
            'description',
            'category',
            'is_featured',
            'thumbnail_url',
            'images',
            'display_order',
            'total_images',
            'created_at',
            'updated_at',
        ]
    
    def get_total_images(self, obj):
        """
        Calcular número total de imágenes en la obra
        """
        return len(obj.images) if obj.images else 0


class WorkDetailSerializer(serializers.ModelSerializer):
    """
    Serializer para lectura de obras.
    Incluye información del artista y campos calculados.
    
    Usado en: GET /api/v1/works/ y GET /api/v1/works/{id}/
    """
    artist = ArtistMinimalSerializer(read_only=True)
    total_images = serializers.SerializerMethodField()
    
    class Meta:
        model = Work
        fields = [
            'id',
            'title',
            'description',
            'category',
            'is_featured',
            'is_active',
            'thumbnail_url',
            'images',
            'display_order',
            'total_images',
            'created_at',
            'updated_at',
            'artist',
        ]
        read_only_fields = [
            'id', 
            'created_at', 
            'updated_at', 
            'display_order', 
            'artist',
            'is_active'
        ]
    
    def get_total_images(self, obj):
        """
        Calcular número total de imágenes en la obra
        """
        return len(obj.images) if obj.images else 0


class WorkCreateUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer para crear/actualizar obras.
    Incluye validaciones estrictas.
    
    Usado en: POST /api/v1/works/ y PUT /api/v1/works/{id}/
    """
    
    class Meta:
        model = Work
        fields = [
            'title',
            'description',
            'category',
            'is_featured',
            'thumbnail_url',
            'images',
        ]
        extra_kwargs = {
            'title': {
                'required': True,
                'max_length': 200,
                'trim_whitespace': True
            },
            'description': {
                'required': False,
                'allow_blank': True,
                'trim_whitespace': True
            },
            'category': {
                'required': False,
                'allow_null': True
            },
            'is_featured': {
                'required': False,
                'default': False
            },
            'thumbnail_url': {
                'required': False,
                'allow_null': True,
                'allow_blank': True
            },
            'images': {
                'required': False,
                'default': list
            },
        }
    
    def validate_title(self, value):
        """
        Validar título:
        - No vacío
        - Mínimo 3 caracteres
        - Máximo 200 caracteres
        """
        if not value or not value.strip():
            raise serializers.ValidationError("El título no puede estar vacío")
        
        value = value.strip()
        
        if len(value) < 3:
            raise serializers.ValidationError(
                "El título debe tener al menos 3 caracteres"
            )
        
        if len(value) > 200:
            raise serializers.ValidationError(
                "El título no puede exceder 200 caracteres"
            )
        
        return value
    
    def validate_description(self, value):
        """
        Validar descripción:
        - Opcional
        - Máximo 2000 caracteres
        """
        if value and len(value) > 2000:
            raise serializers.ValidationError(
                "La descripción no puede exceder 2000 caracteres"
            )
        
        return value.strip() if value else ""
    
    def validate_images(self, value):
        """
        Validar array de imágenes:
        - Debe ser un array
        - Máximo 20 imágenes
        - Todas deben ser URLs válidas
        """
        if not isinstance(value, list):
            raise serializers.ValidationError("'images' debe ser un array")
        
        if len(value) > 20:
            raise serializers.ValidationError("Máximo 20 imágenes por obra")
        
        # Validar que sean URLs válidas
        for url in value:
            if not isinstance(url, str):
                raise serializers.ValidationError(
                    "Todas las imágenes deben ser strings (URLs)"
                )
            
            if not url.startswith(('http://', 'https://')):
                raise serializers.ValidationError(f"URL inválida: {url}")
        
        return value
    
    def validate(self, data):
        """
        Validaciones a nivel de objeto:
        - Si no hay thumbnail_url, usar primera imagen
        - Si no hay imágenes, thumbnail_url debe ser proporcionado
        """
        images = data.get('images', [])
        thumbnail_url = data.get('thumbnail_url')
        
        # Si no hay thumbnail pero sí imágenes, usar la primera
        if not thumbnail_url and images:
            data['thumbnail_url'] = images[0]
        
        # Si no hay ni thumbnail ni imágenes, error
        if not thumbnail_url and not images:
            raise serializers.ValidationError(
                "Debes proporcionar al menos una imagen o un thumbnail_url"
            )
        
        return data
