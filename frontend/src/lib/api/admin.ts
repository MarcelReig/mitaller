import axiosInstance from '../axios';

export type Artisan = {
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
  total_artisans: number; // Actualizado de total_artists
  pending_artisans: number; // Actualizado de pending_artists
  approved_artisans: number; // Actualizado de approved_artists
  total_works: number;
  total_products: number;
  total_orders: number;
};

export const adminApi = {
  // Listar artesanos con filtros
  getArtisans: (params?: { 
    status?: 'pending' | 'approved'; 
    search?: string; 
    ordering?: string;
  }) => axiosInstance.get<Artisan[]>('/api/v1/admin/artisans/', { params }),
  
  // Ver artesano específico
  getArtisan: (id: string) => 
    axiosInstance.get<Artisan>(`/api/v1/admin/artisans/${id}/`),
  
  // Aprobar artesano
  approveArtisan: (id: string) => 
    axiosInstance.patch(`/api/v1/admin/artisans/${id}/approve/`),
  
  // Eliminar artesano
  deleteArtisan: (id: string) => 
    axiosInstance.delete(`/api/v1/admin/artisans/${id}/`),
  
  // Estadísticas
  getStats: () => 
    axiosInstance.get<AdminStats>('/api/v1/admin/artisans/stats/'),
};
