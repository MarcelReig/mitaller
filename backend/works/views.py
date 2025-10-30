"""
Works ViewSet
Endpoints para gestión de obras por artistas
"""

from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.exceptions import PermissionDenied
from django_filters.rest_framework import DjangoFilterBackend

from .models import Work
from .serializers import WorkDetailSerializer, WorkCreateUpdateSerializer
from .permissions import IsArtisanOwnerOrAdmin


class WorkViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestión completa de obras.

    Endpoints:
    - GET /api/v1/works/              - Listar obras (filtradas por usuario)
    - GET /api/v1/works/{id}/         - Detalle de obra
    - POST /api/v1/works/             - Crear obra (solo artistas)
    - PUT /api/v1/works/{id}/         - Actualizar obra (solo propietario)
    - DELETE /api/v1/works/{id}/      - Eliminar obra (solo propietario)
    - PUT /api/v1/works/reorder/      - Reordenar obras (solo propietario)
    """

    permission_classes = [IsAuthenticatedOrReadOnly, IsArtisanOwnerOrAdmin]

    # Configuración de filtros y búsqueda
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]

    # Campos de filtro exacto
    filterset_fields = ['artisan', 'category', 'is_featured', 'is_active']

    # Campos de búsqueda de texto libre
    search_fields = ['title', 'description']

    # Campos de ordenamiento permitidos
    ordering_fields = ['display_order', 'created_at', 'title']

    # Ordenamiento por defecto
    ordering = ['display_order', '-created_at']
    
    def get_serializer_class(self):
        """
        Usar serializer apropiado según acción
        """
        if self.action in ['create', 'update', 'partial_update']:
            return WorkCreateUpdateSerializer
        return WorkDetailSerializer
    
    def get_queryset(self):
        """
        Filtrar obras según tipo de usuario y parámetros:
        - Público (no autenticado): solo obras activas y ordenadas
        - Artista: solo sus obras (o usar ?my_works=true explícitamente)
        - Admin: todas las obras

        Query params:
        - my_works=true: forzar filtrado por usuario autenticado (para dashboard)
        """
        user = self.request.user

        # Parámetro explícito para "mis obras" (desde dashboard)
        if self.request.query_params.get('my_works') == 'true':
            if not user.is_authenticated:
                return Work.objects.none()

            # Verificar que el usuario sea artesano
            if not hasattr(user, 'artisan_profile'):
                return Work.objects.none()

            return Work.objects.filter(
                artisan=user
            ).select_related('artisan').order_by('display_order', '-created_at')

        # Usuario no autenticado: solo obras activas
        if not user.is_authenticated:
            return Work.objects.filter(
                is_active=True
            ).select_related('artisan').order_by('display_order', '-created_at')

        # Artesano: solo sus obras (comportamiento por defecto)
        if hasattr(user, 'artisan_profile'):
            return Work.objects.filter(
                artisan=user
            ).select_related('artisan').order_by('display_order', '-created_at')

        # Admin: todas las obras
        if user.is_staff or user.role == 'ADMIN':
            return Work.objects.all().select_related(
                'artisan'
            ).order_by('display_order', '-created_at')

        # Otros usuarios autenticados: ninguna obra
        return Work.objects.none()
    
    def perform_create(self, serializer):
        """
        Al crear obra:
        - Asignar al artista autenticado
        - Calcular siguiente display_order
        - Validar que el usuario sea artista
        """
        user = self.request.user
        
        # Verificar que el usuario tiene perfil de artesano
        if not hasattr(user, 'artisan_profile'):
            error_msg = (
                f"Solo los artesanos pueden crear obras. "
                f"Usuario actual: {user.email} (role: {user.get_role_display()}). "
                f"Necesitas tener un ArtistProfile asociado."
            )
            raise PermissionDenied(error_msg)
        
        # Calcular siguiente display_order
        last_work = Work.objects.filter(
            artisan=user
        ).order_by('-display_order').first()
        
        next_order = (last_work.display_order + 1) if last_work else 1
        
        # Guardar con artesano y display_order
        serializer.save(
            artisan=user,
            display_order=next_order,
            is_active=True
        )

    def create(self, request, *args, **kwargs):
        """
        Override create para devolver respuesta con WorkDetailSerializer.

        WorkCreateUpdateSerializer maneja la creación y validaciones,
        pero WorkDetailSerializer se usa para la respuesta con todos los campos.
        """
        # Usar WorkCreateUpdateSerializer para validar y crear
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Llamar perform_create para crear la obra
        self.perform_create(serializer)

        # Usar WorkDetailSerializer para la respuesta completa
        work = serializer.instance
        response_serializer = WorkDetailSerializer(work)
        headers = self.get_success_headers(response_serializer.data)

        return Response(
            response_serializer.data,
            status=status.HTTP_201_CREATED,
            headers=headers
        )

    def perform_update(self, serializer):
        """
        Al actualizar obra:
        - Verificar que el artista es propietario
        - Permitir a admins editar cualquier obra
        """
        work = self.get_object()
        user = self.request.user
        
        # Verificar ownership
        if hasattr(user, 'artisan_profile'):
            if work.artisan != user and not user.is_staff:
                raise PermissionDenied(
                    "No puedes editar obras de otros artesanos"
                )
        elif not user.is_staff:
            raise PermissionDenied("No tienes permisos para editar obras")
        
        serializer.save()
    
    def perform_destroy(self, instance):
        """
        Al eliminar obra:
        - Verificar ownership
        - Hard delete (eliminar permanentemente)
        """
        user = self.request.user
        
        # Verificar ownership
        if hasattr(user, 'artisan_profile'):
            if instance.artisan != user and not user.is_staff:
                raise PermissionDenied(
                    "No puedes eliminar obras de otros artesanos"
                )
        elif not user.is_staff:
            raise PermissionDenied("No tienes permisos para eliminar obras")
        
        # Hard delete (eliminar permanentemente)
        instance.delete()
    
    @action(detail=False, methods=['put'], url_path='reorder')
    def reorder(self, request):
        """
        Reordenar obras del artista.
        
        Endpoint: PUT /api/v1/works/reorder/
        
        Body:
        {
            "order": [3, 1, 2, 5, 4]  // Array de IDs en el nuevo orden
        }
        
        Response:
        {
            "success": true,
            "message": "5 obras reordenadas correctamente"
        }
        """
        user = request.user
        
        # Verificar que el usuario es artesano
        if not hasattr(user, 'artisan_profile'):
            return Response(
                {"error": "Solo los artesanos pueden reordenar obras"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Obtener array de IDs
        order_ids = request.data.get('order', [])
        
        # Validar que sea un array
        if not order_ids or not isinstance(order_ids, list):
            return Response(
                {
                    "error": "Se requiere un array 'order' con los IDs de las obras"
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validar que todos los IDs sean números
        if not all(isinstance(id, int) for id in order_ids):
            return Response(
                {"error": "Todos los IDs deben ser números enteros"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Actualizar display_order de cada obra
        updated_count = 0
        for index, work_id in enumerate(order_ids, start=1):
            try:
                work = Work.objects.get(
                    id=work_id,
                    artisan=user
                )
                work.display_order = index
                work.save(update_fields=['display_order'])
                updated_count += 1
            except Work.DoesNotExist:
                # Ignorar IDs que no pertenecen al artista
                continue

        # Si no se actualizó ninguna obra, devolver 404
        if updated_count == 0:
            return Response(
                {"error": "No se encontraron obras que pertenezcan al artesano"},
                status=status.HTTP_404_NOT_FOUND
            )

        return Response({
            "success": True,
            "message": f"{updated_count} obras reordenadas correctamente"
        })
