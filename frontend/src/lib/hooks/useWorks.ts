/**
 * React Query Hooks para Works
 * 
 * Custom hooks para data fetching con cache,
 * optimistic updates y manejo de errores.
 */

'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as worksApi from '@/lib/api/works';
import type { Work, WorkFormData } from '@/lib/api/works';
import { useAuthStore } from '@/stores/authStore';

/**
 * Helper para revalidar páginas públicas en Next.js
 * Llama al API route de revalidation para actualizar el caché de ISR
 */
async function revalidatePublicPages(artisanSlug: string) {
  try {
    await fetch('/api/revalidate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        paths: [`/artesanos/${artisanSlug}`]
      })
    });
  } catch (error) {
    console.error('Error revalidating public pages:', error);
    // No mostrar error al usuario, es solo optimización
  }
}

/**
 * Hook para obtener todas las obras del artista
 * 
 * Features:
 * - Cache automático
 * - Revalidación en focus
 * - Stale time de 1 minuto
 */
export function useWorks() {
  return useQuery({
    queryKey: ['works'],
    queryFn: worksApi.getMyWorks,
    staleTime: 1000 * 60, // 1 minuto
    gcTime: 1000 * 60 * 5, // 5 minutos (antes cacheTime)
  });
}

/**
 * Hook para obtener una obra específica
 */
export function useWork(id: number) {
  return useQuery({
    queryKey: ['works', id],
    queryFn: () => worksApi.getWork(id),
    enabled: !!id, // Solo ejecutar si hay ID
    staleTime: 1000 * 60,
  });
}

/**
 * Hook para crear obra
 * 
 * Features:
 * - Invalida cache de obras después de crear
 * - Revalida páginas públicas (ISR)
 * - Toast de éxito/error con detalles de validación
 */
export function useCreateWork() {
  const queryClient = useQueryClient();
  const user = useAuthStore(state => state.user);
  
  return useMutation({
    mutationFn: (data: WorkFormData) => worksApi.createWork(data),
    onSuccess: () => {
      // Invalidar cache de obras para refetch (dashboard)
      queryClient.invalidateQueries({ queryKey: ['works'] });
      
      // Revalidar página pública del artesano (ISR)
      if (user?.artisan_profile?.slug) {
        revalidatePublicPages(user.artisan_profile.slug);
      }
      
      // Toast manejado por el componente WorkForm
    },
    onError: (error: unknown) => {
      // Log completo del error para debugging
      console.error('Error completo al crear obra:', error);
      
      // Type guard para axios error
      const axiosError = error as { response?: { data?: unknown; status?: number }; message?: string };
      
      console.error('Response data:', axiosError.response?.data);
      console.error('Status:', axiosError.response?.status);
      
      // Extraer mensajes de error de validación del backend
      const errorData = axiosError.response?.data;
      let errorMessage = 'Error desconocido';
      
      if (errorData) {
        // Si hay errores de validación de campos
        if (typeof errorData === 'object') {
          const fieldErrors = Object.entries(errorData)
            .map(([field, messages]) => {
              const msg = Array.isArray(messages) ? messages[0] : messages;
              return `${field}: ${msg}`;
            })
            .join('\n');
          errorMessage = fieldErrors || axiosError.message || 'Error desconocido';
        } else {
          errorMessage = errorData.toString();
        }
      }
      
      toast.error('Error al crear obra', {
        description: errorMessage,
      });
    },
  });
}

/**
 * Hook para actualizar obra
 * 
 * Features:
 * - Optimistic update (UI se actualiza antes del servidor)
 * - Rollback automático si falla
 * - Revalida páginas públicas (ISR)
 * - Toast de éxito/error
 */
