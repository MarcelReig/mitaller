"""
Configuración de la app shop.
"""
from django.apps import AppConfig


class ShopConfig(AppConfig):
    """
    Configuración de la aplicación shop.
    
    Define metadatos de la app y carga signals automáticamente
    cuando Django inicializa la aplicación.
    """
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'shop'
    verbose_name = 'Tienda de Productos'
    
    def ready(self):
        """
        Se ejecuta cuando Django carga la app.
        
        Importa los signals de artists para registrar los receivers
        de Product (actualización de total_products).
        """
        # Importar signals para registrarlos
        import artists.signals
