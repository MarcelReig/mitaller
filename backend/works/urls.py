"""
URLs para la app works.
Define los endpoints de la API REST para obras del portfolio.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import WorkViewSet

# Router de DRF para generar URLs automáticamente
router = DefaultRouter()
router.register(r'', WorkViewSet, basename='work')

# URLs generadas automáticamente por el router:
# GET    /api/v1/works/              - Lista de obras
# POST   /api/v1/works/              - Crear obra
# GET    /api/v1/works/{id}/         - Detalle de obra
# PUT    /api/v1/works/{id}/         - Actualizar obra (completo)
# PATCH  /api/v1/works/{id}/         - Actualizar obra (parcial)
# DELETE /api/v1/works/{id}/         - Eliminar obra
# POST   /api/v1/works/reorder/      - Reordenar obras (custom action)

urlpatterns = router.urls

