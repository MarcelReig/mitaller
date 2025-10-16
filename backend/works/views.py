"""
Views para la app works.
API REST para gestionar obras del portfolio de artesanos.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from django.db import transaction
from .models import Work
from .serializers import WorkSerializer, WorkListSerializer, WorkReorderSerializer
from .permissions import IsArtistOwnerOrReadOnly, IsArtistOwner


class WorkViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar obras del portfolio.
    
    Endpoints públicos de lectura:
    - GET /api/v1/works/ - Lista todas las obras
    - GET /api/v1/works/{id}/ - Detalle de una obra
    
    Endpoints privados de escritura (solo artesano dueño):
    - POST /api/v1/works/ - Crear nueva obra
    - PUT/PATCH /api/v1/works/{id}/ - Actualizar obra
    - DELETE /api/v1/works/{id}/ - Eliminar obra
    - POST /api/v1/works/reorder/ - Reordenar obras (drag & drop)
    
    Características:
    - Lectura pública sin autenticación
    - Escritura solo para artesano dueño
    - Filtros por artista, categoría, destacado
    - Búsqueda por título y descripción
    - Ordenamiento por display_order y fecha
    - Asignación automática del artista al crear
    - Reordenamiento mediante drag & drop
    
    Permisos:
    - IsArtistOwnerOrReadOnly: Lectura pública, escritura para dueño
    - GET: Cualquiera
    - POST: Usuario autenticado con ArtistProfile
    - PUT/PATCH/DELETE: Solo artesano dueño de la obra
    
    Serializers:
    - Lista: WorkListSerializer (simplificado)
    - Detalle/Creación: WorkSerializer (completo)
    """
    
    queryset = Work.objects.select_related('artist', 'artist__user')
    permission_classes = [IsAuthenticatedOrReadOnly, IsArtistOwnerOrReadOnly]
    
    # Configuración de filtros y búsqueda
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    
    # Campos de filtro exacto
    filterset_fields = ['artist', 'category', 'is_featured']
    
    # Campos de búsqueda de texto libre
    search_fields = ['title', 'description']
    
    # Campos de ordenamiento permitidos
    ordering_fields = ['display_order', 'created_at', 'title']
    
    # Ordenamiento por defecto: primero por orden personalizado
    ordering = ['display_order']
    
    def get_serializer_class(self):
        """
        Retorna el serializer apropiado según la acción.
        
        - Lista: serializer simplificado para performance
        - Detalle/Creación: serializer completo con validaciones
        - Reorder: serializer especializado para reordenamiento
        """
        if self.action == 'list':
            return WorkListSerializer
        elif self.action == 'reorder':
            return WorkReorderSerializer
        return WorkSerializer
    
    def get_queryset(self):
        """
        Filtra el queryset según el usuario autenticado.
        
        Lógica:
        - Usuario anónimo: Solo obras públicas
        - Artesano autenticado: Sus propias obras (incluidas privadas/borradores)
        - Otros usuarios: Solo obras públicas
        
        Esto permite que artesanos vean obras en progreso en su dashboard
        mientras mantiene el portfolio público limpio.
        """
        queryset = super().get_queryset()
        user = self.request.user
        
        # Si el usuario es artesano autenticado, puede ver sus propias obras
        if user and user.is_authenticated and hasattr(user, 'artist_profile'):
            # Permitir ver todas sus obras (sin filtro adicional)
            return queryset
        
        # Para usuarios no autenticados o no artesanos, solo obras públicas
        # (En este modelo no hay campo is_published, todas son públicas)
        # Si en el futuro agregas is_published:
        # return queryset.filter(is_published=True)
        return queryset
    
    def perform_create(self, serializer):
        """
        Asigna automáticamente el artista al crear una obra.
        
        El artista se obtiene del perfil del usuario autenticado.
        No se permite especificar un artista diferente.
        
        Esto asegura que:
        1. Artesanos solo crean obras bajo su propio perfil
        2. No se puede crear obras para otros artesanos
        3. La relación artista-obra es siempre correcta
        """
        serializer.save(artist=self.request.user.artist_profile)
    
    @action(
        detail=False,
        methods=['post'],
        permission_classes=[IsAuthenticatedOrReadOnly, IsArtistOwner],
        url_path='reorder'
    )
    def reorder(self, request):
        """
        Endpoint para reordenar obras mediante drag & drop.
        
        POST /api/v1/works/reorder/
        Body: {
            "work_ids": [5, 2, 8, 1, 3]  // IDs en el nuevo orden deseado
        }
        
        Flujo:
        1. Recibe lista de IDs en el nuevo orden
        2. Valida que todos los IDs existan y pertenezcan al artesano
        3. Actualiza display_order de cada obra secuencialmente
        4. Usa transacción para atomicidad (todo o nada)
        
        Casos de uso:
        - Artesano reordena obras en su portfolio (drag & drop)
        - Frontend envía nueva lista ordenada
        - Backend actualiza display_order de todas las obras
        
        Permisos:
        - Solo el artesano dueño puede reordenar sus obras
        - No se puede reordenar obras de otros artesanos
        
        Returns:
            200: Obras reordenadas exitosamente
            400: Lista de IDs inválida o vacía
            403: Usuario no es el dueño de las obras
            404: Algunas obras no existen
        
        Example:
            POST /api/v1/works/reorder/
            {
                "work_ids": [5, 2, 8]
            }
            
            Resultado:
            - Obra ID 5: display_order = 1
            - Obra ID 2: display_order = 2
            - Obra ID 8: display_order = 3
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        work_ids = serializer.validated_data['work_ids']
        artist_profile = request.user.artist_profile
        
        # Obtener todas las obras del artesano con los IDs especificados
        works = Work.objects.filter(
            id__in=work_ids,
            artist=artist_profile
        )
        
        # Verificar que todas las obras existan y pertenezcan al artesano
        if works.count() != len(work_ids):
            return Response(
                {
                    'error': 'Algunos IDs de obras no existen o no te pertenecen',
                    'detail': f'Se encontraron {works.count()} obras de {len(work_ids)} solicitadas'
                },
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Crear diccionario de obras por ID para acceso rápido
        works_by_id = {work.id: work for work in works}
        
        # Actualizar display_order de cada obra en una transacción
        try:
            with transaction.atomic():
                for index, work_id in enumerate(work_ids, start=1):
                    work = works_by_id.get(work_id)
                    if work:
                        work.display_order = index
                        work.save(update_fields=['display_order'])
            
            # Retornar las obras actualizadas en el nuevo orden
            updated_works = Work.objects.filter(
                id__in=work_ids
            ).order_by('display_order')
            
            result_serializer = WorkListSerializer(updated_works, many=True)
            
            return Response({
                'message': f'{len(work_ids)} obras reordenadas exitosamente',
                'works': result_serializer.data
            })
        
        except Exception as e:
            return Response(
                {
                    'error': 'Error al reordenar obras',
                    'detail': str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
