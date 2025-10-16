// Tipos para obras de portfolio de artistas

/**
 * Referencia simplificada al artista en una obra
 */
export type WorkArtist = {
  id: number;
  slug: string;
  display_name: string;
};

/**
 * Obra de arte/portfolio del artista
 * No está a la venta, solo se muestra en el portfolio
 */
export type Work = {
  id: number;
  artist: WorkArtist;
  title: string;
  description: string;
  image_url: string;
  year: number | null;
  display_order: number;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
};

/**
 * Datos para crear/actualizar una obra
 */
export type WorkFormData = {
  title: string;
  description?: string;
  year?: number | null;
  image?: File | null;
  is_featured?: boolean;
  display_order?: number;
};

/**
 * Filtros para búsqueda de obras
 */
export type WorkFilters = {
  artist?: string; // Slug del artista
  is_featured?: boolean;
  year?: number;
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
