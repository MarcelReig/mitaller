from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AdminArtisanViewSet

router = DefaultRouter()
router.register(r'artisans', AdminArtisanViewSet, basename='admin-artisans')

urlpatterns = [
    path('', include(router.urls)),
]

# Resulting routes:
# GET    /api/v1/admin/artisans/                      → list (with filters: status, search)
# GET    /api/v1/admin/artisans/{id}/                 → retrieve
# PATCH  /api/v1/admin/artisans/{id}/approve/        → approve
# DELETE /api/v1/admin/artisans/{id}/                → destroy (cascade)
# GET    /api/v1/admin/artisans/dashboard-stats/     → dashboard_stats (KPIs completos)
# POST   /api/v1/admin/artisans/bulk-approve/        → bulk_approve (aprobar múltiples)

