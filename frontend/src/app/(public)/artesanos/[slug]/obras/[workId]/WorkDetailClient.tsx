/**
 * WorkDetailClient Component
 * 
 * Client Component que maneja el estado del lightbox.
 * Separado del Server Component para mejor performance.
 */

'use client';

import { useState } from 'react';
import { 
  WorkDetailHeader, 
  WorkGallery, 
  WorkLightbox 
} from '@/components/works';
import type { Work } from '@/types/work';

interface WorkDetailClientProps {
  work: Work;
  artisanSlug: string;
}

export function WorkDetailClient({ work, artisanSlug }: WorkDetailClientProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleImageClick = (index: number) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  };

  return (
    <div className="space-y-8">
      
      {/* Header con info de la obra */}
      <WorkDetailHeader work={work} artisanSlug={artisanSlug} />

      {/* Grid de imágenes */}
      <WorkGallery
        images={work.images}
        workTitle={work.title}
        workId={work.id}
        onImageClick={handleImageClick}
      />

      {/* Lightbox (modal) */}
      <WorkLightbox
        images={work.images}
        isOpen={lightboxOpen}
        currentIndex={currentImageIndex}
        onClose={() => setLightboxOpen(false)}
        workTitle={work.title}
      />

    </div>
  );
}

