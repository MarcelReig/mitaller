/**
 * WorkLightbox Component
 * 
 * Wrapper de yet-another-react-lightbox con configuración optimizada.
 * 
 * Plugins habilitados:
 * - Fullscreen: F11 o botón
 * - Zoom: Doble click o botón
 * - Counter: Muestra "3 / 10"
 * - Captions: Texto debajo de la imagen (opcional)
 */

'use client';

import { Lightbox } from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';

// Importar plugins
import Fullscreen from 'yet-another-react-lightbox/plugins/fullscreen';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import Counter from 'yet-another-react-lightbox/plugins/counter';

import { galleryUrl } from '@/lib/cloudinary';
import { defaultLightboxConfig } from '@/lib/lightbox-config';

interface WorkLightboxProps {
  images: string[];
  isOpen: boolean;
  currentIndex: number;
  onClose: () => void;
  workTitle: string;
}

export function WorkLightbox({
  images,
  isOpen,
  currentIndex,
  onClose,
  workTitle,
}: WorkLightboxProps) {
  // Preparar slides para lightbox
  const slides = images.map((url, index) => ({
    src: galleryUrl(url),
    alt: `${workTitle} - Imagen ${index + 1}`,
  }));

  return (
    <Lightbox
      open={isOpen}
      close={onClose}
      slides={slides}
      index={currentIndex}
      plugins={[Fullscreen, Zoom, Counter]}
      zoom={{
        maxZoomPixelRatio: 3,
        scrollToZoom: true,
      }}
      {...defaultLightboxConfig}
    />
  );
}

