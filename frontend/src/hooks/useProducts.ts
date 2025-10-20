import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryResult,
  UseMutationResult,
} from '@tanstack/react-query';
import { toast } from 'sonner';
import axiosInstance from '@/lib/axios';
import type {
  Product,
  ProductFormData,
  ProductFilters,
  ProductListResponse,
} from '@/types';
import type { AxiosError } from 'axios';

// Helper para obtener mensaje de error de respuesta de Axios
function getErrorMessage(error: Error): string {
  if ('response' in error) {
    const axiosError = error as AxiosError<{ detail?: string }>;
    return axiosError.response?.data?.detail || error.message;
  }
  return error.message;
}

// Query keys para cache de React Query
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (filters?: ProductFilters) =>
    [...productKeys.lists(), { filters }] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: number) => [...productKeys.details(), id] as const,
};

/**
 * Hook para obtener lista de productos
 * 
 * @param artistId - Slug del artista (opcional). Si se proporciona, filtra por artista
 * @param filters - Filtros adicionales (categoría, precio, disponibilidad, búsqueda)
 * @returns Query con lista de productos
 * 
 * @example
 * ```tsx
 * function ProductsGrid({ artistSlug }) {
 *   const { data: products, isLoading } = useProducts(artistSlug, {
 *     category: 'ceramics',
 *     is_available: true
 *   });
 *   
 *   if (isLoading) return <Spinner />;
 *   
 *   return <Grid products={products} />;
 * }
 * ```
 */
export function useProducts(
  artistId?: string,
  filters?: ProductFilters
): UseQueryResult<Product[], Error> {
  return useQuery({
    queryKey: productKeys.list({ artist: artistId, ...filters }),
    queryFn: async () => {
      const params = {
        ...(artistId && { artist: artistId }),
        ...filters,
      };

      const response = await axiosInstance.get<ProductListResponse>(
        '/api/v1/shop/products/',
        { params }
      );

      // Devolver results si es paginado, o el array directamente
      return response.data.results || response.data;
    },
    staleTime: 3 * 60 * 1000, // 3 minutos (productos cambian más frecuentemente)
  });
}

/**
 * Hook para obtener un producto específico
 * 
 * @param id - ID del producto
 * @returns Query con el producto
 * 
 * @example
 * ```tsx
 * function ProductDetail({ productId }) {
 *   const { data: product, isLoading, error } = useProduct(productId);
 *   
 *   if (isLoading) return <Spinner />;
 *   if (error) return <Error />;
 *   
 *   return <ProductCard product={product} />;
 * }
 * ```
 */
export function useProduct(id: number): UseQueryResult<Product, Error> {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: async () => {
      const response = await axiosInstance.get<Product>(
        `/api/v1/shop/products/${id}/`
      );
      return response.data;
    },
    enabled: !!id, // Solo ejecutar si hay ID
  });
}

/**
 * Hook para crear un nuevo producto
 * 
 * @returns Mutation para crear producto
 * 
 * @example
 * ```tsx
 * function CreateProductForm() {
 *   const createProduct = useCreateProduct();
 *   
 *   const handleSubmit = async (data) => {
 *     await createProduct.mutateAsync(data);
 *   };
 *   
 *   return <form onSubmit={handleSubmit}>...</form>;
 * }
 * ```
 */
export function useCreateProduct(): UseMutationResult<
  Product,
  Error,
  ProductFormData
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ProductFormData) => {
      // Usar FormData para manejar imágenes
      const formData = new FormData();
      formData.append('name', data.name);
      if (data.description) formData.append('description', data.description);
      formData.append('category', data.category);
      formData.append('price', data.price.toString());
      formData.append('stock', data.stock.toString());
      if (data.is_active !== undefined) {
        formData.append('is_active', data.is_active.toString());
      }

      // Imagen principal (thumbnail)
      if (data.thumbnail) {
        formData.append('thumbnail', data.thumbnail);
      }

      // Galería de imágenes
      if (data.images && data.images.length > 0) {
        data.images.forEach((image, index) => {
          formData.append(`image_${index}`, image);
        });
      }

      const response = await axiosInstance.post<Product>(
        '/api/v1/shop/products/',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      // Invalidar queries para refetch
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });

      toast.success('Producto creado exitosamente');
    },
    onError: (error: Error) => {
      const message = getErrorMessage(error) || 'Error al crear el producto. Inténtalo de nuevo.';
      toast.error(message);
    },
  });
}

