// Tipos para artistas y perfiles de artesanos de MiTaller.art

/**
 * Usuario mínimo (del artista)
 */
export interface ArtistUser {
  email: string;
  username: string;
}

/**
 * Tipos de artesanía disponibles en Menorca
 */
export type CraftType = 
  | 'ceramics'   // Cerámica
  | 'jewelry'    // Joyería
  | 'textiles'   // Textiles
  | 'wood'       // Madera
  | 'leather'    // Marroquinería
  | 'glass'      // Vidrio
  | 'other';     // Otro

/**
 * Ubicaciones de Menorca
 */
export type Location = 
  | 'mao'         // Maó
  | 'ciutadella'  // Ciutadella
  | 'es_mercadal' // Es Mercadal
  | 'alaior'      // Alaior
  | 'es_migjorn'  // Es Migjorn Gran
  | 'es_castell'  // Es Castell
  | 'ferreries'   // Ferreries
  | 'sant_lluis'  // Sant Lluís
  | 'other';      // Otro

/**
 * Perfil completo del artista/artesano
 */
export interface Artist {
  id: number;
  user: ArtistUser;
  slug: string;
  display_name: string;
  bio: string;
  craft_type: CraftType;
  location: Location;
  avatar: string | null;
  cover_image: string | null;
  website: string | null;
  instagram: string | null;
  instagram_url: string | null;
  phone: string | null;
  full_location: string;
  total_works: number;
  total_products: number;
  is_featured: boolean;
  created_at: string;
}

/**
 * Versión simplificada del artista (para referencias anidadas)
 */
export type ArtistSummary = {
  id: number;
  slug: string;
  display_name: string;
  avatar: string | null;
};

/**
 * Perfil de artista para listados (API pública)
 * Más completo que ArtistSummary, usado por el backend
 */
export interface ArtistListItem {
  slug: string;
  display_name: string;
  craft_type: CraftType;
  location: Location;
  avatar: string | null;
  total_works: number;
  total_products: number;
  is_featured: boolean;
}

/**
 * Datos para crear/actualizar perfil de artista (con archivos)
 */
export type ArtistFormData = {
  display_name: string;
  bio?: string;
  craft_type: CraftType;
  location: Location;
  website?: string;
  instagram?: string;
  avatar?: File | null;
  cover_image?: File | null;
};

/**
 * Datos para actualizar perfil de artista (API)
 * Incluye URLs de Cloudinary para imágenes
 */
export interface ArtistUpdateData {
  display_name?: string;
  bio?: string;
  craft_type?: CraftType;
  location?: Location;
  website?: string;
  instagram?: string;
  phone?: string;
  avatar?: string | null;
  cover_image?: string | null;
}

/**
 * Filtros para búsqueda de artistas (con paginación y ordenamiento)
 */
export interface ArtistFilters {
  search?: string;
  craft_type?: CraftType;
  location?: Location;
  is_featured?: boolean;
  ordering?: 'created_at' | '-created_at' | 'display_name' | '-display_name';
  page?: number;
  page_size?: number;
}

/**
 * Labels en español para tipos de artesanía
 */
export const CRAFT_TYPE_LABELS: Record<CraftType, string> = {
  ceramics: 'Cerámica',
  jewelry: 'Joyería',
  textiles: 'Textiles',
  wood: 'Madera',
  leather: 'Marroquinería',
  glass: 'Vidrio',
  other: 'Otro',
};

/**
 * Labels en español para ubicaciones
 */
export const LOCATION_LABELS: Record<Location, string> = {
  mao: 'Maó',
  ciutadella: 'Ciutadella',
  es_mercadal: 'Es Mercadal',
  alaior: 'Alaior',
  es_migjorn: 'Es Migjorn Gran',
  es_castell: 'Es Castell',
  ferreries: 'Ferreries',
  sant_lluis: 'Sant Lluís',
  other: 'Otro',
};
