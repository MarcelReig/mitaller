import { useMemo } from 'react';
import { useCartStore } from '@/stores/cartStore';
import type { CartItemsByArtisan } from '@/types/cart';

/**
 * Hook para agrupar items del carrito por artesano
 *
 * Útil para mostrar el carrito multi-vendor donde cada artesano
 * tiene su propia sección con subtotal y coste de envío.
 *
 * @returns Array de items agrupados por artesano con totales calculados
 *
 * @example
 * const itemsByArtisan = useCartByArtisan();
 *
 * itemsByArtisan.forEach(group => {
 *   console.log(`Artesano: ${group.artisan.display_name}`);
 *   console.log(`Subtotal: ${group.subtotal}€`);
 *   console.log(`Envío: ${group.shipping}€`);
 *   console.log(`Total: ${group.total}€`);
 * });
 */
export function useCartByArtisan(): CartItemsByArtisan[] {
  const items = useCartStore((state) => state.items);

  return useMemo(() => {
    // Si no hay items, retornar array vacío
    if (items.length === 0) {
      return [];
    }

    // Agrupar items por artisan.id
    const grouped = items.reduce((acc, item) => {
      const artisanId = item.product.artisan.id;

      // Si no existe el grupo del artesano, crearlo
      if (!acc[artisanId]) {
        acc[artisanId] = {
          artisan: {
            id: item.product.artisan.id,
            slug: item.product.artisan.slug,
            display_name: item.product.artisan.display_name,
            avatar: item.product.artisan.avatar,
            shipping_cost: item.product.artisan.shipping_cost,
          },
          items: [],
          subtotal: 0,
          shipping: parseFloat(item.product.artisan.shipping_cost || '5.00'),
          total: 0,
        };
      }

      // Agregar item al grupo del artesano
      acc[artisanId].items.push(item);

      return acc;
    }, {} as Record<number, CartItemsByArtisan>);

    // Calcular totales para cada grupo de artesano
    Object.values(grouped).forEach((group) => {
      // Calcular subtotal (suma de precio * cantidad de todos los productos)
      group.subtotal = group.items.reduce((sum, item) => {
        const price = parseFloat(item.product.price);
        return sum + price * item.quantity;
      }, 0);

      // Calcular total (subtotal + envío)
      group.total = group.subtotal + group.shipping;
    });

    // Convertir objeto a array y ordenar por nombre de artesano
    return Object.values(grouped).sort((a, b) =>
      a.artisan.display_name.localeCompare(b.artisan.display_name)
    );
  }, [items]);
}

/**
 * Hook para obtener el total general del carrito multi-vendor
 *
 * @returns Objeto con totales generales del carrito
 *
 * @example
 * const { totalItems, totalProducts, totalShipping, grandTotal } = useCartTotals();
 */
export function useCartTotals() {
  const itemsByArtisan = useCartByArtisan();

  return useMemo(() => {
    const totalItems = itemsByArtisan.reduce(
      (sum, group) => sum + group.items.reduce((s, item) => s + item.quantity, 0),
      0
    );

    const totalProducts = itemsByArtisan.reduce(
      (sum, group) => sum + group.subtotal,
      0
    );

    const totalShipping = itemsByArtisan.reduce(
      (sum, group) => sum + group.shipping,
      0
    );

    const grandTotal = totalProducts + totalShipping;

    return {
      totalItems,
      totalProducts,
      totalShipping,
      grandTotal,
    };
  }, [itemsByArtisan]);
}
