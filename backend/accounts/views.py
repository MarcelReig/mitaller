"""
Views para la app accounts.
Maneja registro, login y gestión de perfiles de usuario.
"""
from rest_framework import status, generics, serializers
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import (
    RegisterSerializer,
    UserSerializer,
    CustomTokenObtainPairSerializer
)
from .models import User


class RegisterView(APIView):
    """
    Vista para registro de nuevos usuarios (artesanos).
    
    POST /api/v1/auth/register/
    
    Los artesanos se registran con is_approved=False y deben esperar
    aprobación manual de un admin antes de poder publicar productos.
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        """
        Crea un nuevo usuario artesano.
        
        Request body:
            - email: str (requerido, único)
            - username: str (requerido, único, slug-friendly)
            - password: str (requerido, mín 8 chars, 1 letra, 1 número)
            - password_confirm: str (requerido, debe coincidir)
            - first_name: str (requerido)
            - last_name: str (requerido)
        
        Returns:
            201: Usuario creado exitosamente
            400: Errores de validación
        """
        from django.conf import settings
        
        serializer = RegisterSerializer(data=request.data)
        
        if serializer.is_valid():
            user = serializer.save()
            
            # Mensaje dinámico según configuración
            if getattr(settings, 'AUTO_APPROVE_ARTISANS', False):
                message = (
                    '¡Registro exitoso! Tu cuenta ha sido activada automáticamente. '
                    'Ya puedes comenzar a crear tu perfil y subir obras.'
                )
            else:
                message = (
                    'Registro exitoso. Tu cuenta está pendiente de aprobación. '
                    'Recibirás un email cuando puedas comenzar a vender.'
                )
            
            return Response(
                {
                    'message': message,
                    'user': serializer.data
                },
                status=status.HTTP_201_CREATED
            )
        
        return Response(
            {
                'message': 'Error en el registro.',
                'errors': serializer.errors
            },
            status=status.HTTP_400_BAD_REQUEST
        )


class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Vista personalizada para login con JWT.
    
    POST /api/v1/auth/login/
    
    Retorna access token, refresh token y datos del usuario.
    """
    serializer_class = CustomTokenObtainPairSerializer
    
    def post(self, request, *args, **kwargs):
        """
        Autentica usuario y retorna tokens + datos de usuario.
        
        Request body:
            - email: str (requerido)
            - password: str (requerido)
        
        Returns:
            200: Login exitoso con tokens y datos de usuario
            400/401: Credenciales inválidas o error de validación
        """
        serializer = self.get_serializer(data=request.data)
        
        try:
            serializer.is_valid(raise_exception=True)
            return Response(
                {
                    'message': 'Login exitoso.',
                    **serializer.validated_data
                },
                status=status.HTTP_200_OK
            )
        except serializers.ValidationError as e:
            # Errores de validación (credenciales incorrectas)
            # Personalizar mensaje para que sea más claro
            error_detail = serializer.errors
            
            # Verificar si es error de credenciales vs error de campo
            if 'non_field_errors' in error_detail or 'detail' in error_detail:
                message = 'Email o contraseña incorrectos. Por favor, verifica tus credenciales.'
            else:
                message = 'Error en el login. Verifica los datos ingresados.'
            
            return Response(
                {
                    'message': message,
                    'errors': error_detail
                },
                status=status.HTTP_401_UNAUTHORIZED
            )
        except Exception as e:
            # Errores inesperados - log para debugging
            import logging
            import traceback
            logger = logging.getLogger(__name__)
            logger.error(f"[LOGIN] Error inesperado en vista: {str(e)}")
            logger.error(traceback.format_exc())
            
            return Response(
                {
                    'message': 'Error al procesar el login. Por favor, intenta nuevamente.',
                    'detail': 'Si el problema persiste, contacta al administrador.'
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    Vista para ver y actualizar el perfil del usuario autenticado.
    
    GET /api/v1/auth/profile/ - Ver perfil
    PUT/PATCH /api/v1/auth/profile/ - Actualizar perfil
    
    Solo permite actualizar first_name y last_name.
    Campos como email, role, is_approved son read-only.
    """
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self) -> User:
        """
        Returns the authenticated user.
        Optimizes with select_related to load artisan_profile in a single query.
        """
        user_id = self.request.user.id
        try:
            return User.objects.select_related('artisan_profile').get(id=user_id)
        except User.DoesNotExist:
            return self.request.user
    
    def update(self, request, *args, **kwargs):
        """
        Actualiza el perfil del usuario.
        
        Solo permite actualizar:
        - first_name
        - last_name
        
        Returns:
            200: Perfil actualizado exitosamente
            400: Errores de validación
        """
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        # Filtrar solo campos permitidos para actualización
        allowed_fields = ['first_name', 'last_name']
        filtered_data = {
            k: v for k, v in request.data.items() 
            if k in allowed_fields
        }
        
        serializer = self.get_serializer(
            instance,
            data=filtered_data,
            partial=partial
        )
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        return Response(
            {
                'message': 'Perfil actualizado exitosamente.',
                'user': serializer.data
            },
            status=status.HTTP_200_OK
        )


class LogoutView(APIView):
    """
    Vista para cerrar sesión (blacklist del refresh token).
    
    POST /api/v1/auth/logout/
    
    Invalida el refresh token para evitar que se use nuevamente.
    Requiere que BLACKLIST_AFTER_ROTATION esté habilitado en settings.
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """
        Blacklist del refresh token.
        
        Request body:
            - refresh: str (requerido) - Refresh token a invalidar
        
        Returns:
            205: Logout exitoso
            400: Token inválido o no proporcionado
        """
        try:
            refresh_token = request.data.get('refresh')
            
            if not refresh_token:
                return Response(
                    {
                        'message': 'Debes proporcionar el refresh token.',
                        'errors': {'refresh': 'Este campo es requerido.'}
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Blacklist del token
            token = RefreshToken(refresh_token)
            token.blacklist()
            
            return Response(
                {'message': 'Sesión cerrada exitosamente.'},
                status=status.HTTP_205_RESET_CONTENT
            )
        except Exception as e:
            return Response(
                {
                    'message': 'Error al cerrar sesión.',
                    'errors': {'refresh': 'Token inválido o expirado.'}
                },
                status=status.HTTP_400_BAD_REQUEST
            )


class DebugAuthView(APIView):
    """
    Vista de debugging para verificar autenticación.
    
    GET /api/v1/auth/debug/
    
    SOLO DISPONIBLE EN DESARROLLO.
    Retorna información sobre el usuario autenticado según el token JWT.
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """
        Retorna información de debugging sobre el usuario autenticado.
        
        Returns:
            200: Información del usuario y token
            404: En producción (debug deshabilitado)
        """
        # 🔒 PROTECCIÓN: Solo disponible en desarrollo
        from django.conf import settings
        from django.http import Http404
        
        if not settings.DEBUG:
            raise Http404("Debug endpoint only available in development")
        
        import logging
        logger = logging.getLogger(__name__)
        
        user = request.user
        
        # Información del token (si está disponible)
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        token_preview = auth_header[:50] + '...' if len(auth_header) > 50 else auth_header
        
        debug_info = {
            'message': 'Debug de autenticación',
            'token_preview': token_preview,
            'user': {
                'id': user.id,
                'email': user.email,
                'username': user.username,
                'role': user.role,
                'is_approved': user.is_approved,
                'is_active': user.is_active,
            },
            'request_info': {
                'method': request.method,
                'path': request.path,
                'remote_addr': request.META.get('REMOTE_ADDR', 'unknown'),
            }
        }
        
        logger.info(f"[DEBUG AUTH] Usuario autenticado: {user.email} (ID: {user.id})")
        
        return Response(debug_info, status=status.HTTP_200_OK)
