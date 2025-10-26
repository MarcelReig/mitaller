from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count, Q
from django.core.exceptions import ValidationError

from accounts.models import User
from works.models import Work
from shop.models import Product
from orders.models import Order
from .serializers import AdminArtisanSerializer
from .permissions import IsAdminUser
from .services import delete_artist_cascade


class AdminArtistViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestión administrativa de artistas.
    Requiere role='admin'
    """
    permission_classes = [IsAdminUser]
    serializer_class = AdminArtisanSerializer
    
    def get_queryset(self):
        """
        Queryset con annotaciones de counts.
        Incluye filtros y búsqueda.
        """
        queryset = User.objects.filter(role='artisan').annotate(
            works_count=Count('works', distinct=True),
            products_count=Count('products', distinct=True),
            completed_orders_count=Count(
                'sales',
                filter=Q(sales__order__status='completed'),
                distinct=True
            )
        ).select_related('artisan_profile')
        
        # Filtro por estado de aprobación
        status_filter = self.request.query_params.get('status')
        if status_filter == 'pending':
            queryset = queryset.filter(is_approved=False)
        elif status_filter == 'approved':
            queryset = queryset.filter(is_approved=True)
        
        # Búsqueda por nombre o email
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(username__icontains=search) | Q(email__icontains=search)
            )
        
        # Ordenamiento
        ordering = self.request.query_params.get('ordering', '-created_at')
        queryset = queryset.order_by(ordering)
        
        return queryset
    
    @action(detail=True, methods=['patch'])
    def approve(self, request, pk=None):
        """
        PATCH /api/v1/admin/artists/{id}/approve/
        Aprobar un artista pendiente.
        """
        artist = self.get_object()
        
        if artist.is_approved:
            return Response(
                {'message': 'El artista ya está aprobado'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        artist.is_approved = True
        artist.save()
        
        return Response({
            'message': f'Artista {artist.username} aprobado exitosamente',
            'artist': self.get_serializer(artist).data
        })
    
    def destroy(self, request, pk=None):
        """
        DELETE /api/v1/admin/artists/{id}/
        Eliminar artista con cascada y validaciones.
        """
        try:
            result = delete_artist_cascade(pk)
            return Response(result, status=status.HTTP_200_OK)
        
        except ValidationError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        except Exception as e:
            return Response(
                {'error': f'Error inesperado: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """
        GET /api/v1/admin/artists/stats/
        Estadísticas para el dashboard admin
        """
        total_artists = User.objects.filter(role='artisan').count()
        pending = User.objects.filter(role='artisan', is_approved=False).count()
        
        stats = {
            'total_artists': total_artists,
            'pending_artists': pending,
            'approved_artists': total_artists - pending,
            'total_works': Work.objects.count(),
            'total_products': Product.objects.count(),
            'total_orders': Order.objects.count(),
        }
        
        return Response(stats)
