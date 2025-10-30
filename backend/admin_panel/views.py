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
from .services import delete_artisan_cascade


class AdminArtisanViewSet(viewsets.ModelViewSet):
    """
    ViewSet for administrative management of artisans.
    Requires role='admin'
    """
    permission_classes = [IsAdminUser]
    serializer_class = AdminArtisanSerializer
    
    def get_queryset(self):
        """
        Queryset with count annotations.
        Includes filters and search.
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

        # Filter by approval status
        status_filter = self.request.query_params.get('status')
        if status_filter == 'pending':
            queryset = queryset.filter(is_approved=False)
        elif status_filter == 'approved':
            queryset = queryset.filter(is_approved=True)

        # Search by name or email
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(username__icontains=search) | Q(email__icontains=search)
            )

        # Ordering
        ordering = self.request.query_params.get('ordering', '-date_joined')
        queryset = queryset.order_by(ordering)
        
        return queryset
    
    @action(detail=True, methods=['patch'])
    def approve(self, request, pk=None):
        """
        PATCH /api/v1/admin/artisans/{id}/approve/
        Approve a pending artisan.
        """
        artisan = self.get_object()

        if artisan.is_approved:
            return Response(
                {'message': 'Artisan is already approved'},
                status=status.HTTP_400_BAD_REQUEST
            )

        artisan.is_approved = True
        artisan.save()

        return Response({
            'message': f'Artisan {artisan.username} approved successfully',
            'artisan': self.get_serializer(artisan).data
        })

    @action(detail=True, methods=['patch'], url_path='toggle-featured')
    def toggle_featured(self, request, pk=None):
        """
        PATCH /api/v1/admin/artisans/{id}/toggle-featured/
        Toggle featured status for an artisan.
        """
        artisan = self.get_object()

        if not hasattr(artisan, 'artisan_profile'):
            return Response(
                {'error': 'Artisan profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        profile = artisan.artisan_profile
        profile.is_featured = not profile.is_featured
        profile.save()

        status_text = 'destacado' if profile.is_featured else 'no destacado'

        return Response({
            'message': f'Artisan {artisan.username} marked as {status_text}',
            'is_featured': profile.is_featured,
            'artisan': self.get_serializer(artisan).data
        })
    
    def destroy(self, request, pk=None):
        """
        DELETE /api/v1/admin/artisans/{id}/
        Delete artisan with cascade and validations.
        """
        try:
            result = delete_artisan_cascade(pk)
            return Response(result, status=status.HTTP_200_OK)

        except ValidationError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

        except Exception as e:
            return Response(
                {'error': f'Unexpected error: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'], url_path='dashboard-stats')
    def dashboard_stats(self, request):
        """
        GET /api/v1/admin/artisans/dashboard-stats/
        Complete statistics for admin dashboard with KPIs
        """
        from django.utils import timezone
        from datetime import timedelta
        from django.db.models import Sum

        now = timezone.now()
        week_ago = now - timedelta(days=7)
        month_ago = now - timedelta(days=30)

        # KPIs principales
        total_artisans = User.objects.filter(role='ARTISAN').count()
        pending_artisans = User.objects.filter(role='ARTISAN', is_approved=False).count()
        approved_artisans_this_week = User.objects.filter(
            role='ARTISAN',
            is_approved=True,
            date_joined__gte=week_ago
        ).count()

        total_products = Product.objects.filter(is_active=True).count()
        products_created_today = Product.objects.filter(
            created_at__date=now.date()
        ).count()

        # Ventas (asumiendo que Order tiene total_amount y payment_status)
        total_sales = Order.objects.filter(
            status='COMPLETED'  # Ajustar según tu modelo
        ).aggregate(total=Sum('total_amount'))['total'] or 0

        sales_last_month = Order.objects.filter(
            status='COMPLETED',
            created_at__gte=month_ago
        ).aggregate(total=Sum('total_amount'))['total'] or 0

        total_orders = Order.objects.count()
        orders_last_hour = Order.objects.filter(
            created_at__gte=now - timedelta(hours=1)
        ).count()

        # Alertas
        products_out_of_stock = Product.objects.filter(stock=0, is_active=True).count()

        # Actividad reciente (últimas 10 acciones)
        recent_artisans = User.objects.filter(role='ARTISAN').order_by('-date_joined')[:5]
        recent_products = Product.objects.select_related('artisan').order_by('-created_at')[:5]
        recent_orders = Order.objects.order_by('-created_at')[:5]

        recent_activity = []

        for artisan in recent_artisans:
            recent_activity.append({
                'type': 'artisan',
                'timestamp': artisan.date_joined.isoformat(),
                'message': f'Nuevo artesano: {artisan.username}',
                'status': 'pending' if not artisan.is_approved else 'approved',
            })

        for product in recent_products:
            recent_activity.append({
                'type': 'product',
                'timestamp': product.created_at.isoformat(),
                'message': f'Producto: {product.name} por {product.artisan.username}',
            })

        for order in recent_orders:
            recent_activity.append({
                'type': 'order',
                'timestamp': order.created_at.isoformat(),
                'message': f'Pedido #{order.id}: €{order.total_amount}',
                'status': order.status,
            })

        # Ordenar por timestamp descendente
        recent_activity.sort(key=lambda x: x['timestamp'], reverse=True)
        recent_activity = recent_activity[:10]

        # Gráfico de ventas (últimos 30 días)
        sales_chart = []
        for i in range(30):
            date = (now - timedelta(days=29-i)).date()
            daily_sales = Order.objects.filter(
                status='COMPLETED',
                created_at__date=date
            ).aggregate(total=Sum('total_amount'))['total'] or 0

            sales_chart.append({
                'date': date.isoformat(),
                'sales': float(daily_sales),
            })

        return Response({
            'total_artisans': total_artisans,
            'pending_artisans': pending_artisans,
            'new_artisans_this_week': approved_artisans_this_week,
            'total_products': total_products,
            'products_created_today': products_created_today,
            'total_sales': float(total_sales),
            'sales_last_month': float(sales_last_month),
            'total_orders': total_orders,
            'recent_orders_count': orders_last_hour,
            'products_out_of_stock': products_out_of_stock,
            'recent_activity': recent_activity,
            'sales_chart': sales_chart,
        })

    @action(detail=False, methods=['post'], url_path='bulk-approve')
    def bulk_approve(self, request):
        """
        POST /api/v1/admin/artisans/bulk-approve/
        Approve multiple artisans at once

        Body:
        {
            "artisan_ids": [1, 2, 3]
        }
        """
        artisan_ids = request.data.get('artisan_ids', [])

        if not artisan_ids:
            return Response(
                {'error': 'No se proporcionaron IDs'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validar que sean números
        if not all(isinstance(id, int) for id in artisan_ids):
            return Response(
                {'error': 'Todos los IDs deben ser números enteros'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Actualizar artesanos
        updated_count = User.objects.filter(
            id__in=artisan_ids,
            role='ARTISAN',
            is_approved=False
        ).update(is_approved=True)

        # TODO: Enviar emails de aprobación a cada artesano

        return Response({
            'success': True,
            'approved_count': updated_count,
            'message': f'{updated_count} artesano(s) aprobado(s) correctamente'
        })
