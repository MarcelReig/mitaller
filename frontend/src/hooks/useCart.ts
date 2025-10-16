import { useCartStore } from '@/stores/cartStore';

/**
 * Hook personalizado para acceder al carrito de compras
 * 
 * Wrapper sobre useCartStore que proporciona una API más limpia
 * para acceder al estado y acciones del carrito
 * 
 * @example
 * ```tsx
 * function ProductCard({ product }: { product: Product }) {
 *   const { addItem, totalItems } = useCart();
 *   
 *   return (
 *     <button onClick={() => addItem(product, 1)}>
 *       Añadir al carrito ({totalItems})
 *     </button>
 *   );
 * }
 * ```
 */
export function useCart() {
  const {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    totalItems,
    subtotal,
  } = useCartStore();

  return {
    // Estado
    items,
    totalItems,
    subtotal,

    // Acciones
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
  };
}
