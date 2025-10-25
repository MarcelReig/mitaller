from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AdminArtistViewSet

router = DefaultRouter()
router.register(r'artists', AdminArtistViewSet, basename='admin-artists')

urlpatterns = [
    path('', include(router.urls)),
]

# Rutas resultantes:
# GET    /api/v1/admin/artists/              → list
# GET    /api/v1/admin/artists/{id}/         → retrieve
# PATCH  /api/v1/admin/artists/{id}/approve/ → approve
# DELETE /api/v1/admin/artists/{id}/         → destroy
# GET    /api/v1/admin/artists/stats/        → stats

