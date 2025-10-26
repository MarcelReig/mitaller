import logging
import re
from urllib.parse import urlparse
import cloudinary.uploader
from django.db import transaction
from django.core.exceptions import ValidationError

from accounts.models import User
from artisans.models import ArtisanProfile
from works.models import Work
from orders.models import Order

logger = logging.getLogger(__name__)


def extract_cloudinary_public_id(url: str) -> str | None:
    """
    Extrae el public_id de una URL de Cloudinary.
    
    Input: https://res.cloudinary.com/xxx/image/upload/v1234567890/works/abc123.jpg
    Output: works/abc123
    """
    if not url or 'cloudinary.com' not in url:
        return None
    
    try:
        # Split por '/upload/' y tomar parte derecha
        parts = url.split('/upload/')
        if len(parts) != 2:
            return None
        
        path = parts[1]
        
        # Remover versión (v[números]/)
        path = re.sub(r'^v\d+/', '', path)
        
        # Remover extensión
        path = re.sub(r'\.[^.]+$', '', path)
        
        return path
    
    except Exception as e:
        logger.warning(f"Error extrayendo public_id de {url}: {e}")
        return None


def delete_artist_cascade(artist_id: str) -> dict:
    """
    Elimina un artista y todo su contenido relacionado.
    Incluye validación de pedidos completados.
    """
    logger.info(f"Iniciando eliminación en cascada para artista {artist_id}")
    
    # 1. VALIDAR
    try:
        user = User.objects.get(id=artist_id, role='artisan')
    except User.DoesNotExist:
        raise ValidationError("Artista no encontrado")
    
    # Verificar pedidos completados
    completed_orders = Order.objects.filter(
        artist=user, 
        status='completed'
    ).count()
    
    if completed_orders > 0:
        raise ValidationError(
            f"No se puede eliminar. El artista tiene {completed_orders} "
            f"pedidos completados. Por razones de auditoría, debe conservarse."
        )
    
    # 2. RECOPILAR DATOS
    images_to_delete = []
    works_count = 0
    
    try:
        profile = user.artisan_profile
        if profile.avatar:
            images_to_delete.append(profile.avatar)
        if profile.cover_image:
            images_to_delete.append(profile.cover_image)
    except ArtisanProfile.DoesNotExist:
        profile = None
    
    works = Work.objects.filter(artisan=user)
    works_count = works.count()
    
    for work in works:
        if work.thumbnail:
            images_to_delete.append(work.thumbnail)
        if hasattr(work, 'images'):
            images_to_delete.extend(work.images)
    
    # 3. ELIMINAR DE CLOUDINARY
    images_deleted = 0
    for image_url in images_to_delete:
        public_id = extract_cloudinary_public_id(image_url)
        if public_id:
            try:
                result = cloudinary.uploader.destroy(public_id)
                if result.get('result') == 'ok':
                    images_deleted += 1
                    logger.info(f"Imagen eliminada: {public_id}")
            except Exception as e:
                logger.error(f"Error eliminando imagen {public_id}: {e}")
    
    # 4. ELIMINAR DE BD (con transacción)
    with transaction.atomic():
        # Orden importante: obras → perfil → usuario
        Work.objects.filter(artisan=user).delete()
        
        if profile:
            profile.delete()
        
        username = user.username
        user.delete()
    
    logger.info(
        f"Artista {username} eliminado: {works_count} obras, "
        f"{images_deleted} imágenes"
    )
    
    # 5. RETORNAR RESUMEN
    return {
        'user_id': artist_id,
        'username': username,
        'works_deleted': works_count,
        'images_deleted': images_deleted,
        'success': True
    }

