import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi, type Artisan } from '@/lib/api/admin';
import { toast } from 'sonner';

export const useAdminArtisans = (filters?: {
  status?: 'pending' | 'approved';
  search?: string;
}) => {
  return useQuery({
    queryKey: ['admin', 'artisans', filters],
    queryFn: async () => {
      const response = await adminApi.getArtisans(filters);
      // DRF devuelve objeto paginado: {count, next, previous, results}
      return response.data.results || response.data;
    },
  });
};

export const useApproveArtisan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminApi.approveArtisan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'artisans'] });
      toast.success('Artesano aprobado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al aprobar');
    },
  });
};

export const useToggleFeatured = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminApi.toggleFeatured(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'artisans'] });
      const isFeatured = response.data.is_featured;
      toast.success(
        isFeatured
          ? 'Artesano marcado como destacado'
          : 'Artesano removido de destacados'
      );
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Error al cambiar destacado');
    },
  });
};

export const useDeleteArtisan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminApi.deleteArtisan(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'artisans'] });
      const data = response.data;
      toast.success(
        `Eliminado: ${data.username} (${data.works_deleted} obras, ${data.images_deleted} imágenes)`
      );
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Error al eliminar');
    },
  });
};
