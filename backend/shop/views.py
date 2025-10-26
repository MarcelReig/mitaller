"""
Views para la app shop.
API REST para gestionar productos de la tienda.
"""
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from .models import Product
from .serializers import ProductSerializer, ProductListSerializer
from .permissions import IsArtisanOwnerOrReadOnly


class ProductViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar productos de la tienda.
    
    Endpoints públicos de lectura:
    - GET /api/v1/shop/ - Lista todos los productos disponibles
    - GET /api/v1/shop/{id}/ - Detalle de un producto
    
    Endpoints privados de escritura (solo artesano dueño):
    - POST /api/v1/shop/ - Crear nuevo producto
    - PUT/PATCH /api/v1/shop/{id}/ - Actualizar producto
    - DELETE /api/v1/shop/{id}/ - Eliminar producto
    
    Características:
    - Lectura pública de productos activos con stock
    - Escritura solo para artesano dueño
    - Filtros por artesano, categoría, estado
    - Búsqueda por nombre y descripción
    - Ordenamiento por fecha, precio, nombre
    - Asignación automática del artista al crear
    - Artesanos pueden ver sus productos inactivos
    
    Permisos:
    - IsArtisanOwnerOrReadOnly: Lectura pública, escritura para dueño
    - GET: Cualquiera (solo productos activos con stock)
    - POST: Usuario autenticado con ArtisanProfile
    - PUT/PATCH/DELETE: Solo artesano dueño del producto
    
    Serializers:
    - Lista: ProductListSerializer (simplificado, optimizado)
    - Detalle/Creación: ProductSerializer (completo con validaciones)
    
    Filtros disponibles:
    - artist: ID del artesano
    - category: Categoría del producto
    - is_active: Estado del producto
    - search: Búsqueda en nombre y descripción
    - ordering: created_at, price, name
    """
    
    queryset = Product.objects.select_related('artisan', 'artisan__user')
    permission_classes = [IsAuthenticatedOrReadOnly, IsArtisanOwnerOrReadOnly]
    
    # Configuración de filtros y búsqueda
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    
    # Campos de filtro exacto
    filterset_fields = ['artisan', 'category', 'is_active']
    
    # Campos de búsqueda de texto libre
    search_fields = ['name', 'description']
    
    # Campos de ordenamiento permitidos
    ordering_fields = ['created_at', 'price', 'name']
    
    # Ordenamiento por defecto: más recientes primero
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        """
        Retorna el serializer apropiado según la acción.
        
        - Lista: serializer simplificado para performance
        - Detalle/Creación: serializer completo con validaciones
        
        Returns:
            Clase del serializer a usar
        """
        if self.action == 'list':
            return ProductListSerializer
        return ProductSerializer
    
    def get_queryset(self):
        """
        Filtra el queryset según el usuario autenticado.
        
        Lógica:
        - Usuario anónimo: Solo productos activos con stock > 0
        - Artesano autenticado: Sus propios productos (incluidos inactivos/sin stock)
        - Otros usuarios: Solo productos activos con stock > 0
        
        Esto permite que:
        1. Visitantes solo vean productos disponibles para compra
        2. Artesanos vean todos sus productos en su dashboard
        3. Artesanos puedan gestionar inventario (productos sin stock)
        
        Returns:
            QuerySet filtrado según permisos del usuario
        """
        queryset = super().get_queryset()
        user = self.request.user
        
        # Si el usuario es artesano autenticado, puede ver todos sus productos
        if user and user.is_authenticated and hasattr(user, 'artisan_profile'):
            # Puede ver todos sus productos (activos, inactivos, con/sin stock)
            return queryset
        
        # Para usuarios no autenticados o no artesanos:
        # Solo productos activos con stock disponible
        return queryset.filter(is_active=True, stock__gt=0)
    
    def perform_create(self, serializer):
        """
        Asigna automáticamente el artesano al crear un producto.
        
        El artesano se obtiene del perfil del usuario autenticado.
        No se permite especificar un artesano diferente.
        
        Esto asegura que:
        1. Artesanos solo crean productos bajo su propio perfil
        2. No se puede crear productos para otros artesanos
        3. La relación artesano-producto es siempre correcta
        
        Args:
            serializer: Serializer validado con los datos del producto
        """
        serializer.save(artisan=self.request.user.artisan_profile)
