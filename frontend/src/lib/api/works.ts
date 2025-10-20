/**
 * API Client para Works
 * 
 * Funciones para interactuar con el backend de obras.
 * Maneja autenticación JWT y errores.
 */

import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Helper para obtener token JWT
 * 
 * El sistema de auth guarda el token en cookies con nombre 'token'
 */
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  
  // El sistema de auth guarda el token en cookies con nombre 'token'
  const token = Cookies.get('token');
  return token || null;
}

/**
 * Helper para crear headers con autenticación
 */
function getAuthHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
}

/**
 * Helper para manejar errores de API
 */
async function handleApiError(response: Response): Promise<never> {
  let errorMessage = `Error ${response.status}`;
  
  try {
    const errorData = await response.json();
    errorMessage = errorData.detail || errorData.error || errorMessage;
  } catch {
    // Si no se puede parsear el error, usar mensaje por defecto
  }
  
  throw new Error(errorMessage);
}

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
  const response = await fetch(`${API_URL}/api/v1/works/`, {
    headers: getAuthHeaders(),
    cache: 'no-store', // No cache en dashboard
  });
  
  if (!response.ok) {
    await handleApiError(response);
  }
  
  const data: PaginatedResponse<Work> = await response.json();
  return data.results; // Extraer array de obras del objeto paginado
}

/**
 * Obtener una obra específica por ID
 */
export async function getWork(id: number): Promise<Work> {
  const response = await fetch(`${API_URL}/api/v1/works/${id}/`, {
    headers: getAuthHeaders(),
    cache: 'no-store',
  });
  
  if (!response.ok) {
    await handleApiError(response);
  }
  
  return response.json();
}

/**
 * Crear nueva obra
 */
export async function createWork(data: WorkFormData): Promise<Work> {
  const response = await fetch(`${API_URL}/api/v1/works/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    await handleApiError(response);
  }
  
  return response.json();
}

/**
 * Actualizar obra existente
 */
export async function updateWork(
  id: number,
  data: Partial<WorkFormData>
): Promise<Work> {
  const response = await fetch(`${API_URL}/api/v1/works/${id}/`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    await handleApiError(response);
  }
  
  return response.json();
}

/**
 * Eliminar obra
 */
export async function deleteWork(id: number): Promise<void> {
  const response = await fetch(`${API_URL}/api/v1/works/${id}/`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) {
    await handleApiError(response);
  }
}

/**
 * Reordenar obras
 * 
 * @param orderIds - Array de IDs en el nuevo orden
 */
export async function reorderWorks(orderIds: number[]): Promise<void> {
  const response = await fetch(`${API_URL}/api/v1/works/reorder/`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ order: orderIds }),
  });
  
  if (!response.ok) {
    await handleApiError(response);
  }
}

