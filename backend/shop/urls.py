"""
URLs para la app shop.
Define los endpoints de la API REST para productos.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductViewSet

# Router de DRF para generar automáticamente las rutas del ViewSet
router = DefaultRouter()
router.register(r'products', ProductViewSet, basename='product')

# URLs de la app
# Estas rutas se montarán en /api/v1/shop/ desde config/urls.py
urlpatterns = router.urls

