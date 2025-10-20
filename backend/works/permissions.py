"""
Works Permissions
Permisos personalizados para gestión de obras
"""

from rest_framework import permissions


class IsArtistOwnerOrAdmin(permissions.BasePermission):
    """
    Permiso personalizado para obras:
    
    - Lectura (GET): Público (no requiere autenticación)
    - Escritura (POST/PUT/DELETE): Solo propietario o admin
    
    A nivel de objeto:
    - El artista solo puede modificar sus propias obras
    - Los admins pueden modificar cualquier obra
    """
    
    def has_permission(self, request, view):
        """
        Permiso a nivel de vista (antes de acceder al objeto).
        """
        # Métodos de lectura: permitir a TODOS (público)
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Métodos de escritura: solo artistas autenticados o admins
        return (
            request.user and 
            request.user.is_authenticated and
            (hasattr(request.user, 'artist_profile') or request.user.is_staff)
        )
    
    def has_object_permission(self, request, view, obj):
        """
        Permiso a nivel de objeto (después de acceder al objeto).
        """
        # Métodos de lectura: permitir a cualquiera autenticado
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Admin puede hacer todo
        if request.user.is_staff:
            return True
        
        # Artista solo puede modificar sus propias obras
        if hasattr(request.user, 'artist_profile'):
            return obj.artist == request.user.artist_profile
        
        return False
