// Tipos para artistas (visual/performing artists) - FUTURA IMPLEMENTACIÓN

/**
 * Disciplinas artísticas disponibles
 */
export type ArtisticDiscipline = 
  | 'painting'      // Pintura
  | 'sculpture'     // Escultura
  | 'photography'   // Fotografía
  | 'digital_art'   // Arte Digital
  | 'music'         // Música
  | 'dance'         // Danza
  | 'theater'       // Teatro
  | 'performance'   // Performance
  | 'mixed_media'   // Técnica Mixta
  | 'other';        // Otro

/**
 * Perfil completo del artista
 * Para futura implementación de servicios artísticos
 */
export interface Artist {
  id: number;
  slug: string;
  bio: string;
  avatar: string | null;
  cover_image: string | null;
  
  // Redes sociales (heredado de BaseCreatorProfile)
  website: string | null;
  instagram: string | null;
  facebook: string | null;
  twitter: string | null;
  
  // Ubicación
  city: string;
  country: string;
  
  // Campos específicos de artistas
  discipline: ArtisticDiscipline;
  exhibition_history: string;
  awards: string;
  available_for_commissions: boolean;
  available_for_events: boolean;
  base_price_range: string;
  
  created_at: string;
  updated_at: string;
}

/**
 * Labels en español para disciplinas artísticas
 */
export const DISCIPLINE_LABELS: Record<ArtisticDiscipline, string> = {
  painting: 'Pintura',
  sculpture: 'Escultura',
  photography: 'Fotografía',
  digital_art: 'Arte Digital',
  music: 'Música',
  dance: 'Danza',
  theater: 'Teatro',
  performance: 'Performance',
  mixed_media: 'Técnica Mixta',
  other: 'Otro',
};
