"""
Orders app configuration.
"""

from django.apps import AppConfig


class OrdersConfig(AppConfig):
    """
    Configuración de la app Orders.
    Gestiona pedidos y compras en el marketplace.
    """
    
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'orders'
    verbose_name = 'Pedidos'
    
    def ready(self) -> None:
        """
        Import signals cuando la app esté lista.
        Esto registra los receivers para restaurar stock en cancelaciones.
        """
        import orders.signals  # noqa: F401

