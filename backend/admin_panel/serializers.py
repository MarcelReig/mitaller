from rest_framework import serializers
from accounts.models import User
from artisans.models import ArtisanProfile


class AdminArtisanSerializer(serializers.ModelSerializer):
    """
    Serializer para gestión admin de artesanos.
    Incluye counts y validación de eliminación.
    """
    # Campos de ArtisanProfile
    slug = serializers.CharField(source='artisan_profile.slug', read_only=True)
    bio = serializers.CharField(source='artisan_profile.bio', read_only=True)
    avatar = serializers.URLField(source='artisan_profile.avatar', read_only=True)
    cover_image = serializers.URLField(source='artisan_profile.cover_image', read_only=True)
    is_featured = serializers.BooleanField(source='artisan_profile.is_featured', read_only=True)
    
    # Counts (se agregan via annotate en ViewSet)
    works_count = serializers.IntegerField(read_only=True)
    products_count = serializers.IntegerField(read_only=True)
    completed_orders_count = serializers.IntegerField(read_only=True)
    
    # Validación de eliminación
    can_be_deleted = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'role', 'is_approved',
            'date_joined', 'updated_at',
            'slug', 'bio', 'avatar', 'cover_image', 'is_featured',
            'works_count', 'products_count', 'completed_orders_count',
            'can_be_deleted'
        ]
        read_only_fields = ['id', 'date_joined', 'updated_at', 'can_be_deleted']
    
    def get_can_be_deleted(self, obj):
        """Puede eliminarse si no tiene pedidos completados"""
        return getattr(obj, 'completed_orders_count', 0) == 0

