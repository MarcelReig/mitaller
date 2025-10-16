"""
Configuración de la app Payments.
"""

from django.apps import AppConfig


class PaymentsConfig(AppConfig):
    """
    Configuración de la aplicación de pagos.
    Gestiona la integración con Stripe Connect para el marketplace.
    """
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'payments'
    verbose_name = 'Pagos'

    def ready(self) -> None:
        """
        Importa los signals cuando la app está lista.
        """
        import payments.signals  # noqa: F401

