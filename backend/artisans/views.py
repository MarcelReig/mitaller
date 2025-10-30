"""
Views para la app artisans.
API pública de solo lectura para perfiles de artesanos.
Incluye endpoint privado para que artesanos editen su perfil.
"""
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from accounts.models import UserRole
from .models import ArtisanProfile
from .serializers import (
    ArtisanProfileSerializer, 
    ArtisanProfileListSerializer,
    ArtisanProfileUpdateSerializer
)


class ArtisanProfileViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet de solo lectura para perfiles de artesanos.
    
    Endpoints públicos:
    - GET /api/v1/artisans/ - Lista todos los artesanos
    - GET /api/v1/artisans/{slug}/ - Detalle de un artesano
    
    Características:
    - Acceso público (sin autenticación requerida)
    - Búsqueda por nombre, bio, tipo de artesanía, ubicación
    - Filtros por craft_type, location, is_featured
    - Ordenamiento por fecha de creación, nombre
    - Artesanos destacados aparecen primero
    - Lookup por slug (no por ID numérico)
    
    Serializers:
    - Lista: ArtisanProfileListSerializer (simplificado)
    - Detalle: ArtisanProfileSerializer (completo)
    """
    
    queryset = ArtisanProfile.objects.all()
    lookup_field = 'slug'
    permission_classes = [AllowAny]
    
    # Filtros y búsqueda
    filter_backends = [
        filters.SearchFilter,
        filters.OrderingFilter,
        DjangoFilterBackend,
    ]
    
    # Campos de búsqueda (búsqueda de texto libre)
    search_fields = [
        'display_name',
        'bio',
        'craft_type',
        'location',
    ]
    
    # Campos de ordenamiento permitidos
    ordering_fields = [
        'created_at',
        'display_name',
    ]
    
    # Ordenamiento por defecto: destacados primero, luego los más recientes
    ordering = ['-is_featured', '-created_at']
    
    # Campos de filtro exacto
    filterset_fields = [
        'craft_type',
        'location',
        'is_featured',
    ]
    
    def get_serializer_class(self):
        """
        Retorna el serializer apropiado según la acción:
        - Lista: serializer simplificado
        - Detalle: serializer completo
        """
        if self.action == 'list':
            return ArtisanProfileListSerializer
        return ArtisanProfileSerializer
    
    def get_queryset(self):
        """
        Optimiza queries con select_related para evitar N+1 queries.
        Pre-carga la relación con User para evitar queries adicionales.
        """
        return super().get_queryset().select_related('user')
    
    @action(
        detail=False, 
        methods=['get', 'patch'],
        permission_classes=[IsAuthenticated],
        url_path='me'
    )
    def me(self, request):
        """
        Endpoint para que un artesano gestione su propio perfil.
        
        GET /api/v1/artisans/me/
        Retorna el perfil del artesano autenticado.
        
        PATCH /api/v1/artisans/me/
        Actualiza el perfil del artesano autenticado.
        Soporta multipart/form-data para upload de imágenes.
        
        Permisos:
        - Usuario debe estar autenticado
        - Usuario debe tener role ARTISAN
        - Usuario debe tener un perfil de artesano creado
        
        Returns:
        - 200: Perfil retornado/actualizado correctamente
        - 403: Usuario no es artesano o no tiene permiso
        - 404: Usuario no tiene perfil de artesano creado
        """
        # Verificar que el usuario es artesano
        if not hasattr(request.user, 'role') or request.user.role != UserRole.ARTISAN:
            return Response(
                {'error': 'Solo los artesanos pueden acceder a este endpoint'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Obtener el perfil del artesano
        try:
            profile = request.user.artisan_profile
        except ArtisanProfile.DoesNotExist:
            return Response(
                {'error': 'No tienes un perfil de artesano creado'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if request.method == 'GET':
            # Retornar perfil completo
            serializer = ArtisanProfileSerializer(profile)
            return Response(serializer.data)
        
        elif request.method == 'PATCH':
            # Actualizar perfil
            serializer = ArtisanProfileUpdateSerializer(
                profile, 
                data=request.data, 
                partial=True
            )
            serializer.is_valid(raise_exception=True)
            serializer.save()
            
            # Retornar perfil actualizado completo
            response_serializer = ArtisanProfileSerializer(profile)
            return Response(response_serializer.data)
    
    @action(
        detail=True,
        methods=['get'],
        permission_classes=[AllowAny],
        url_path='works'
    )
    def works(self, request, slug=None):
        """
        Endpoint para obtener todas las obras de un artesano.
        
        GET /api/v1/artisans/{slug}/works/
        
        Retorna todas las obras del artesano ordenadas por display_order.
        Útil para la página de perfil del artesano donde se muestran
        sus obras en un grid/galería.
        
        Permisos:
        - Público (sin autenticación requerida)
        
        Returns:
        - 200: Lista de obras del artesano
        - 404: Artesano no encontrado
        
        Example:
            GET /api/v1/artisans/juan-ceramista/works/
            [
                {
                    "id": 101,
                    "title": "Vasijas tradicionales",
                    "thumbnail_url": "https://...",
                    "category": "ceramics",
                    "is_featured": false,
                    "display_order": 1
                }
            ]
        """
        # Importar aquí para evitar circular imports
        from works.serializers import WorkListSerializer
        
        # Obtener el artesano por slug
        artisan = self.get_object()
        
        # Obtener solo obras activas del artesano ordenadas
        works = artisan.user.works.filter(is_active=True).order_by('display_order', '-created_at')
        
        # Serializar y retornar
        serializer = WorkListSerializer(works, many=True)
        return Response(serializer.data)

    @action(
        detail=True,
        methods=['get'],
        permission_classes=[AllowAny],
        url_path='products'
    )
    def products(self, request, slug=None):
        """
        Endpoint para obtener productos de un artesano específico.

        GET /api/v1/artisans/{slug}/products/

        Filtros disponibles vía query params:
        - is_active: bool - Filtrar por estado activo
        - is_featured: bool - Filtrar productos destacados
        - category: string - Filtrar por categoría

        Ordenamiento:
        - Destacados primero (is_featured=True)
        - Más recientes primero (created_at desc)

        Permisos:
        - Público (sin autenticación requerida)

        Returns:
        - 200: Lista de productos del artesano
        - 404: Artesano no encontrado

        Example:
            GET /api/v1/artisans/juan-ceramista/products/
            GET /api/v1/artisans/juan-ceramista/products/?is_featured=true
            GET /api/v1/artisans/juan-ceramista/products/?category=ceramics
        """
        # Importar aquí para evitar circular imports
        from shop.serializers import ProductSerializer

        # Obtener el artesano por slug
        artisan_profile = self.get_object()
        artisan_user = artisan_profile.user

        # Filtrar productos del artesano
        products = artisan_user.products.all()

        # Aplicar filtros adicionales desde query params
        is_active = request.query_params.get('is_active')
        if is_active is not None:
            products = products.filter(is_active=is_active.lower() == 'true')

        is_featured = request.query_params.get('is_featured')
        if is_featured is not None:
            products = products.filter(is_featured=is_featured.lower() == 'true')

        category = request.query_params.get('category')
        if category:
            products = products.filter(category=category)

        # Ordenar por destacados primero, luego por fecha
        products = products.order_by('-is_featured', '-created_at')

        # Serializar y retornar
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data)
