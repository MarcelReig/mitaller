"""
Works ViewSet
Endpoints para gestión de obras por artistas
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.exceptions import PermissionDenied

from .models import Work
from .serializers import WorkDetailSerializer, WorkCreateUpdateSerializer
from .permissions import IsArtistOwnerOrAdmin


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
    
    permission_classes = [IsAuthenticatedOrReadOnly, IsArtistOwnerOrAdmin]
    
    def get_serializer_class(self):
        """
        Usar serializer apropiado según acción
        """
        if self.action in ['create', 'update', 'partial_update']:
            return WorkCreateUpdateSerializer
        return WorkDetailSerializer
    
    def get_queryset(self):
        """
        Filtrar obras según tipo de usuario:
        - Público (no autenticado): solo obras activas y ordenadas
        - Artista: solo sus obras
        - Admin: todas las obras
        """
        user = self.request.user
        
        # Usuario no autenticado: solo obras activas
        if not user.is_authenticated:
            return Work.objects.filter(
                is_active=True
            ).select_related('artist').order_by('display_order', '-created_at')
        
        # Artista: solo sus obras
        if hasattr(user, 'artist_profile'):
            return Work.objects.filter(
                artist=user.artist_profile
            ).select_related('artist').order_by('display_order', '-created_at')
        
        # Admin: todas las obras
        if user.is_staff:
            return Work.objects.all().select_related(
                'artist'
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
        
        # Verificar que el usuario tiene perfil de artista
        if not hasattr(user, 'artist_profile'):
            error_msg = (
                f"Solo los artistas pueden crear obras. "
                f"Usuario actual: {user.email} (role: {user.get_role_display()}). "
                f"Necesitas tener un ArtistProfile asociado."
            )
            raise PermissionDenied(error_msg)
        
        # Calcular siguiente display_order
        last_work = Work.objects.filter(
            artist=user.artist_profile
        ).order_by('-display_order').first()
        
        next_order = (last_work.display_order + 1) if last_work else 1
        
        # Guardar con artista y display_order
        serializer.save(
            artist=user.artist_profile,
            display_order=next_order,
            is_active=True
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
        if hasattr(user, 'artist_profile'):
            if work.artist != user.artist_profile and not user.is_staff:
                raise PermissionDenied(
                    "No puedes editar obras de otros artistas"
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
        if hasattr(user, 'artist_profile'):
            if instance.artist != user.artist_profile and not user.is_staff:
                raise PermissionDenied(
                    "No puedes eliminar obras de otros artistas"
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
        
        # Verificar que el usuario es artista
        if not hasattr(user, 'artist_profile'):
            return Response(
                {"error": "Solo los artistas pueden reordenar obras"},
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
                    artist=user.artist_profile
                )
                work.display_order = index
                work.save(update_fields=['display_order'])
                updated_count += 1
            except Work.DoesNotExist:
                # Ignorar IDs que no pertenecen al artista
                continue
        
        return Response({
            "success": True,
            "message": f"{updated_count} obras reordenadas correctamente"
        })
