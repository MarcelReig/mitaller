"""
URLs para la app artisans.
Define los endpoints de la API REST para perfiles de artesanos.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ArtisanProfileViewSet

# Router de DRF para generar URLs automáticamente
router = DefaultRouter()
router.register(r'', ArtisanProfileViewSet, basename='artisans')

# URLs generadas:
# GET    /api/v1/artisans/              - Lista de artesanos
# GET    /api/v1/artisans/{slug}/       - Detalle de artesano
# GET    /api/v1/artisans/me/           - Mi perfil (autenticado)
# PATCH  /api/v1/artisans/me/           - Actualizar mi perfil (autenticado)

urlpatterns = router.urls
