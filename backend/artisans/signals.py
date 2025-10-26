"""
Signals para la app artisans.
Gestiona la creación automática de perfiles de artesanos y actualización de contadores.
"""
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from accounts.models import User, UserRole
from .models import ArtisanProfile, CraftType, MenorcaLocation


@receiver(post_save, sender=User)
def create_artisan_profile(sender, instance: User, created: bool, **kwargs):
    """
    Signal que crea automáticamente un ArtisanProfile cuando se registra un artesano.
    
    Flujo:
    1. Usuario se registra con role=ARTISAN
    2. Signal detecta creación de User
    3. Crea ArtisanProfile asociado con valores por defecto
    
    Campos por defecto:
    - slug: generado desde username
    - display_name: full_name del usuario o username como fallback
    - craft_type: OTHER (el artesano lo completa después)
    - location: OTHER (el artesano lo completa después)
    
    Solo se ejecuta si:
    - El usuario es nuevo (created=True)
    - El usuario tiene role=ARTISAN
    - No existe ya un ArtisanProfile asociado
    """
    # Verificar que sea un nuevo usuario artesano
    if not created:
        return
    
    if instance.role != UserRole.ARTISAN:
        return
    
    # Verificar que no tenga ya un perfil
    if hasattr(instance, 'artisan_profile'):
        return
    
    # Crear perfil de artesano con valores por defecto
    ArtisanProfile.objects.create(
        user=instance,
        slug=instance.username,  # Se puede regenerar en save() si hay conflicto
        display_name=instance.get_full_name() or instance.username,
        craft_type=CraftType.OTHER,
        location=MenorcaLocation.OTHER,
    )


def update_artisan_work_count(artisan_profile):
    """
    Actualiza el contador de obras de un artesano.
    
    Args:
        artisan_profile: Instancia de ArtisanProfile
    """
    if not artisan_profile:
        return
    
    # Importar aquí para evitar circular imports
    from works.models import Work
    
    # Contar todas las obras (en Works no hay is_published)
    count = Work.objects.filter(artisan=artisan_profile.user).count()
    
    # Actualizar contador
    artisan_profile.total_works = count
    artisan_profile.save(update_fields=['total_works'])


# Signals para actualizar contador de obras
@receiver(post_save, sender='works.Work')
def update_work_count_on_save(sender, instance, **kwargs):
    """
    Actualiza el contador de obras cuando se crea o modifica una obra.
    Se ejecuta después de guardar una Work.
    """
    try:
        artisan_profile = instance.artisan.artisan_profile
        update_artisan_work_count(artisan_profile)
    except Exception:
        pass


@receiver(post_delete, sender='works.Work')
def update_work_count_on_delete(sender, instance, **kwargs):
    """
    Actualiza el contador de obras cuando se elimina una obra.
    Se ejecuta después de eliminar una Work.
    """
    try:
        artisan_profile = instance.artisan.artisan_profile
        update_artisan_work_count(artisan_profile)
    except Exception:
        pass


# ========== SIGNALS PARA PRODUCTOS (SHOP) ==========

def update_artisan_product_count(artisan_profile):
    """
    Actualiza el contador de productos de un artesano.
    
    Args:
        artisan_profile: Instancia de ArtisanProfile
    """
    if not artisan_profile:
        return
    
    # Importar aquí para evitar circular imports
    from shop.models import Product
    
    # Contar todos los productos del artesano
    count = Product.objects.filter(artisan=artisan_profile.user).count()
    
    # Actualizar contador
    artisan_profile.total_products = count
    artisan_profile.save(update_fields=['total_products'])


# Signals para actualizar contador de productos
@receiver(post_save, sender='shop.Product')
def update_product_count_on_save(sender, instance, created, **kwargs):
    """
    Actualiza el contador de productos cuando se crea o modifica un producto.
    
    Solo incrementa el contador cuando se crea un nuevo producto (created=True).
    Si se edita un producto existente, no afecta el contador.
    
    Args:
        sender: Modelo que envía la señal (Product)
        instance: Instancia del producto guardado
        created: True si es un producto nuevo, False si es actualización
        **kwargs: Argumentos adicionales del signal
    """
    # Siempre recalcular el total para mantener consistencia
    try:
        artisan_profile = instance.artisan.artisan_profile
        update_artisan_product_count(artisan_profile)
    except Exception:
        pass


@receiver(post_delete, sender='shop.Product')
def update_product_count_on_delete(sender, instance, **kwargs):
    """
    Actualiza el contador de productos cuando se elimina un producto.
    Se ejecuta después de eliminar un Product.
    
    Args:
        sender: Modelo que envía la señal (Product)
        instance: Instancia del producto eliminado
        **kwargs: Argumentos adicionales del signal
    """
    try:
        artisan_profile = instance.artisan.artisan_profile
        update_artisan_product_count(artisan_profile)
    except Exception:
        pass
