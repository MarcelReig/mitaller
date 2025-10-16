"""
Permisos personalizados para la app works.

Implementa lógica de permisos para obras del portfolio:
- Lectura pública (cualquiera puede ver obras)
- Escritura restringida (solo el artesano dueño puede crear/editar/eliminar)
"""
from rest_framework import permissions


class IsArtistOwnerOrReadOnly(permissions.BasePermission):
    """
    Permiso personalizado para obras del portfolio.
    
    Lógica de permisos:
    
    1. **Lectura (GET, HEAD, OPTIONS)**: Público
       - Cualquier usuario puede ver obras
       - No requiere autenticación
       - Permite explorar portfolios de artesanos
    
    2. **Escritura (POST, PUT, PATCH, DELETE)**: Solo el artesano dueño
       - Usuario debe estar autenticado
       - Usuario debe tener un ArtistProfile (role=ARTISAN)
       - Para editar/eliminar: el usuario debe ser el dueño de la obra
    
    Casos de uso:
    - Visitantes pueden explorar portfolios sin login
    - Artesanos pueden crear nuevas obras en su portfolio
    - Artesanos solo pueden editar/eliminar sus propias obras
    - Admins del sitio no pueden editar obras de artesanos (respeta propiedad)
    
    Flujo de validación:
    1. has_permission: Valida permiso general (puede crear obras?)
    2. has_object_permission: Valida permiso sobre objeto específico (puede editar ESTA obra?)
    """
    
    def has_permission(self, request, view):
        """
        Valida permiso a nivel de vista (sin objeto específico).
        
        Se ejecuta para:
        - Listados (GET /api/v1/works/)
        - Creación (POST /api/v1/works/)
        
        Args:
            request: Request de DRF con usuario y método HTTP
            view: ViewSet que está siendo accedido
            
        Returns:
            bool: True si tiene permiso, False si no
        """
        # Permitir lectura pública (GET, HEAD, OPTIONS)
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Para escritura, verificar autenticación
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Verificar que el usuario tenga un perfil de artesano
        if not hasattr(request.user, 'artist_profile'):
            return False
        
        # Usuario autenticado con perfil de artesano puede crear obras
        return True
    
    def has_object_permission(self, request, view, obj):
        """
        Valida permiso sobre un objeto específico (una obra).
        
        Se ejecuta para:
        - Detalle (GET /api/v1/works/:id/)
        - Actualización (PUT/PATCH /api/v1/works/:id/)
        - Eliminación (DELETE /api/v1/works/:id/)
        
        Args:
            request: Request de DRF con usuario y método HTTP
            view: ViewSet que está siendo accedido
            obj: Instancia de Work que se está accediendo
            
        Returns:
            bool: True si tiene permiso, False si no
        """
        # Permitir lectura pública
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Para escritura, verificar que sea el artesano dueño
        # obj.artist es ArtistProfile, necesitamos comparar con el user
        return obj.artist.user == request.user


class IsArtistOwner(permissions.BasePermission):
    """
    Permiso más restrictivo: solo el artesano dueño.
    
    Usado para acciones específicas del artesano como:
    - Reordenar obras (drag & drop)
    - Batch operations (marcar varias como destacadas, etc.)
    
    A diferencia de IsArtistOwnerOrReadOnly, este NO permite lectura pública.
    Requiere autenticación y ser el dueño para cualquier acción.
    """
    
    def has_permission(self, request, view):
        """Requiere autenticación y perfil de artesano."""
        if not request.user or not request.user.is_authenticated:
            return False
        
        return hasattr(request.user, 'artist_profile')
    
    def has_object_permission(self, request, view, obj):
        """Requiere ser el dueño del objeto."""
        return obj.artist.user == request.user

