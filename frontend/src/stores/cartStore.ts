import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'react-hot-toast';
import type { Product, CartItem } from '@/types';

/**
 * Estado del carrito de compras
 */
interface CartState {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
}

/**
 * Acciones del carrito
 */
interface CartActions {
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  calculateTotals: () => void;
}

/**
 * Store de Zustand para el carrito de compras
 * 
 * Features:
 * - Agregar productos al carrito
 * - Actualizar cantidades
 * - Eliminar productos
 * - Limpiar carrito
 * - Cálculo automático de totales
 * - Persistencia en localStorage
 */
export const useCartStore = create<CartState & CartActions>()(
  persist(
    (set, get) => ({
      // --- STATE ---
      items: [],
      totalItems: 0,
      subtotal: 0,

      // --- ACTIONS ---

      /**
       * Agregar producto al carrito
       * Si ya existe, incrementa la cantidad
       */
      addItem: (product: Product, quantity = 1) => {
        // Validar que el producto esté disponible
        if (!product.is_available) {
          toast.error('Este producto no está disponible');
          return;
        }

        // Validar stock
        if (product.stock < quantity) {
          toast.error(`Solo quedan ${product.stock} unidades disponibles`);
          return;
        }

        const items = get().items;
        const existingItem = items.find((item) => item.product.id === product.id);

        if (existingItem) {
          // Ya existe, verificar que no exceda el stock
          const newQuantity = existingItem.quantity + quantity;

          if (newQuantity > product.stock) {
            toast.error(`Solo puedes añadir ${product.stock} unidades de este producto`);
            return;
          }

          // Actualizar cantidad
          set({
            items: items.map((item) =>
              item.product.id === product.id
                ? { ...item, quantity: newQuantity }
                : item
            ),
          });

          toast.success(`Cantidad actualizada: ${newQuantity}`);
        } else {
          // Nuevo producto
          set({
            items: [...items, { product, quantity }],
          });

          toast.success(`${product.name} añadido al carrito`);
        }

        // Recalcular totales
        get().calculateTotals();
      },

      /**
       * Eliminar producto del carrito
       */
      removeItem: (productId: number) => {
        const items = get().items;
        const item = items.find((item) => item.product.id === productId);

        set({
          items: items.filter((item) => item.product.id !== productId),
        });

        if (item) {
          toast.success(`${item.product.name} eliminado del carrito`);
        }

        // Recalcular totales
        get().calculateTotals();
      },

      /**
       * Actualizar cantidad de un producto
       */
      updateQuantity: (productId: number, quantity: number) => {
        // Si la cantidad es 0 o negativa, eliminar el producto
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }

        const items = get().items;
        const item = items.find((item) => item.product.id === productId);

        if (!item) {
          return;
        }

        // Validar stock
        if (quantity > item.product.stock) {
          toast.error(`Solo quedan ${item.product.stock} unidades disponibles`);
          return;
        }

        set({
          items: items.map((item) =>
            item.product.id === productId ? { ...item, quantity } : item
          ),
        });

        // Recalcular totales
        get().calculateTotals();
      },

      /**
       * Limpiar todo el carrito
       */
      clearCart: () => {
        set({
          items: [],
          totalItems: 0,
          subtotal: 0,
        });

        toast.success('Carrito vaciado');
      },

      /**
       * Calcular totales del carrito
       * Se ejecuta automáticamente después de cada acción
       */
      calculateTotals: () => {
        const items = get().items;

        const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

        const subtotal = items.reduce((sum, item) => {
          const price = parseFloat(item.product.price);
          return sum + price * item.quantity;
        }, 0);

        set({
          totalItems,
          subtotal,
        });
      },
    }),
    {
      name: 'cart-storage', // Nombre en localStorage
      // Persistir todo el estado
      partialize: (state) => ({
        items: state.items,
      }),
      // Al hidratar el estado, recalcular totales
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.calculateTotals();
        }
      },
    }
  )
);
