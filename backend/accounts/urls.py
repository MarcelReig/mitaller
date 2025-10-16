"""
URLs para la app accounts.
Maneja rutas de autenticación JWT y gestión de perfiles.
"""
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView,
    CustomTokenObtainPairView,
    UserProfileView,
    LogoutView,
)

app_name = 'accounts'

urlpatterns = [
    # Registro de nuevos usuarios
    path('register/', RegisterView.as_view(), name='register'),
    
    # Login con JWT (retorna access + refresh tokens)
    path('login/', CustomTokenObtainPairView.as_view(), name='login'),
    
    # Refresh token (obtener nuevo access token)
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Logout (blacklist refresh token)
    path('logout/', LogoutView.as_view(), name='logout'),
    
    # Perfil del usuario autenticado
    path('profile/', UserProfileView.as_view(), name='profile'),
]

