// Tipos para artistas y perfiles de artesanos de MiTaller.art

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
  | 'sant_lluis'; // Sant Lluís

/**
 * Perfil completo del artista/artesano
 */
export type Artist = {
  id: number;
  slug: string;
  display_name: string;
  bio: string;
  craft_type: CraftType;
  location: Location;
  avatar: string | null;
  cover_image: string | null;
  website: string;
  instagram: string;
  facebook: string;
  instagram_url: string;
  full_location: string;
  total_works: number;
  total_products: number;
  is_featured: boolean;
  created_at: string;
};

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
 * Datos para crear/actualizar perfil de artista
 */
export type ArtistFormData = {
  display_name: string;
  bio?: string;
  craft_type: CraftType;
  location: Location;
  website?: string;
  instagram?: string;
  facebook?: string;
  avatar?: File | null;
  cover_image?: File | null;
};

/**
 * Filtros para búsqueda de artistas
 */
export type ArtistFilters = {
  search?: string;
  craft_type?: CraftType;
  location?: Location;
  is_featured?: boolean;
};

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
};
