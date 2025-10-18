/**
 * WorkGallery Component
 * 
 * Grid de imágenes con click para abrir lightbox.
 * Usa Next.js Image component para optimización.
 * 
 * Features:
 * - Grid responsive (2/3/4 columnas)
 * - Hover effect
 * - Click abre lightbox en la imagen específica
 */

'use client';

import Image from 'next/image';
import { galleryUrl } from '@/lib/cloudinary';

interface WorkGalleryProps {
  images: string[];
  workTitle: string;
  onImageClick: (index: number) => void;
}

export function WorkGallery({ images, workTitle, onImageClick }: WorkGalleryProps) {
  if (!images || images.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">
          No hay imágenes en esta colección.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {images.map((imageUrl, index) => (
        <button
          key={index}
          onClick={() => onImageClick(index)}
          className="group relative aspect-square overflow-hidden rounded-lg bg-muted cursor-pointer"
        >
          <Image
            src={galleryUrl(imageUrl)}
            alt={`${workTitle} - Imagen ${index + 1}`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
          
          {/* Overlay en hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
          
          {/* Número de imagen */}
          <div className="absolute bottom-2 right-2 bg-black/75 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
            {index + 1} / {images.length}
          </div>
        </button>
      ))}
    </div>
  );
}

