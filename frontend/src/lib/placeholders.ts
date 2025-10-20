/**
 * Sistema de Placeholders para MiTaller
 * 
 * Features:
 * - Placeholders simples y confiables
 * - Fallback automático si una imagen falla
 * - Consistencia (mismo ID = misma imagen)
 * - Personalizable por tipo de contenido
 */

/**
 * Colores del tema MiTaller
 */
const THEME_COLORS = {
  primary: '334155',      // Slate-700
  secondary: 'F8FAFC',    // Slate-50
  muted: 'F1F5F9',        // Slate-100
  mutedText: '94A3B8',    // Slate-400
  accent: '0EA5E9',       // Sky-500
};

/**
 * Tipos de placeholder disponibles
 */
export type PlaceholderType = 
  | 'artwork'
  | 'product'
  | 'avatar'
  | 'empty'
  | 'generic';

/**
 * Tamaños predefinidos
 */
export type PlaceholderSize = 
  | 'thumbnail'  // 400x400
  | 'small'      // 600x400
  | 'medium'     // 800x600
  | 'large'      // 1200x900
  | 'hero';      // 1920x1080

const SIZE_MAP: Record<PlaceholderSize, { width: number; height: number }> = {
  thumbnail: { width: 400, height: 400 },
  small: { width: 600, height: 400 },
  medium: { width: 800, height: 600 },
  large: { width: 1200, height: 900 },
  hero: { width: 1920, height: 1080 },
};

/**
 * Mensajes por tipo de contenido
 */
const TYPE_MESSAGES: Record<PlaceholderType, string> = {
  artwork: 'Obra',
  product: 'Producto',
  avatar: 'Avatar',
  empty: 'Sin imagen',
  generic: 'Imagen',
};

/**
 * Colores por tipo de contenido
 */
const TYPE_COLORS: Record<PlaceholderType, { bg: string; text: string }> = {
  artwork: { bg: THEME_COLORS.primary, text: THEME_COLORS.secondary },
  product: { bg: THEME_COLORS.accent, text: THEME_COLORS.secondary },
  avatar: { bg: THEME_COLORS.primary, text: THEME_COLORS.secondary },
  empty: { bg: THEME_COLORS.muted, text: THEME_COLORS.mutedText },
  generic: { bg: THEME_COLORS.primary, text: THEME_COLORS.secondary },
};

// ===== FUNCIONES PRINCIPALES =====

/**
 * Placeholder simple usando via.placeholder.com
 * 100% confiable, nunca falla
 */
export function createPlaceholder(
  width: number,
  height: number,
  options?: {
    text?: string;
    bgColor?: string;
    textColor?: string;
  }
): string {
  const {
    text = 'Imagen',
    bgColor = THEME_COLORS.primary,
    textColor = THEME_COLORS.secondary,
  } = options || {};

  const encodedText = encodeURIComponent(text);
  return `https://via.placeholder.com/${width}x${height}/${bgColor}/${textColor}?text=${encodedText}`;
}

/**
 * Placeholder con imagen real usando Picsum
 * Útil para preview más realista
 */
export function createPicsumPlaceholder(
  width: number,
  height: number,
  options?: {
    seed?: string;
    blur?: number;
    grayscale?: boolean;
  }
): string {
  const { seed, blur, grayscale } = options || {};

  let url = seed
    ? `https://picsum.photos/seed/${seed}/${width}/${height}`
    : `https://picsum.photos/${width}/${height}`;

  const params: string[] = [];
  if (blur) params.push(`blur=${blur}`);
  if (grayscale) params.push('grayscale');

  if (params.length > 0) {
    url += `?${params.join('&')}`;
  }

  return url;
}

/**
 * Placeholder tipado por contenido
 * Usa colores y textos apropiados según el tipo
 */
export function getPlaceholder(
  type: PlaceholderType,
  size: PlaceholderSize | { width: number; height: number },
  options?: {
    id?: string | number;  // Para consistencia (mismo ID = misma imagen)
    text?: string;         // Override del texto
    useRealImage?: boolean; // Usar Picsum en vez de placeholder simple
  }
): string {
  const { id, text, useRealImage = false } = options || {};

  // Obtener dimensiones
  const dimensions = typeof size === 'string' ? SIZE_MAP[size] : size;
  const { width, height } = dimensions;

  // Texto a mostrar
  const displayText = text || TYPE_MESSAGES[type];

  // Si se pide imagen real
  if (useRealImage) {
    return createPicsumPlaceholder(width, height, {
      seed: id ? `${type}-${id}` : undefined,
    });
  }

  // Placeholder simple
  const colors = TYPE_COLORS[type];
  return createPlaceholder(width, height, {
    text: displayText,
    bgColor: colors.bg,
    textColor: colors.text,
  });
}

// ===== ATAJOS ESPECÍFICOS =====

/**
 * Placeholder para obras de arte
 */
export function artworkPlaceholder(
  workId: number | string,
  size: PlaceholderSize = 'medium',
  useRealImage: boolean = true
): string {
  return getPlaceholder('artwork', size, {
    id: workId,
    useRealImage,
  });
}

/**
 * Placeholder para productos
 */
export function productPlaceholder(
  productId: number | string,
  size: PlaceholderSize = 'medium',
  useRealImage: boolean = true
): string {
  return getPlaceholder('product', size, {
    id: productId,
    useRealImage,
  });
}

/**
 * Placeholder para avatares
 */
export function avatarPlaceholder(
  userId: number | string,
  size: number = 150,
  useRealImage: boolean = true
): string {
  return getPlaceholder('avatar', { width: size, height: size }, {
    id: userId,
    useRealImage,
  });
}

/**
 * Placeholder para empty states
 */
export function emptyStatePlaceholder(
  message: string = 'Sin contenido',
  size: PlaceholderSize = 'medium'
): string {
  return getPlaceholder('empty', size, {
    text: message,
    useRealImage: false, // Empty states siempre usan placeholder simple
  });
}

/**
 * Placeholder genérico (cuando no sabes el tipo)
 */
export function genericPlaceholder(
  width: number,
  height: number,
  text?: string
): string {
  return getPlaceholder('generic', { width, height }, {
    text,
    useRealImage: false,
  });
}

