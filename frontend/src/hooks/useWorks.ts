import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryResult,
  UseMutationResult,
} from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import axiosInstance from '@/lib/axios';
import type { Work, WorkFormData, WorkListResponse } from '@/types';

// Query keys para cache de React Query
export const workKeys = {
  all: ['works'] as const,
  lists: () => [...workKeys.all, 'list'] as const,
  list: (artistId?: string) => [...workKeys.lists(), { artistId }] as const,
  details: () => [...workKeys.all, 'detail'] as const,
  detail: (id: number) => [...workKeys.details(), id] as const,
};

/**
 * Hook para obtener lista de obras (portfolio)
 * 
 * @param artistId - Slug del artista (opcional). Si se proporciona, filtra por artista
 * @returns Query con lista de obras
 * 
 * @example
 * ```tsx
 * function WorksGallery({ artistSlug }) {
 *   const { data: works, isLoading, error } = useWorks(artistSlug);
 *   
 *   if (isLoading) return <Spinner />;
 *   if (error) return <Error />;
 *   
 *   return <Gallery works={works} />;
 * }
 * ```
 */
export function useWorks(artistId?: string): UseQueryResult<Work[], Error> {
  return useQuery({
    queryKey: workKeys.list(artistId),
    queryFn: async () => {
      const params = artistId ? { artist: artistId } : {};
      const response = await axiosInstance.get<WorkListResponse>(
        '/api/v1/works/',
        { params }
      );
      
      // Devolver results si es paginado, o el array directamente
      return response.data.results || response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

/**
 * Hook para obtener una obra específica
 * 
 * @param id - ID de la obra
 * @returns Query con la obra
 * 
 * @example
 * ```tsx
 * function WorkDetail({ workId }) {
 *   const { data: work, isLoading } = useWork(workId);
 *   
 *   if (isLoading) return <Spinner />;
 *   
 *   return <WorkCard work={work} />;
 * }
 * ```
 */
export function useWork(id: number): UseQueryResult<Work, Error> {
  return useQuery({
    queryKey: workKeys.detail(id),
    queryFn: async () => {
      const response = await axiosInstance.get<Work>(`/api/v1/works/${id}/`);
      return response.data;
    },
    enabled: !!id, // Solo ejecutar si hay ID
  });
}

/**
 * Hook para crear una nueva obra
 * 
 * @returns Mutation para crear obra
 * 
 * @example
 * ```tsx
 * function CreateWorkForm() {
 *   const createWork = useCreateWork();
 *   
 *   const handleSubmit = async (data) => {
 *     await createWork.mutateAsync(data);
 *   };
 *   
 *   return <form onSubmit={handleSubmit}>...</form>;
 * }
 * ```
 */
export function useCreateWork(): UseMutationResult<Work, Error, WorkFormData> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: WorkFormData) => {
      // Si hay imagen, usar FormData para multipart
      const formData = new FormData();
      formData.append('title', data.title);
      if (data.description) formData.append('description', data.description);
      if (data.year) formData.append('year', data.year.toString());
      if (data.is_featured !== undefined) {
        formData.append('is_featured', data.is_featured.toString());
      }
      if (data.display_order !== undefined) {
        formData.append('display_order', data.display_order.toString());
      }
      if (data.image) formData.append('image', data.image);

      const response = await axiosInstance.post<Work>(
        '/api/v1/works/',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );
      return response.data;
    },
    onSuccess: (newWork) => {
      // Invalidar queries para refetch
      queryClient.invalidateQueries({ queryKey: workKeys.lists() });

      toast.success('Obra creada exitosamente');
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.detail ||
        'Error al crear la obra. Inténtalo de nuevo.';
      toast.error(message);
    },
  });
}

/**
 * Hook para actualizar una obra existente
 * 
 * @returns Mutation para actualizar obra
 * 
 * @example
 * ```tsx
 * function EditWorkForm({ workId }) {
 *   const updateWork = useUpdateWork();
 *   
 *   const handleSubmit = async (data) => {
 *     await updateWork.mutateAsync({ id: workId, data });
 *   };
 *   
 *   return <form onSubmit={handleSubmit}>...</form>;
 * }
 * ```
 */
