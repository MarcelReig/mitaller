"""
URL routing para Orders API.

Define rutas para pedidos y ventas de artesanos.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import OrderViewSet

# Router para viewsets
router = DefaultRouter()
router.register(r'', OrderViewSet, basename='order')

urlpatterns = [
    # Rutas del router
    # GET /api/v1/orders/ - Listar pedidos
    # POST /api/v1/orders/ - Crear pedido (público)
    # GET /api/v1/orders/{id}/ - Ver detalle
    # PATCH /api/v1/orders/{id}/ - Actualizar estado
    # GET /api/v1/orders/my-sales/ - Ver mis ventas (artesanos)
    path('', include(router.urls)),
]