/**
 * Hook para actualizar un producto existente
 * 
 * @returns Mutation para actualizar producto
 * 
 * @example
 * ```tsx
 * function EditProductForm({ productId }) {
 *   const updateProduct = useUpdateProduct();
 *   
 *   const handleSubmit = async (data) => {
 *     await updateProduct.mutateAsync({ id: productId, data });
 *   };
 *   
 *   return <form onSubmit={handleSubmit}>...</form>;
 * }
 * ```
 */
export function useUpdateProduct(): UseMutationResult<
  Product,
  Error,
  { id: number; data: Partial<ProductFormData> }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }) => {
      // Si hay archivos nuevos, usar FormData
      const hasFiles =
        (data.thumbnail && data.thumbnail instanceof File) ||
        (data.images && data.images.length > 0);

      let payload: FormData | Partial<ProductFormData>;
      const headers: Record<string, string> = {};

      if (hasFiles) {
        const formData = new FormData();
        if (data.name) formData.append('name', data.name);
        if (data.description) formData.append('description', data.description);
        if (data.category) formData.append('category', data.category);
        if (data.price !== undefined) {
          formData.append('price', data.price.toString());
        }
        if (data.stock !== undefined) {
          formData.append('stock', data.stock.toString());
        }
        if (data.is_active !== undefined) {
          formData.append('is_active', data.is_active.toString());
        }

        if (data.thumbnail && data.thumbnail instanceof File) {
          formData.append('thumbnail', data.thumbnail);
        }

        if (data.images && data.images.length > 0) {
          data.images.forEach((image, index) => {
            if (image instanceof File) {
              formData.append(`image_${index}`, image);
            }
          });
        }

        payload = formData;
        headers['Content-Type'] = 'multipart/form-data';
      } else {
        payload = data;
      }

      const response = await axiosInstance.patch<Product>(
        `/api/v1/shop/products/${id}/`,
        payload,
        { headers }
      );
      return response.data;
    },
    onMutate: async ({ id, data }) => {
      // Cancelar queries en curso
      await queryClient.cancelQueries({ queryKey: productKeys.detail(id) });

      // Snapshot del valor anterior
      const previousProduct = queryClient.getQueryData<Product>(
        productKeys.detail(id)
      );

      // Optimistic update (solo para campos no-file)
      if (previousProduct && !data.thumbnail && !data.images) {
        queryClient.setQueryData<Product>(productKeys.detail(id), {
          ...previousProduct,
          ...data,
        } as Product);
      }

      return { previousProduct };
    },
    onError: (error: Error, { id }, context) => {
      // Rollback en caso de error
      if (context?.previousProduct) {
        queryClient.setQueryData(productKeys.detail(id), context.previousProduct);
      }

      const message = getErrorMessage(error) || 'Error al actualizar el producto. Inténtalo de nuevo.';
      toast.error(message);
    },
    onSuccess: (updatedProduct) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: productKeys.detail(updatedProduct.id),
      });

      toast.success('Producto actualizado exitosamente');
    },
  });
}

/**
 * Hook para eliminar un producto
 * 
 * @returns Mutation para eliminar producto
 * 
 * @example
 * ```tsx
 * function ProductCard({ product }) {
 *   const deleteProduct = useDeleteProduct();
 *   
 *   const handleDelete = async () => {
 *     if (confirm('¿Eliminar este producto?')) {
 *       await deleteProduct.mutateAsync(product.id);
 *     }
 *   };
 *   
 *   return <button onClick={handleDelete}>Eliminar</button>;
 * }
 * ```
 */
export function useDeleteProduct(): UseMutationResult<void, Error, number> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await axiosInstance.delete(`/api/v1/shop/products/${id}/`);
    },
    onMutate: async (id) => {
      // Cancelar queries relacionadas
      await queryClient.cancelQueries({ queryKey: productKeys.detail(id) });
      await queryClient.cancelQueries({ queryKey: productKeys.lists() });

      // Snapshot
      const previousProducts = queryClient.getQueriesData({
        queryKey: productKeys.lists(),
      });

      // Optimistic update: remover de todas las listas
      queryClient.setQueriesData<Product[]>(
        { queryKey: productKeys.lists() },
        (old) => (old ? old.filter((product) => product.id !== id) : [])
      );

      return { previousProducts };
    },
    onError: (error: Error, id, context) => {
      // Rollback
      if (context?.previousProducts) {
        context.previousProducts.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }

      const message = getErrorMessage(error) || 'Error al eliminar el producto. Inténtalo de nuevo.';
      toast.error(message);
    },
    onSuccess: () => {
      // Invalidar todas las queries de products
      queryClient.invalidateQueries({ queryKey: productKeys.all });

      toast.success('Producto eliminado exitosamente');
    },
  });
}

