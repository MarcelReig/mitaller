"""
Permisos personalizados para la app shop.

Implementa lógica de permisos para productos de la tienda:
- Lectura pública (cualquiera puede ver productos disponibles)
- Escritura restringida (solo el artesano dueño puede crear/editar/eliminar)
"""
from rest_framework import permissions


class IsArtistOwnerOrReadOnly(permissions.BasePermission):
    """
    Permiso personalizado para productos de la tienda.
    
    Lógica de permisos:
    
    1. **Lectura (GET, HEAD, OPTIONS)**: Público
       - Cualquier usuario puede ver productos
       - No requiere autenticación
       - Permite explorar la tienda
    
    2. **Escritura (POST, PUT, PATCH, DELETE)**: Solo el artesano dueño
       - Usuario debe estar autenticado
       - Usuario debe tener un ArtistProfile (role=ARTISAN)
       - Para editar/eliminar: el usuario debe ser el dueño del producto
    
    Casos de uso:
    - Visitantes pueden explorar la tienda sin login
    - Artesanos pueden crear nuevos productos en su tienda
    - Artesanos solo pueden editar/eliminar sus propios productos
    - Admins del sitio no pueden editar productos de artesanos (respeta propiedad)
    
    Flujo de validación:
    1. has_permission: Valida permiso general (puede crear productos?)
    2. has_object_permission: Valida permiso sobre objeto específico (puede editar ESTE producto?)
    """
    
    def has_permission(self, request, view):
        """
        Valida permiso a nivel de vista (sin objeto específico).
        
        Se ejecuta para:
        - Listados (GET /api/v1/shop/)
        - Creación (POST /api/v1/shop/)
        
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
        
        # Usuario autenticado con perfil de artesano puede crear productos
        return True
    
    def has_object_permission(self, request, view, obj):
        """
        Valida permiso sobre un objeto específico (un producto).
        
        Se ejecuta para:
        - Detalle (GET /api/v1/shop/:id/)
        - Actualización (PUT/PATCH /api/v1/shop/:id/)
        - Eliminación (DELETE /api/v1/shop/:id/)
        
        Args:
            request: Request de DRF con usuario y método HTTP
            view: ViewSet que está siendo accedido
            obj: Instancia de Product que se está accediendo
            
        Returns:
            bool: True si tiene permiso, False si no
        """
        # Permitir lectura pública
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Para escritura, verificar que sea el artesano dueño
        # obj.artist es ArtistProfile, necesitamos comparar con el user
        return obj.artist.user == request.user

