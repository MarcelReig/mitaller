from django.apps import AppConfig


class ArtisansConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'artisans'
    
    def ready(self):
        """
        Importa signals cuando la app está lista.
        Esto registra los receivers para creación automática de perfiles.
        """
        import artisans.signals

