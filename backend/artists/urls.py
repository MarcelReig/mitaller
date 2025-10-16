"""
URLs para la app artists.
Define los endpoints de la API REST para perfiles de artesanos.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ArtistProfileViewSet

# Router de DRF para generar URLs automáticamente
router = DefaultRouter()
router.register(r'', ArtistProfileViewSet, basename='artist')

# URLs generadas:
# GET    /api/v1/artists/              - Lista de artesanos
# GET    /api/v1/artists/{slug}/       - Detalle de artesano

urlpatterns = router.urls

