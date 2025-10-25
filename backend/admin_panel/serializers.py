from rest_framework import serializers
from accounts.models import User
from artists.models import ArtistProfile


class AdminArtistSerializer(serializers.ModelSerializer):
    """
    Serializer para gestión admin de artistas.
    Incluye counts y validación de eliminación.
    """
    # Campos de ArtistProfile
    slug = serializers.CharField(source='artist_profile.slug', read_only=True)
    bio = serializers.CharField(source='artist_profile.bio', read_only=True)
    avatar = serializers.URLField(source='artist_profile.avatar', read_only=True)
    cover_image = serializers.URLField(source='artist_profile.cover_image', read_only=True)
    
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
            'created_at', 'updated_at',
            'slug', 'bio', 'avatar', 'cover_image',
            'works_count', 'products_count', 'completed_orders_count',
            'can_be_deleted'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'can_be_deleted']
    
    def get_can_be_deleted(self, obj):
        """Puede eliminarse si no tiene pedidos completados"""
        return getattr(obj, 'completed_orders_count', 0) == 0

