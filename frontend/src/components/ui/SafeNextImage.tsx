/**
 * SafeNextImage Component
 * 
 * Next.js Image con fallback automático
 * 
 * Usage:
 * <SafeNextImage
 *   src={work.thumbnail_url}
 *   alt={work.title}
 *   fill
 *   fallbackType="artwork"
 *   fallbackId={work.id}
 * />
 */

'use client';

import Image, { ImageProps } from 'next/image';
import { useState } from 'react';
import {
  artworkPlaceholder,
  productPlaceholder,
  avatarPlaceholder,
  emptyStatePlaceholder,
  type PlaceholderType,
  type PlaceholderSize,
} from '@/lib/placeholders';

interface SafeNextImageProps extends Omit<ImageProps, 'src' | 'onError'> {
  src?: string | null;
  fallbackType?: PlaceholderType;
  fallbackId?: string | number;
  fallbackSize?: PlaceholderSize;
  fallbackText?: string;
}

export function SafeNextImage({
  src,
  alt,
  fallbackType = 'generic',
  fallbackId,
  fallbackSize = 'medium',
  fallbackText,
  ...props
}: SafeNextImageProps) {
  const [imageSrc, setImageSrc] = useState(src || '');
  const [hasError, setHasError] = useState(false);

  // Generar fallback
  const getFallback = () => {
    if (!fallbackId) {
      return emptyStatePlaceholder(fallbackText || alt, fallbackSize);
    }

    switch (fallbackType) {
      case 'artwork':
        return artworkPlaceholder(fallbackId, fallbackSize);
      case 'product':
        return productPlaceholder(fallbackId, fallbackSize);
      case 'avatar':
        return avatarPlaceholder(fallbackId, 150);
      default:
        return emptyStatePlaceholder(fallbackText || alt, fallbackSize);
    }
  };

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImageSrc(getFallback());
    }
  };

  // Si no hay src inicial, usar fallback
  const finalSrc = imageSrc || getFallback();

  return (
    <Image
      src={finalSrc}
      alt={alt}
      onError={handleError}
      {...props}
    />
  );
}

