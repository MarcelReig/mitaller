import { useQuery, UseQueryResult } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import type { Artisan } from '@/types';

/**
 * Hook para obtener un artesano por slug
 *
 * @param slug - Slug del artesano
 * @returns Query con el artesano
 *
 * @example
 * ```tsx
 * const { data: artisan, isLoading } = useArtisan('juan-ceramista');
 * ```
 */
export function useArtisan(slug: string): UseQueryResult<Artisan, Error> {
  return useQuery({
    queryKey: ['artisan', slug],
    queryFn: async () => {
      const response = await axiosInstance.get<Artisan>(
        `/api/v1/artisans/${slug}/`
      );
      return response.data;
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

/**
 * Hook para obtener lista de artesanos
 *
 * @returns Query con lista de artesanos
 */
export function useArtisans(): UseQueryResult<Artisan[], Error> {
  return useQuery({
    queryKey: ['artisans'],
    queryFn: async () => {
      const response = await axiosInstance.get<{ results: Artisan[] }>(
        '/api/v1/artisans/'
      );
      return response.data.results || response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}
