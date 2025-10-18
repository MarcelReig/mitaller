// Tipos para obras de portfolio de artistas

/**
 * Categorías de obras disponibles
 */
export type WorkCategory = 
  | 'ceramics'    // Cerámica
  | 'jewelry'     // Joyería
  | 'leather'     // Marroquinería
  | 'textiles'    // Textiles
  | 'wood'        // Madera
  | 'glass'       // Vidrio
  | 'sculpture'   // Escultura
  | 'painting'    // Pintura
  | 'other';      // Otro

/**
 * Labels en español para categorías de obras
 */
export const WORK_CATEGORY_LABELS: Record<WorkCategory, string> = {
  ceramics: 'Cerámica',
  jewelry: 'Joyería',
  leather: 'Marroquinería',
  textiles: 'Textiles',
  wood: 'Madera',
  glass: 'Vidrio',
  sculpture: 'Escultura',
  painting: 'Pintura',
  other: 'Otro',
};

/**
 * Referencia simplificada al artista en una obra
 */
export type WorkArtist = {
  id: number;
  slug: string;
  display_name: string;
  avatar: string | null;
};

/**
 * Versión simplificada de Work para listados (WorkListSerializer)
 * Usada en grids/previews de obras
 */
export type WorkListItem = {
  id: number;
  title: string;
  thumbnail_url: string;
  category: WorkCategory | null;
  is_featured: boolean;
  display_order: number;
};

/**
 * Obra completa de arte/portfolio del artista (WorkSerializer)
 * No está a la venta, solo se muestra en el portfolio
 * Incluye galería completa de imágenes
 */
export type Work = {
  id: number;
  artist: WorkArtist;
  title: string;
  description: string;
  category: WorkCategory | null;
  thumbnail_url: string;           // Imagen principal/portada
  images: string[];                // Array de URLs de imágenes adicionales
  display_order: number;
  is_featured: boolean;
  total_images: number;            // thumbnail + images.length
  created_at: string;
  updated_at: string;
};

/**
 * Datos para crear/actualizar una obra
 */
export type WorkFormData = {
  title: string;
  description?: string;
  category?: WorkCategory;
  thumbnail_url: string;           // URL de Cloudinary
  images?: string[];               // URLs de Cloudinary
  is_featured?: boolean;
  display_order?: number;
};

/**
 * Filtros para búsqueda de obras
 */
export type WorkFilters = {
  artist?: number;                 // ID del artista
  category?: WorkCategory;
  is_featured?: boolean;
  search?: string;
};

/**
 * Respuesta paginada de obras
 */
export type WorkListResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: Work[];
};
