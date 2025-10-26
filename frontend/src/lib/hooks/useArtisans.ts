/**
 * Custom hooks para gestionar datos de artesanos
 * Usa React Query para caché y gestión de estado del servidor
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/authStore';
import { 
  getArtisans, 
  getArtisan, 
  getMyArtisanProfile, 
  updateMyArtisanProfile,
  getArtisanWorks,
} from '@/lib/api/artisans';
import type { ArtisanFilters, ArtisanUpdateData } from '@/types';

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
 * Hook para obtener lista de artesanos
 */
export function useArtisans(filters?: ArtisanFilters) {
  return useQuery({
    queryKey: ['artisans', filters],
    queryFn: () => getArtisans(filters),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

/**
 * Hook para obtener un artesano específico por slug
 */
export function useArtisan(slug: string) {
  return useQuery({
    queryKey: ['artisan', slug],
    queryFn: () => getArtisan(slug),
    enabled: !!slug,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

/**
 * Hook para obtener el perfil del artesano autenticado
 */
export function useMyArtisanProfile() {
  return useQuery({
    queryKey: ['artisan', 'me'],
    queryFn: getMyArtisanProfile,
    retry: false, // No reintentar si falla (probablemente no hay perfil)
  });
}

/**
 * Hook para actualizar el perfil del artesano
 * Incluye revalidación de páginas públicas (ISR)
 */
export function useUpdateArtisanProfile() {
  const queryClient = useQueryClient();
  const refreshUser = useAuthStore((state) => state.refreshUser);
  
  return useMutation({
    mutationFn: (data: ArtisanUpdateData) => updateMyArtisanProfile(data),
    onSuccess: async (updatedArtisan) => {
      // Mostrar toast de éxito
      toast.success('✓ Perfil actualizado correctamente');
      
      // Invalidar caché del perfil de artesano (React Query - dashboard)
      queryClient.invalidateQueries({ queryKey: ['artisan', 'me'] });
      
      // También invalidar por slug si existe
      if (updatedArtisan?.slug) {
        queryClient.invalidateQueries({ queryKey: ['artisan', updatedArtisan.slug] });
        
        // Revalidar página pública del artesano (Next.js ISR)
        revalidatePublicPages(updatedArtisan.slug);
      }
      
      // Actualizar el usuario en authStore (Zustand) para reflejar cambios en navbar
      await refreshUser();
    },
    onError: (error: Error) => {
      // Mostrar toast de error
      console.error('Error updating artisan profile:', error);
      toast.error(error?.message || 'Error al actualizar el perfil');
    },
  });
}

/**
 * Hook para obtener obras de un artesano
 */
export function useArtisanWorks(slug: string) {
  return useQuery({
    queryKey: ['artisan', slug, 'works'],
    queryFn: () => getArtisanWorks(slug),
    enabled: !!slug,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}


