import axiosInstance from '../axios';

export type Artisan = {
  id: string;
  username: string;
  email: string;
  role: string;
  is_approved: boolean;
  is_featured: boolean;
  date_joined: string;
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
  total_artisans: number;
  pending_artisans: number;
  approved_artisans: number;
  total_works: number;
  total_products: number;
  total_orders: number;
};

export interface RecentActivity {
  type: 'artisan' | 'product' | 'order';
  timestamp: string;
  message: string;
  status?: string;
}

export interface SalesChartData {
  date: string;
  sales: number;
}

export interface DashboardStats {
  total_artisans: number;
  pending_artisans: number;
  new_artisans_this_week: number;
  total_products: number;
  products_created_today: number;
  total_sales: number;
  sales_last_month: number;
  total_orders: number;
  recent_orders_count: number;
  products_out_of_stock: number;
  recent_activity: RecentActivity[];
  sales_chart: SalesChartData[];
}

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

  // Toggle destacado
  toggleFeatured: (id: string) =>
    axiosInstance.patch(`/api/v1/admin/artisans/${id}/toggle-featured/`),

  // Eliminar artesano
  deleteArtisan: (id: string) =>
    axiosInstance.delete(`/api/v1/admin/artisans/${id}/`),

  // Aprobar múltiples artesanos
  bulkApproveArtisans: (artisanIds: number[]) =>
    axiosInstance.post('/api/v1/admin/artisans/bulk-approve/', {
      artisan_ids: artisanIds,
    }),

  // Estadísticas básicas
  getStats: () =>
    axiosInstance.get<AdminStats>('/api/v1/admin/artisans/stats/'),

  // Dashboard con KPIs completos
  getDashboardStats: async (): Promise<DashboardStats> => {
    const { data } = await axiosInstance.get('/api/v1/admin/artisans/dashboard-stats/');
    return data;
  },
};
