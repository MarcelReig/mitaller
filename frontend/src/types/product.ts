// Tipos para productos de la tienda

import type { CraftType } from './artisan';

/**
 * Referencia simplificada al artesano en un producto
 */
export type ProductArtisan = {
  id: number;
  slug: string;
  display_name: string;
  avatar: string | null;
  shipping_cost: string; // Decimal como string (EUR)
};

/**
 * Producto a la venta en la tienda
 */
export type Product = {
  id: number;
  artisan: ProductArtisan;
  name: string;
  description: string;
  category: CraftType;
  price: string; // Decimal como string desde Django
  stock: number;
  thumbnail_url: string;
  images: string[];
  is_active: boolean;
  is_featured: boolean; // Producto destacado por el artesano
  pickup_available: boolean; // Permite recogida en taller
  is_available: boolean;
  formatted_price: string; // Ej: "45.00 €"
  created_at: string;
  updated_at: string;
};

/**
 * Datos para crear/actualizar un producto
 */
export type ProductFormData = {
  name: string;
  description?: string;
  category: CraftType;
  price: number | string;
  stock: number;
  is_active?: boolean;
  thumbnail?: File | null;
  images?: File[];
};

/**
 * Filtros para búsqueda de productos
 */
export type ProductFilters = {
  artisan?: string; // Slug del artesano
  category?: CraftType;
  min_price?: number;
  max_price?: number;
  is_available?: boolean;
  search?: string;
};

/**
 * Respuesta paginada de productos
 */
export type ProductListResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: Product[];
};

/**
 * Item del carrito (antes de crear la orden)
 */
export type CartItem = {
  product: Product;
  quantity: number;
};

/**
 * Resumen del carrito
 */
export type CartSummary = {
  items: CartItem[];
  total_items: number;
  subtotal: number;
  formatted_subtotal: string;
};
