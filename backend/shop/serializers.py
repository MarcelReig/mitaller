"""
Serializers para la app shop.
Maneja la serialización de productos para la API REST.
"""
from rest_framework import serializers
from .models import Product, ProductCategory


class ProductSerializer(serializers.ModelSerializer):
    """
    Serializer completo para productos de la tienda.
    
    Usado en vistas de detalle y creación/edición de productos.
    Incluye validación de imágenes, precio, stock y representación anidada del artesano.
    
    El artesano se muestra con información básica para contexto,
    pero no es editable (se asigna automáticamente al crear).
    
    Validaciones implementadas:
    - images: Lista de URLs válidas, máximo 10 imágenes
    - price: Debe ser mayor que 0
    - stock: Debe ser mayor o igual a 0
    """
    
    # Artesano anidado con información básica (solo lectura)
    artisan = serializers.SerializerMethodField()
    
    # Campos calculados (propiedades del modelo)
    is_available = serializers.ReadOnlyField()
    formatted_price = serializers.ReadOnlyField()
    
    class Meta:
        model = Product
        fields = (
            'id',
            'artisan',
            'name',
            'description',
            'category',
            'price',
            'stock',
            'thumbnail_url',
            'images',
            'is_active',
            'is_available',
            'formatted_price',
            'created_at',
            'updated_at',
        )
        read_only_fields = (
            'id',
            'artisan',
            'is_available',
            'formatted_price',
            'created_at',
            'updated_at',
        )
    
    def get_artisan(self, obj: Product) -> dict:
        """
        Retorna información básica del artesano asociado.
        Incluye datos necesarios para mostrar el perfil del artesano.
        
        Args:
            obj: Instancia de Product
            
        Returns:
            dict: Información básica del artesano
        """
        try:
            artisan_profile = obj.artisan.artisan_profile
            return {
                'id': artisan_profile.id,
                'slug': artisan_profile.slug,
                'display_name': artisan_profile.display_name,
                'avatar': artisan_profile.avatar if artisan_profile.avatar else None,
            }
        except Exception:
            return {
                'id': obj.artisan.id,
                'slug': obj.artisan.username,
                'display_name': obj.artisan.username,
                'avatar': None,
            }
    
    def validate_images(self, value):
        """
        Valida el campo images (galería adicional).
        
        Validaciones:
        1. Debe ser una lista (JSONField)
        2. Cada elemento debe ser una string (URL)
        3. Cada URL debe tener formato válido (http:// o https://)
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
    
    def validate_price(self, value):
        """
        Valida que el precio sea mayor que 0.
        
        Args:
            value: Precio a validar
            
        Returns:
            Precio validado
            
        Raises:
            ValidationError: Si el precio es 0 o negativo
        """
        if value <= 0:
            raise serializers.ValidationError(
                'El precio debe ser mayor que 0'
            )
        return value
    
    def validate_stock(self, value):
        """
        Valida que el stock sea mayor o igual a 0.
        
        Args:
            value: Stock a validar
            
        Returns:
            Stock validado
            
        Raises:
            ValidationError: Si el stock es negativo
        """
        if value < 0:
            raise serializers.ValidationError(
                'El stock no puede ser negativo'
            )
        return value


class ProductListSerializer(serializers.ModelSerializer):
    """
    Serializer simplificado para listados de productos.
    
    Usado en vistas de listado y tienda pública.
    Solo incluye campos esenciales para tarjetas/previews de productos:
    - Identificación básica
    - Imagen principal
    - Precio y stock
    - Disponibilidad
    
    Más ligero que ProductSerializer para optimizar respuestas
    con múltiples productos.
    """
    
    # Campo calculado
    is_available = serializers.ReadOnlyField()
    
    class Meta:
        model = Product
        fields = (
            'id',
            'name',
            'thumbnail_url',
            'category',
            'price',
            'stock',
            'is_available',
        )