export function useUpdateWork() {
  const queryClient = useQueryClient();
  const user = useAuthStore(state => state.user);
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<WorkFormData> }) =>
      worksApi.updateWork(id, data),
    
    // Optimistic update
    onMutate: async ({ id, data }) => {
      // Cancelar queries en progreso
      await queryClient.cancelQueries({ queryKey: ['works', id] });
      
      // Snapshot del estado previo
      const previousWork = queryClient.getQueryData<Work>(['works', id]);
      
      // Actualizar cache optimistamente
      if (previousWork) {
        queryClient.setQueryData(['works', id], {
          ...previousWork,
          ...data,
        });
      }
      
      return { previousWork };
    },
    
    // Si falla, revertir
    onError: (error: Error, variables, context) => {
      if (context?.previousWork) {
        queryClient.setQueryData(
          ['works', variables.id],
          context.previousWork
        );
      }
      
      toast.error('Error al actualizar obra', {
        description: error.message,
      });
    },
    
    // Si tiene éxito, invalidar cache
    onSuccess: (updatedWork) => {
      queryClient.invalidateQueries({ queryKey: ['works'] });
      queryClient.invalidateQueries({ queryKey: ['works', updatedWork.id] });
      
      // Revalidar página pública del artesano (ISR)
      if (user?.artisan_profile?.slug) {
        revalidatePublicPages(user.artisan_profile.slug);
      }
      
      // Toast manejado por el componente WorkForm
    },
  });
}

/**
 * Hook para eliminar obra
 * 
 * Features:
 * - Invalida cache después de eliminar
 * - Remueve del cache la obra eliminada
 * - Revalida páginas públicas (ISR)
 * - Toast de éxito/error
 */
export function useDeleteWork() {
  const queryClient = useQueryClient();
  const user = useAuthStore(state => state.user);
  
  return useMutation({
    mutationFn: (id: number) => worksApi.deleteWork(id),
    onSuccess: (_, deletedId) => {
      // Invalidar lista de obras
      queryClient.invalidateQueries({ queryKey: ['works'] });
      
      // Remover obra específica del cache
      queryClient.removeQueries({ queryKey: ['works', deletedId] });
      
      // Revalidar página pública del artesano (ISR)
      if (user?.artisan_profile?.slug) {
        revalidatePublicPages(user.artisan_profile.slug);
      }
      
      toast.success('Obra eliminada', {
        description: 'La obra ha sido eliminada de tu portfolio',
      });
    },
    onError: (error: Error) => {
      toast.error('Error al eliminar obra', {
        description: error.message,
      });
    },
  });
}

/**
 * Hook para reordenar obras
 * 
 * Features:
 * - Optimistic update (UI se actualiza instantáneamente)
 * - Rollback automático si falla
 * - Revalida páginas públicas (ISR)
 * - Toast de éxito/error
 */
export function useReorderWorks() {
  const queryClient = useQueryClient();
  const user = useAuthStore(state => state.user);
  
  return useMutation({
    mutationFn: (orderIds: number[]) => worksApi.reorderWorks(orderIds),
    
    // Optimistic update
    onMutate: async (orderIds) => {
      // Cancelar queries en progreso
      await queryClient.cancelQueries({ queryKey: ['works'] });
      
      // Snapshot del estado previo
      const previousWorks = queryClient.getQueryData<Work[]>(['works']);
      
      // Actualizar cache optimistamente
      if (previousWorks) {
        // Reordenar array según los nuevos IDs
        const reordered = orderIds
          .map((id, index) => {
            const work = previousWorks.find(w => w.id === id);
            return work ? { ...work, display_order: index + 1 } : null;
          })
          .filter(Boolean) as Work[];
        
        queryClient.setQueryData(['works'], reordered);
      }
      
      return { previousWorks };
    },
    
    // Si falla, revertir
    onError: (error: Error, variables, context) => {
      if (context?.previousWorks) {
        queryClient.setQueryData(['works'], context.previousWorks);
      }
      
      toast.error('Error al reordenar', {
        description: error.message,
      });
    },
    
    // Si tiene éxito, invalidar cache
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['works'] });
      
      // Revalidar página pública del artesano (ISR)
      if (user?.artisan_profile?.slug) {
        revalidatePublicPages(user.artisan_profile.slug);
      }
      
      toast.success('Orden actualizado');
    },
  });
}

