"""
Cloudinary Views
Endpoints para gestión de uploads seguros a Cloudinary
"""

import time
import cloudinary.utils
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_upload_signature(request):
    """
    Genera una firma segura para upload a Cloudinary.
    
    Endpoint: POST /api/v1/works/cloudinary/signature/
    
    Este endpoint permite signed uploads desde el frontend sin exponer
    el API Secret. El frontend solicita una firma, el backend la genera
    con el API Secret (que nunca sale del servidor), y luego el frontend
    puede subir directamente a Cloudinary con esa firma.
    
    Flow:
    1. Frontend solicita signature a este endpoint
    2. Backend genera signature con API_SECRET (seguro)
    3. Frontend sube a Cloudinary con signature, timestamp y api_key
    4. Cloudinary valida la firma y acepta el upload
    
    Body (opcional):
    {
        "folder": "mitaller/custom"  // Folder personalizado
    }
    
    Response:
    {
        "signature": "abc123...",
        "timestamp": 1234567890,
        "api_key": "961271184574641",
        "cloud_name": "dvndr6mv",
        "upload_preset": "mitaller-unsigned",
        "folder": "mitaller",
        "transformation": "a_auto/c_limit,w_2000,h_2000/q_auto:good/f_auto/fl_strip_profile"
    }
    
    Seguridad:
    - Requiere autenticación (IsAuthenticated)
    - API_SECRET nunca sale del servidor
    - Signature tiene timestamp (expira en ~1 hora por defecto)
    - Solo usuarios autenticados pueden obtener signatures
    - Transformación firmada (Cloudinary la aplica garantizado)
    """
    
    # Verificar que Cloudinary está configurado
    if not all([
        settings.CLOUDINARY_CLOUD_NAME,
        settings.CLOUDINARY_API_KEY,
        settings.CLOUDINARY_API_SECRET
    ]):
        return Response(
            {
                "error": "Cloudinary no está configurado en el servidor"
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
    # Obtener folder del request (opcional)
    folder = request.data.get('folder', 'mitaller')
    
    # Timestamp actual (en segundos)
    timestamp = int(time.time())
    
    # Transformación de imágenes (optimización + privacidad)
    # a_auto: auto-rotate basado en EXIF (fotos móvil correctas)
    # c_limit,w_2000,h_2000: resize máximo 2000px (reduce peso)
    # q_auto:good: calidad automática optimizada
    # f_auto: formato automático (WebP en navegadores modernos)
    # fl_strip_profile: eliminar metadata EXIF (privacidad - GPS, cámara, etc)
    # IMPORTANTE: Al incluir en params firmados, se aplica en UPLOAD (garantizado)
    transformation = 'a_auto/c_limit,w_2000,h_2000/q_auto:good/f_auto/fl_strip_profile'
    
    # Parámetros para la firma
    # IMPORTANTE: Incluir upload_preset y transformation para que Cloudinary los aplique
    params = {
        'timestamp': timestamp,
        'folder': folder,
        'upload_preset': settings.CLOUDINARY_UPLOAD_PRESET,
        'transformation': transformation,
    }
    
    # Generar signature usando el API_SECRET
    # Esta es la parte crítica: el API_SECRET solo existe aquí, en el servidor
    signature = cloudinary.utils.api_sign_request(
        params,
        settings.CLOUDINARY_API_SECRET
    )
    
    # Retornar datos necesarios para el upload
    return Response({
        'signature': signature,
        'timestamp': timestamp,
        'api_key': settings.CLOUDINARY_API_KEY,
        'cloud_name': settings.CLOUDINARY_CLOUD_NAME,
        'upload_preset': settings.CLOUDINARY_UPLOAD_PRESET,
        'folder': folder,
        'transformation': transformation,  # ← AÑADIDO
    })

@api_view(['GET'])
def cloudinary_config(request):
    """
    Retorna configuración pública de Cloudinary.
    
    Endpoint: GET /api/v1/cloudinary/config/
    
    Este endpoint es público y solo retorna información no sensible
    que el frontend necesita para configurar uploads.
    
    Response:
    {
        "cloud_name": "dvndr6mv",
        "upload_preset": "mitaller-unsigned"
    }
    
    Nota: No incluye API_KEY ni API_SECRET por seguridad
    """
    return Response({
        'cloud_name': settings.CLOUDINARY_CLOUD_NAME,
        'upload_preset': settings.CLOUDINARY_UPLOAD_PRESET,
    })

