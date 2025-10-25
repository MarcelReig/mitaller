/**
 * API Client para Artists
 * 
 * Funciones para interactuar con el backend de perfiles de artistas.
 * Usa axiosInstance para autenticación JWT automática.
 */

import axiosInstance from '@/lib/axios';
import type {
  Artist,
  ArtistListItem,
  ArtistFilters,
  ArtistUpdateData,
} from '@/types/artist';
import type { Work } from '@/types/work';

/**
 * Respuesta paginada del backend
 */
interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// ===== FUNCIONES PÚBLICAS (sin auth) =====

/**
 * Obtener lista de artistas con filtros opcionales
 */
export async function getArtists(
  params?: ArtistFilters
): Promise<ArtistListItem[]> {
  const response = await axiosInstance.get<PaginatedResponse<ArtistListItem>>(
    '/api/v1/artists/',
    { params }
  );
  return response.data.results;
}

/**
 * Obtener perfil completo de un artista por slug
 */
export async function getArtist(slug: string): Promise<Artist> {
  const response = await axiosInstance.get<Artist>(`/api/v1/artists/${slug}/`);
  return response.data;
}

/**
 * Obtener obras de un artista específico
 */
export async function getArtistWorks(slug: string): Promise<Work[]> {
  const response = await axiosInstance.get<Work[]>(
    `/api/v1/artists/${slug}/works/`
  );
  return response.data;
}

// ===== FUNCIONES PRIVADAS (requieren auth) =====

/**
 * Obtener mi perfil de artista (requiere autenticación)
 */
export async function getMyArtistProfile(): Promise<Artist> {
  const response = await axiosInstance.get<Artist>('/api/v1/artists/me/');
  return response.data;
}

/**
 * Actualizar mi perfil de artista (requiere autenticación)
 */
export async function updateMyArtistProfile(
  data: ArtistUpdateData
): Promise<Artist> {
  const response = await axiosInstance.patch<Artist>(
    '/api/v1/artists/me/',
    data
  );
  return response.data;
}

/**
 * Subir avatar de artista (requiere autenticación)
 * Usa FormData para enviar archivo
 */
export async function uploadArtistAvatar(file: File): Promise<Artist> {
  const formData = new FormData();
  formData.append('avatar', file);

  const response = await axiosInstance.patch<Artist>(
    '/api/v1/artists/me/',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data;
}

/**
 * Subir cover image de artista (requiere autenticación)
 * Usa FormData para enviar archivo
 */
export async function uploadArtistCoverImage(file: File): Promise<Artist> {
  const formData = new FormData();
  formData.append('cover_image', file);

  const response = await axiosInstance.patch<Artist>(
    '/api/v1/artists/me/',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data;
}

// ===== HELPERS =====

/**
 * Construir query params para filtros
 * (Opcional, ya que axios lo hace automáticamente, pero útil para debugging)
 */
export function buildArtistQueryParams(filters: ArtistFilters): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.search) params.append('search', filters.search);
  if (filters.craft_type) params.append('craft_type', filters.craft_type);
  if (filters.location) params.append('location', filters.location);
  if (filters.is_featured !== undefined)
    params.append('is_featured', String(filters.is_featured));
  if (filters.ordering) params.append('ordering', filters.ordering);
  if (filters.page) params.append('page', String(filters.page));
  if (filters.page_size) params.append('page_size', String(filters.page_size));

  return params;
}

