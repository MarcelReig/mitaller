import { useState, useEffect } from 'react';

/**
 * Hook para detectar media queries en el cliente
 *
 * @param query - Media query string (ej: "(min-width: 768px)")
 * @returns boolean indicando si la media query coincide
 *
 * @example
 * ```tsx
 * const isDesktop = useMediaQuery('(min-width: 768px)');
 * const isMobile = useMediaQuery('(max-width: 640px)');
 * ```
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);

    // Set initial value
    setMatches(media.matches);

    // Create listener
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Modern browsers
    if (media.addEventListener) {
      media.addEventListener('change', listener);
      return () => media.removeEventListener('change', listener);
    }

    // Fallback for older browsers
    media.addListener(listener);
    return () => media.removeListener(listener);
  }, [query]);

  return matches;
}