export function useUpdateWork(): UseMutationResult<
  Work,
  Error,
  { id: number; data: Partial<WorkFormData> }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }) => {
      // Si hay imagen nueva, usar FormData
      const hasFile = data.image instanceof File;

      let payload: FormData | Partial<WorkFormData>;
      let headers: Record<string, string> = {};

      if (hasFile) {
        const formData = new FormData();
        if (data.title) formData.append('title', data.title);
        if (data.description) formData.append('description', data.description);
        if (data.year) formData.append('year', data.year.toString());
        if (data.is_featured !== undefined) {
          formData.append('is_featured', data.is_featured.toString());
        }
        if (data.display_order !== undefined) {
          formData.append('display_order', data.display_order.toString());
        }
        if (data.image) formData.append('image', data.image);

        payload = formData;
        headers['Content-Type'] = 'multipart/form-data';
      } else {
        payload = data;
      }

      const response = await axiosInstance.patch<Work>(
        `/api/v1/works/${id}/`,
        payload,
        { headers }
      );
      return response.data;
    },
    onMutate: async ({ id, data }) => {
      // Cancelar queries en curso
      await queryClient.cancelQueries({ queryKey: workKeys.detail(id) });

      // Snapshot del valor anterior
      const previousWork = queryClient.getQueryData<Work>(workKeys.detail(id));

      // Optimistic update
      if (previousWork) {
        queryClient.setQueryData<Work>(workKeys.detail(id), {
          ...previousWork,
          ...data,
        });
      }

      return { previousWork };
    },
    onError: (error: any, { id }, context) => {
      // Rollback en caso de error
      if (context?.previousWork) {
        queryClient.setQueryData(workKeys.detail(id), context.previousWork);
      }

      const message =
        error.response?.data?.detail ||
        'Error al actualizar la obra. Inténtalo de nuevo.';
      toast.error(message);
    },
    onSuccess: (updatedWork) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: workKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: workKeys.detail(updatedWork.id),
      });

      toast.success('Obra actualizada exitosamente');
    },
  });
}

/**
 * Hook para eliminar una obra
 * 
 * @returns Mutation para eliminar obra
 * 
 * @example
 * ```tsx
 * function WorkCard({ work }) {
 *   const deleteWork = useDeleteWork();
 *   
 *   const handleDelete = async () => {
 *     if (confirm('¿Eliminar esta obra?')) {
 *       await deleteWork.mutateAsync(work.id);
 *     }
 *   };
 *   
 *   return <button onClick={handleDelete}>Eliminar</button>;
 * }
 * ```
 */
export function useDeleteWork(): UseMutationResult<void, Error, number> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await axiosInstance.delete(`/api/v1/works/${id}/`);
    },
    onMutate: async (id) => {
      // Cancelar queries relacionadas
      await queryClient.cancelQueries({ queryKey: workKeys.detail(id) });
      await queryClient.cancelQueries({ queryKey: workKeys.lists() });

      // Snapshot
      const previousWorks = queryClient.getQueriesData({
        queryKey: workKeys.lists(),
      });

      // Optimistic update: remover de todas las listas
      queryClient.setQueriesData<Work[]>({ queryKey: workKeys.lists() }, (old) =>
        old ? old.filter((work) => work.id !== id) : []
      );

      return { previousWorks };
    },
    onError: (error: any, id, context) => {
      // Rollback
      if (context?.previousWorks) {
        context.previousWorks.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }

      const message =
        error.response?.data?.detail ||
        'Error al eliminar la obra. Inténtalo de nuevo.';
      toast.error(message);
    },
    onSuccess: () => {
      // Invalidar todas las queries de works
      queryClient.invalidateQueries({ queryKey: workKeys.all });

      toast.success('Obra eliminada exitosamente');
    },
  });
}

/**
 * Hook para reordenar obras (actualizar display_order)
 * 
 * @returns Mutation para reordenar obras
 * 
 * @example
 * ```tsx
 * function WorksList({ works }) {
 *   const reorderWorks = useReorderWorks();
 *   
 *   const handleDragEnd = async (result) => {
 *     const newOrder = reorderArray(works, result);
 *     await reorderWorks.mutateAsync(newOrder);
 *   };
 *   
 *   return <DragDropList onDragEnd={handleDragEnd}>...</DragDropList>;
 * }
 * ```
 */
export function useReorderWorks(): UseMutationResult<
  void,
  Error,
  Array<{ id: number; display_order: number }>
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reorderedWorks) => {
      // Enviar batch update al backend
      await axiosInstance.post('/api/v1/works/reorder/', {
        works: reorderedWorks,
      });
    },
    onMutate: async (reorderedWorks) => {
      // Cancelar queries en curso
      await queryClient.cancelQueries({ queryKey: workKeys.lists() });

      // Snapshot
      const previousWorks = queryClient.getQueriesData({
        queryKey: workKeys.lists(),
      });

      // Optimistic update
      queryClient.setQueriesData<Work[]>({ queryKey: workKeys.lists() }, (old) => {
        if (!old) return [];

        return old
          .map((work) => {
            const updated = reorderedWorks.find((w) => w.id === work.id);
            return updated ? { ...work, display_order: updated.display_order } : work;
          })
          .sort((a, b) => a.display_order - b.display_order);
      });

      return { previousWorks };
    },
    onError: (error: any, _, context) => {
      // Rollback
      if (context?.previousWorks) {
        context.previousWorks.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }

      const message =
        error.response?.data?.detail ||
        'Error al reordenar las obras. Inténtalo de nuevo.';
      toast.error(message);
    },
    onSuccess: () => {
      toast.success('Obras reordenadas exitosamente');
    },
  });
}

