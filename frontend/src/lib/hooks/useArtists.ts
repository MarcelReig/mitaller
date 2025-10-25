/**
 * Custom Hooks para Artists
 * 
 * Hooks de React Query para gestionar estado de artistas.
 * - Cache automático
 * - Loading y error states
 * - Revalidación inteligente
 * - Mutations para updates
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/authStore';
import {
  getArtists,
  getArtist,
  getArtistWorks,
  getMyArtistProfile,
  updateMyArtistProfile,
  uploadArtistAvatar,
  uploadArtistCoverImage,
} from '@/lib/api/artists';
import type { ArtistFilters, ArtistUpdateData } from '@/types/artist';

// ===== QUERY KEYS =====
// Centralizamos las keys para fácil invalidación

export const artistKeys = {
  all: ['artists'] as const,
  lists: () => [...artistKeys.all, 'list'] as const,
  list: (filters?: ArtistFilters) => [...artistKeys.lists(), filters] as const,
  details: () => [...artistKeys.all, 'detail'] as const,
  detail: (slug: string) => [...artistKeys.details(), slug] as const,
  works: (slug: string) => [...artistKeys.detail(slug), 'works'] as const,
  myProfile: () => [...artistKeys.all, 'me'] as const,
};

// ===== QUERIES (GET) =====

/**
 * Hook para obtener lista de artistas
 * 
 * @param filters - Filtros opcionales (search, craft_type, location, etc.)
 * @returns Query con lista de artistas
 * 
 * @example
 * const { data: artists, isLoading, error } = useArtists({ craft_type: 'ceramics' });
 */
export function useArtists(filters?: ArtistFilters) {
  return useQuery({
    queryKey: artistKeys.list(filters),
    queryFn: () => getArtists(filters),
    staleTime: 5 * 60 * 1000, // Cache 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos en cache
  });
}

/**
 * Hook para obtener detalle de un artista
 * 
 * @param slug - Slug único del artista
 * @returns Query con perfil completo del artista
 * 
 * @example
 * const { data: artist, isLoading, error } = useArtist('juan-ceramista');
 */
export function useArtist(slug: string) {
  return useQuery({
    queryKey: artistKeys.detail(slug),
    queryFn: () => getArtist(slug),
    staleTime: 10 * 60 * 1000, // Cache 10 minutos (perfil cambia poco)
    gcTime: 15 * 60 * 1000, // 15 minutos en cache
    enabled: !!slug, // Solo ejecutar si hay slug
  });
}

/**
 * Hook para obtener obras de un artista
 * 
 * @param slug - Slug del artista
 * @returns Query con array de obras del artista
 * 
 * @example
 * const { data: works, isLoading } = useArtistWorks('juan-ceramista');
 */
export function useArtistWorks(slug: string) {
  return useQuery({
    queryKey: artistKeys.works(slug),
    queryFn: () => getArtistWorks(slug),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: !!slug,
  });
}

/**
 * Hook para obtener mi perfil de artista (requiere auth)
 * 
 * @returns Query con mi perfil de artista
 * 
 * @example
 * const { data: myProfile, isLoading } = useMyArtistProfile();
 */
export function useMyArtistProfile() {
  return useQuery({
    queryKey: artistKeys.myProfile(),
    queryFn: getMyArtistProfile,
    staleTime: 2 * 60 * 1000, // Cache 2 minutos (perfil propio cambia más)
    gcTime: 5 * 60 * 1000,
  });
}

// ===== MUTATIONS (POST/PATCH/DELETE) =====

/**
 * Hook para actualizar mi perfil de artista
 * 
 * @returns Mutation con función mutate y estados
 * 
 * @example
 * const updateProfile = useUpdateMyArtistProfile();
 * 
 * const handleSubmit = async (data) => {
 *   await updateProfile.mutateAsync(data);
 * };
 */
export function useUpdateMyArtistProfile() {
  const queryClient = useQueryClient();
  const refreshUser = useAuthStore((state) => state.refreshUser);

  return useMutation({
    mutationFn: (data: ArtistUpdateData) => updateMyArtistProfile(data),
    onSuccess: async (updatedArtist) => {
      // Invalidar cache de mi perfil
      queryClient.invalidateQueries({ queryKey: artistKeys.myProfile() });
      
      // Invalidar cache del perfil público (por si está abierto)
      queryClient.invalidateQueries({
        queryKey: artistKeys.detail(updatedArtist.slug),
      });
      
      // Invalidar lista de artistas (por si cambió is_featured)
      queryClient.invalidateQueries({ queryKey: artistKeys.lists() });

      // Refrescar usuario en authStore para actualizar avatar en dropdown
      await refreshUser();

      toast.success('Perfil actualizado correctamente', {
        description: 'Los cambios se han guardado exitosamente',
      });
    },
    onError: (error: any) => {
      console.error('Error updating artist profile:', error);
      toast.error('Error al actualizar perfil', {
        description: error.response?.data?.message || 'Por favor, intenta de nuevo',
      });
    },
  });
}

/**
 * Hook para subir avatar
 * 
 * @returns Mutation con función mutate para subir archivo
 * 
 * @example
 * const uploadAvatar = useUploadArtistAvatar();
 * 
 * const handleFileChange = (file: File) => {
 *   uploadAvatar.mutate(file);
 * };
 */
export function useUploadArtistAvatar() {
  const queryClient = useQueryClient();
  const refreshUser = useAuthStore((state) => state.refreshUser);

  return useMutation({
    mutationFn: (file: File) => uploadArtistAvatar(file),
    onSuccess: async (updatedArtist) => {
      queryClient.invalidateQueries({ queryKey: artistKeys.myProfile() });
      queryClient.invalidateQueries({
        queryKey: artistKeys.detail(updatedArtist.slug),
      });
      
      // Refrescar usuario en authStore para actualizar avatar en dropdown
      await refreshUser();
      
      toast.success('Avatar actualizado correctamente', {
        description: 'Tu foto de perfil ha sido actualizada',
      });
    },
    onError: (error: any) => {
      console.error('Error uploading avatar:', error);
      toast.error('Error al subir avatar', {
        description: error.response?.data?.message || 'Por favor, intenta de nuevo',
      });
    },
  });
}

/**
 * Hook para subir cover image
 * 
 * @returns Mutation con función mutate para subir archivo
 * 
 * @example
 * const uploadCover = useUploadArtistCoverImage();
 * 
 * const handleFileChange = (file: File) => {
 *   uploadCover.mutate(file);
 * };
 */
export function useUploadArtistCoverImage() {
  const queryClient = useQueryClient();
  const refreshUser = useAuthStore((state) => state.refreshUser);

  return useMutation({
    mutationFn: (file: File) => uploadArtistCoverImage(file),
    onSuccess: async (updatedArtist) => {
      queryClient.invalidateQueries({ queryKey: artistKeys.myProfile() });
      queryClient.invalidateQueries({
        queryKey: artistKeys.detail(updatedArtist.slug),
      });
      
      // Refrescar usuario en authStore para actualizar en dropdown
      await refreshUser();
      
      toast.success('Imagen de portada actualizada', {
        description: 'Tu foto de portada ha sido actualizada',
      });
    },
    onError: (error: any) => {
      console.error('Error uploading cover image:', error);
      toast.error('Error al subir imagen de portada', {
        description: error.response?.data?.message || 'Por favor, intenta de nuevo',
      });
    },
  });
}

