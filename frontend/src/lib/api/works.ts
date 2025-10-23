/**
 * API Client para Works
 * 
 * Funciones para interactuar con el backend de obras.
 * Usa axiosInstance para autenticación JWT automática y manejo de errores.
 */

import axiosInstance from '@/lib/axios';

// ===== TIPOS =====

export interface WorkFormData {
  title: string;
  description?: string;
  category?: string;
  is_featured?: boolean;
  thumbnail_url?: string;
  images: string[];
}

export interface Work extends WorkFormData {
  id: number;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  total_images: number;
  artist: {
    id: number;
    slug: string;
    display_name: string;
    avatar?: string;
  };
}

// Respuesta paginada del backend
interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// ===== API FUNCTIONS =====

/**
 * Obtener todas las obras del artista autenticado
 */
export async function getMyWorks(): Promise<Work[]> {
  const response = await axiosInstance.get<PaginatedResponse<Work>>('/api/v1/works/');
  return response.data.results; // Extraer array de obras del objeto paginado
}

/**
 * Obtener una obra específica por ID
 */
export async function getWork(id: number): Promise<Work> {
  const response = await axiosInstance.get<Work>(`/api/v1/works/${id}/`);
  return response.data;
}

/**
 * Crear nueva obra
 */
export async function createWork(data: WorkFormData): Promise<Work> {
  const response = await axiosInstance.post<Work>('/api/v1/works/', data);
  return response.data;
}

/**
 * Actualizar obra existente
 */
export async function updateWork(
  id: number,
  data: Partial<WorkFormData>
): Promise<Work> {
  const response = await axiosInstance.put<Work>(`/api/v1/works/${id}/`, data);
  return response.data;
}

/**
 * Eliminar obra
 */
export async function deleteWork(id: number): Promise<void> {
  await axiosInstance.delete(`/api/v1/works/${id}/`);
}

/**
 * Reordenar obras
 * 
 * @param orderIds - Array de IDs en el nuevo orden
 */
export async function reorderWorks(orderIds: number[]): Promise<void> {
  await axiosInstance.put('/api/v1/works/reorder/', { order: orderIds });
}

