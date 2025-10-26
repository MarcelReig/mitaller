/**
 * API Client para artesanos (craftspeople)
 * Gestiona perfiles públicos y operaciones CRUD para artesanos
 */

import axiosInstance from '../axios';
import type {
  Artisan,
  ArtisanListItem,
  ArtisanUpdateData,
  ArtisanFilters,
  PaginatedResponse,
  WorkListItem,
} from '@/types';

/**
 * Obtener lista de artesanos (público)
 * Endpoint: GET /api/v1/artisans/
 */
export async function getArtisans(
  filters?: ArtisanFilters
): Promise<PaginatedResponse<ArtisanListItem>> {
  const params = new URLSearchParams();
  
  if (filters?.search) params.append('search', filters.search);
  if (filters?.craft_type) params.append('craft_type', filters.craft_type);
  if (filters?.location) params.append('location', filters.location);
  if (filters?.is_featured !== undefined) {
    params.append('is_featured', filters.is_featured.toString());
  }
  if (filters?.ordering) params.append('ordering', filters.ordering);
  if (filters?.page) params.append('page', filters.page.toString());
  if (filters?.page_size) params.append('page_size', filters.page_size.toString());
  
  const queryString = params.toString();
  const url = queryString ? `/api/v1/artisans/?${queryString}` : '/api/v1/artisans/';
  
  const response = await axiosInstance.get<PaginatedResponse<ArtisanListItem>>(url);
  return response.data;
}

/**
 * Obtener perfil de artesano por slug (público)
 * Endpoint: GET /api/v1/artisans/{slug}/
 */
export async function getArtisan(slug: string): Promise<Artisan> {
  const response = await axiosInstance.get<Artisan>(`/api/v1/artisans/${slug}/`);
  return response.data;
}

/**
 * Obtener mi perfil de artesano (requiere autenticación)
 * Endpoint: GET /api/v1/artisans/me/
 */
export async function getMyArtisanProfile(): Promise<Artisan> {
  const response = await axiosInstance.get<Artisan>('/api/v1/artisans/me/');
  return response.data;
}

/**
 * Actualizar mi perfil de artesano (requiere autenticación)
 * Endpoint: PATCH /api/v1/artisans/me/
 */
export async function updateMyArtisanProfile(
  data: ArtisanUpdateData
): Promise<Artisan> {
  const response = await axiosInstance.patch<Artisan>('/api/v1/artisans/me/', data);
  return response.data;
}

/**
 * Obtener obras de un artesano específico
 * Endpoint: GET /api/v1/artisans/{slug}/works/
 */
export async function getArtisanWorks(slug: string): Promise<WorkListItem[]> {
  const response = await axiosInstance.get<WorkListItem[]>(`/api/v1/artisans/${slug}/works/`);
  return response.data;
}

