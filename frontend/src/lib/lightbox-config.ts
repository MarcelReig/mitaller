/**
 * Configuración de yet-another-react-lightbox
 * 
 * Plugins disponibles:
 * - Fullscreen: Modo pantalla completa
 * - Slideshow: Reproducción automática
 * - Thumbnails: Miniaturas en la parte inferior
 * - Zoom: Zoom con mouse/touch
 * - Counter: Contador de imágenes (1/10)
 */

/**
 * Configuración por defecto del lightbox
 */
export const defaultLightboxConfig = {
  // Comportamiento
  carousel: {
    finite: false,        // Loop infinito
    preload: 2,           // Precargar 2 imágenes antes/después
  },
  
  // Animaciones
  animation: {
    fade: 250,            // Fade in/out
    swipe: 500,           // Duración del swipe
  },
  
  // Controles
  controller: {
    closeOnBackdropClick: true,
    closeOnPullDown: true,
    closeOnPullUp: true,
  },
  
  // Estilos
  styles: {
    container: {
      backgroundColor: 'rgba(0, 0, 0, 0.95)',
    },
  },
};

/**
 * Transforma URLs de imágenes a formato requerido por lightbox
 */
export function prepareImagesForLightbox(urls: string[]) {
  return urls.map((url) => ({
    src: url,
    alt: '', // Se añadirá dinámicamente desde el componente
  }));
}

