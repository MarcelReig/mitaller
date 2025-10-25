import axiosInstance from '../axios';

export type Artist = {
  id: string;
  username: string;
  email: string;
  role: string;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
  slug: string;
  bio: string;
  avatar: string;
  cover_image: string;
  works_count: number;
  products_count: number;
  completed_orders_count: number;
  can_be_deleted: boolean;
};

export type AdminStats = {
  total_artists: number;
  pending_artists: number;
  approved_artists: number;
  total_works: number;
  total_products: number;
  total_orders: number;
};

export const adminApi = {
  // Listar artistas con filtros
  getArtists: (params?: { 
    status?: 'pending' | 'approved'; 
    search?: string; 
    ordering?: string;
  }) => axiosInstance.get<Artist[]>('/api/v1/admin/artists/', { params }),
  
  // Ver artista específico
  getArtist: (id: string) => 
    axiosInstance.get<Artist>(`/api/v1/admin/artists/${id}/`),
  
  // Aprobar artista
  approveArtist: (id: string) => 
    axiosInstance.patch(`/api/v1/admin/artists/${id}/approve/`),
  
  // Eliminar artista
  deleteArtist: (id: string) => 
    axiosInstance.delete(`/api/v1/admin/artists/${id}/`),
  
  // Estadísticas
  getStats: () => 
    axiosInstance.get<AdminStats>('/api/v1/admin/artists/stats/'),
};

