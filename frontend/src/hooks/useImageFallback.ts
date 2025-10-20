/**
 * Hook para manejo de errores de imagen con fallback automático
 * 
 * Usage:
 * const { src, onError } = useImageFallback(
 *   originalSrc, 
 *   fallbackSrc
 * );
 * 
 * <img src={src} onError={onError} />
 */

'use client';

import { useState, useCallback } from 'react';

export function useImageFallback(
  originalSrc: string | null | undefined,
  fallbackSrc: string
) {
  const [src, setSrc] = useState(originalSrc || fallbackSrc);
  const [hasError, setHasError] = useState(false);

  const onError = useCallback(() => {
    if (!hasError) {
      setHasError(true);
      setSrc(fallbackSrc);
    }
  }, [hasError, fallbackSrc]);

  return {
    src,
    onError,
    hasError,
  };
}

