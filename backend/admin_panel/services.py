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


def delete_artisan_cascade(artisan_id: str) -> dict:
    """
    Deletes an artisan and all related content.
    Includes validation for completed orders.
    """
    logger.info(f"Starting cascade deletion for artisan {artisan_id}")

    # 1. VALIDATE
    try:
        user = User.objects.get(id=artisan_id, role='artisan')
    except User.DoesNotExist:
        raise ValidationError("Artisan not found")
    
    # Check for completed orders (through OrderItem relationship)
    completed_orders = Order.objects.filter(
        items__artisan=user,
        status='completed'
    ).distinct().count()

    if completed_orders > 0:
        raise ValidationError(
            f"Cannot delete. Artisan has {completed_orders} "
            f"completed orders. Must be kept for audit purposes."
        )

    # 2. COLLECT DATA
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
        if work.thumbnail_url:
            images_to_delete.append(work.thumbnail_url)
        if hasattr(work, 'images') and work.images:
            images_to_delete.extend(work.images)
    
    # 3. DELETE FROM CLOUDINARY
    images_deleted = 0
    for image_url in images_to_delete:
        public_id = extract_cloudinary_public_id(image_url)
        if public_id:
            try:
                result = cloudinary.uploader.destroy(public_id)
                if result.get('result') == 'ok':
                    images_deleted += 1
                    logger.info(f"Image deleted: {public_id}")
            except Exception as e:
                logger.error(f"Error deleting image {public_id}: {e}")

    # 4. DELETE FROM DB (with transaction)
    with transaction.atomic():
        # Important order: works → profile → user
        Work.objects.filter(artisan=user).delete()

        if profile:
            profile.delete()

        username = user.username
        user.delete()

    logger.info(
        f"Artisan {username} deleted: {works_count} works, "
        f"{images_deleted} images"
    )

    # 5. RETURN SUMMARY
    return {
        'user_id': artisan_id,
        'username': username,
        'works_deleted': works_count,
        'images_deleted': images_deleted,
        'success': True
    }

