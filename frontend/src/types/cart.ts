// Tipos para el carrito de compras multi-vendor

import type { CartItem } from './product';

/**
 * Item del carrito agrupado por artesano
 * Representa todos los productos de un mismo artesano en el carrito
 */
export type CartItemsByArtisan = {
  artisan: {
    id: number;
    slug: string;
    display_name: string;
    avatar: string | null;
    shipping_cost: string; // Decimal como string (EUR)
  };
  items: CartItem[];
  subtotal: number; // Total de productos sin envío
  shipping: number; // Coste de envío del artesano
  total: number; // Subtotal + shipping
};

/**
 * Opciones de envío/recogida disponibles
 */
export type ShippingOption = 'shipping' | 'pickup';

/**
 * Selección de método de envío por artesano
 * Key: ID del artesano
 * Value: Opción seleccionada y coste asociado
 */
export type ShippingSelection = {
  [artisanId: number]: {
    option: ShippingOption;
    cost: number; // 0 si es pickup, shipping_cost si es shipping
  };
};

/**
 * Resumen completo del carrito multi-vendor
 */
export type MultiVendorCartSummary = {
  itemsByArtisan: CartItemsByArtisan[];
  totalItems: number;
  totalProducts: number; // Suma de todos los subtotales
  totalShipping: number; // Suma de todos los envíos
  grandTotal: number; // Total final a pagar
};
