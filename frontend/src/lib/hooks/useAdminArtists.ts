import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi, type Artist } from '@/lib/api/admin';
import { toast } from 'sonner';

export const useAdminArtists = (filters?: { 
  status?: 'pending' | 'approved'; 
  search?: string;
}) => {
  return useQuery({
    queryKey: ['admin', 'artists', filters],
    queryFn: async () => {
      const response = await adminApi.getArtists(filters);
      return response.data;
    },
  });
};

export const useApproveArtist = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => adminApi.approveArtist(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'artists'] });
      toast.success('Artista aprobado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al aprobar');
    },
  });
};

export const useDeleteArtist = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => adminApi.deleteArtist(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'artists'] });
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

