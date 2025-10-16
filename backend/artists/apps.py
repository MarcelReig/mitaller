from django.apps import AppConfig


class ArtistsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'artists'
    
    def ready(self):
        """
        Importa signals cuando la app está lista.
        Esto registra los receivers para creación automática de perfiles.
        """
        import artists.signals

