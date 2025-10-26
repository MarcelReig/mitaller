"""
Views para Orders API.

Proporciona endpoints para:
- Crear pedidos (público/invitado)
- Listar/ver pedidos (según rol)
- Actualizar estado (admin/staff)
- Ver mis ventas (artesanos)
"""

from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from django.db.models import QuerySet, Prefetch
from typing import Type

from .models import Order, OrderItem
from .serializers import (
    OrderSerializer,
    OrderCreateSerializer,
    OrderItemSerializer
)


class OrderViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestión de pedidos.
    
    Permisos:
    - CREATE: AllowAny (compras de invitados sin registro)
    - LIST/RETRIEVE/UPDATE: IsAuthenticated
    
    Filtrado de queryset según rol:
    - Artesanos: Solo ven pedidos que contienen sus productos
    - Admin/Staff: Ven todos los pedidos
    - Otros: No ven nada (seguridad)
    
    Endpoints:
    - POST /api/v1/orders/ - Crear pedido (público)
    - GET /api/v1/orders/ - Listar pedidos (filtrado por rol)
    - GET /api/v1/orders/{id}/ - Ver detalle
    - PATCH /api/v1/orders/{id}/ - Actualizar estado
    - GET /api/v1/orders/my-sales/ - Ver mis ventas (artesanos)
    """
    
    queryset = Order.objects.prefetch_related(
        'items',
        'items__product',
        'items__artisan',
        'items__artisan__user'
    )
    
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter
    ]
    
    filterset_fields = ['status', 'customer_email']
    search_fields = ['order_number', 'customer_name', 'customer_email']
    ordering_fields = ['created_at', 'total_amount', 'status']
    ordering = ['-created_at']
    
    def get_permissions(self) -> list:
        """
        Permisos dinámicos según action.
        
        - create: AllowAny (compras de invitados)
        - resto: IsAuthenticated
        
        Returns:
            Lista de instancias de permisos
        """
        if self.action == 'create':
            # Permitir compras sin registro (invitados)
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]
    
    def get_serializer_class(self) -> Type[OrderSerializer | OrderCreateSerializer]:
        """
        Serializer dinámico según action.
        
        - create: OrderCreateSerializer (validaciones + transacción)
        - resto: OrderSerializer (lectura completa)
        
        Returns:
            Clase de serializer apropiada
        """
        if self.action == 'create':
            return OrderCreateSerializer
        return OrderSerializer
    
    def get_queryset(self) -> QuerySet[Order]:
        """
        Filtrar queryset según rol del usuario.
        
        Lógica:
        1. Si usuario es artesano -> solo pedidos con sus productos
        2. Si usuario es admin/staff -> todos los pedidos
        3. Otros usuarios -> empty queryset (seguridad)
        
        Para artesanos usa .distinct() porque un pedido puede tener
        múltiples productos del mismo artesano.
        
        Returns:
            QuerySet filtrado de Orders
        """
        queryset = super().get_queryset()
        user = self.request.user
        
        # Para create (AllowAny), no hay user autenticado
        if not user.is_authenticated:
            return queryset.none()
        
        # Admin/Staff ven todo
        if user.is_staff or user.is_superuser:
            return queryset
        
        # Artesanos solo ven pedidos con sus productos
        if hasattr(user, 'artisan_profile'):
            return queryset.filter(
                items__artisan=user.artisan_profile
            ).distinct()
        
        # Otros usuarios no ven nada
        return queryset.none()
    
    def create(self, request, *args, **kwargs):
        """
        Override create para devolver respuesta con OrderSerializer.
        
        OrderCreateSerializer maneja la creación y validaciones,
        pero OrderSerializer se usa para la respuesta con todos los campos.
        """
        # Usar OrderCreateSerializer para validar y crear
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Crear orden (con transacción atómica, reducción stock, etc.)
        order = serializer.save()
        
        # Usar OrderSerializer para la respuesta completa
        response_serializer = OrderSerializer(order)
        headers = self.get_success_headers(response_serializer.data)
        
        return Response(
            response_serializer.data,
            status=status.HTTP_201_CREATED,
            headers=headers
        )
    
    @action(
        detail=False,
        methods=['get'],
        permission_classes=[permissions.IsAuthenticated],
        url_path='my-sales'
    )
    def my_sales(self, request) -> Response:
        """
        Endpoint para artesanos: ver sus ventas (OrderItems).
        
        Retorna lista de OrderItems donde el artesano es el vendedor,
        agrupados por pedido. Útil para dashboard de ventas.
        
        Permisos: Solo artesanos autenticados
        
        Query params:
        - ordering: created_at, -created_at, subtotal, -subtotal
        - search: Buscar por order_number, product_name
        
        Returns:
            Response con lista de OrderItems del artesano
        """
        # Verificar que el usuario sea artesano
        if not hasattr(request.user, 'artisan_profile'):
            return Response(
                {'detail': 'Solo artesanos pueden ver sus ventas'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Obtener OrderItems del artesano
        order_items = OrderItem.objects.filter(
            artisan=request.user.artisan_profile
        ).select_related(
            'order',
            'product',
            'artisan',
            'artisan__user'
        ).order_by('-created_at')
        
        # Aplicar filtros opcionales
        search = request.query_params.get('search', None)
        if search:
            order_items = order_items.filter(
                order__order_number__icontains=search
            ) | order_items.filter(
                product_name__icontains=search
            )
        
        # Ordenamiento
        ordering = request.query_params.get('ordering', '-created_at')
        order_items = order_items.order_by(ordering)
        
        # Paginar
        page = self.paginate_queryset(order_items)
        if page is not None:
            serializer = OrderItemSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = OrderItemSerializer(order_items, many=True)
        return Response(serializer.data)

