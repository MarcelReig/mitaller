from rest_framework.permissions import BasePermission


class IsAdminUser(BasePermission):
    """
    Permite acceso solo a usuarios con role='admin'
    """
    message = "Esta acción requiere permisos de administrador."
    
    def has_permission(self, request, view):
        return (
            request.user 
            and request.user.is_authenticated 
            and request.user.role == 'admin'
        )

