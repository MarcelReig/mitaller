/* eslint-disable @next/next/no-img-element */
/**
 * SafeImage Component
 * 
 * Uses native <img> for compatibility with third-party components
 * that don't support Next.js Image (e.g., shadcn/ui Avatar).
 * 
 * WHEN TO USE:
 * - Small images (avatars, icons) < 50x50px
 * - Inside shadcn/ui components (Avatar, Card)
 * - Third-party components expecting <img>
 * 
 * FOR LARGE IMAGES: Use SafeNextImage for automatic optimization.
 * 
 * Componente de imagen con fallback automático si falla la carga
 * 
 * Usage:
 * <SafeImage
 *   src={work.thumbnail_url}
 *   alt={work.title}
 *   fallbackType="artwork"
 *   fallbackId={work.id}
 *   className="w-full h-full object-cover"
 * />
 */

'use client';

import { ImgHTMLAttributes } from 'react';
import { useImageFallback } from '@/hooks/useImageFallback';
import {
  artworkPlaceholder,
  productPlaceholder,
  avatarPlaceholder,
  emptyStatePlaceholder,
  type PlaceholderType,
  type PlaceholderSize,
} from '@/lib/placeholders';

interface SafeImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src?: string | null;
  alt: string;
  fallbackType?: PlaceholderType;
  fallbackId?: string | number;
  fallbackSize?: PlaceholderSize | { width: number; height: number };
  fallbackText?: string;
}

export function SafeImage({
  src,
  alt,
  fallbackType = 'generic',
  fallbackId,
  fallbackSize = 'medium',
  fallbackText,
  className,
  ...props
}: SafeImageProps) {
  // Generar fallback según tipo
  const getFallback = () => {
    if (!fallbackId) {
      return emptyStatePlaceholder(fallbackText || alt);
    }

    switch (fallbackType) {
      case 'artwork':
        return artworkPlaceholder(
          fallbackId,
          typeof fallbackSize === 'string' ? fallbackSize : 'medium'
        );
      case 'product':
        return productPlaceholder(
          fallbackId,
          typeof fallbackSize === 'string' ? fallbackSize : 'medium'
        );
      case 'avatar':
        const size = typeof fallbackSize === 'object' 
          ? fallbackSize.width 
          : 150;
        return avatarPlaceholder(fallbackId, size);
      default:
        return emptyStatePlaceholder(fallbackText || alt);
    }
  };

  const fallbackSrc = getFallback();
  const { src: imageSrc, onError } = useImageFallback(src, fallbackSrc);

  return (
    <img
      src={imageSrc}
      alt={alt}
      onError={onError}
      className={className}
      {...props}
    />
  );
}

