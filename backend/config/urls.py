"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)

urlpatterns = [
    # Admin de Django
    path('admin/', admin.site.urls),
    
    # Authentication endpoints (custom)
    path('api/v1/auth/', include('accounts.urls')),
    
    # JWT Token verification
    path('api/v1/auth/token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    
    # Artists API (perfiles públicos de artesanos)
    path('api/v1/artists/', include('artists.urls')),
    
    # Works API (portfolio de obras de artesanos)
    path('api/v1/works/', include('works.urls')),
    
    # Shop API (productos para venta)
    path('api/v1/shop/', include('shop.urls')),
    
    # Orders API (pedidos y compras)
    path('api/v1/orders/', include('orders.urls')),
    
    # Payments API (pagos con Stripe Connect)
    path('api/v1/payments/', include('payments.urls')),
    
    # Admin Panel API (gestión administrativa)
    path('api/v1/admin/', include('admin_panel.urls')),
]

# Servir archivos media en desarrollo
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

