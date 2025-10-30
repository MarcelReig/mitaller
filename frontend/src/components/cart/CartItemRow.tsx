'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { CartItem } from '@/types';

interface CartItemRowProps {
  item: CartItem;
  onUpdateQuantity: (productId: number, quantity: number) => void;
  onRemove: (productId: number) => void;
}

/**
 * Fila individual de producto en el carrito
 *
 * Features:
 * - Imagen miniatura (80x80px)
 * - Nombre del producto
 * - Precio unitario
 * - Selector de cantidad (input number o +/- buttons)
 * - Subtotal calculado
 * - Botón eliminar (icono X)
 * - Actualización de cantidad con debounce
 *
 * @example
 * ```tsx
 * <CartItemRow
 *   item={item}
 *   onUpdateQuantity={updateQuantity}
 *   onRemove={removeItem}
 * />
 * ```
 */
export function CartItemRow({
  item,
  onUpdateQuantity,
  onRemove,
}: CartItemRowProps) {
  const [quantity, setQuantity] = useState(item.quantity);
  const [imageError, setImageError] = useState(false);

  // Debounce de actualización de cantidad
  useEffect(() => {
    // Si la cantidad no ha cambiado, no hacer nada
    if (quantity === item.quantity) return;

    // Validar que no exceda el stock
    const validQuantity = Math.min(quantity, item.product.stock);
    if (validQuantity !== quantity) {
      setQuantity(validQuantity);
      return;
    }

    // Debounce de 500ms
    const timer = setTimeout(() => {
      onUpdateQuantity(item.product.id, quantity);
    }, 500);

    return () => clearTimeout(timer);
  }, [quantity, item.quantity, item.product.id, item.product.stock, onUpdateQuantity]);

  const incrementQuantity = () => {
    if (quantity < item.product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleRemove = () => {
    onRemove(item.product.id);
  };

  // Calcular subtotal
  const subtotal = parseFloat(item.product.price) * quantity;

  return (
    <div className="flex gap-4 py-4">
      {/* Imagen del producto */}
      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border bg-muted">
        <Image
          src={imageError ? '/placeholder-product.png' : item.product.thumbnail_url}
          alt={item.product.name}
          fill
          className="object-cover"
          onError={() => setImageError(true)}
          sizes="80px"
        />
      </div>

      {/* Información del producto */}
      <div className="flex flex-1 flex-col justify-between">
        {/* Nombre y precio */}
        <div className="flex justify-between gap-2">
          <div className="flex-1">
            <h4 className="text-sm font-medium leading-tight line-clamp-2">
              {item.product.name}
            </h4>
            <p className="mt-1 text-xs text-muted-foreground">
              {parseFloat(item.product.price).toFixed(2)}€ / unidad
            </p>
          </div>

          {/* Botón eliminar */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRemove}
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Selector de cantidad y subtotal */}
        <div className="flex items-center justify-between gap-2">
          {/* Selector de cantidad */}
          <div className="flex items-center rounded-md border">
            <Button
              variant="ghost"
              size="icon"
              onClick={decrementQuantity}
              disabled={quantity <= 1}
              className="h-8 w-8 rounded-r-none"
            >
              <Minus className="h-3 w-3" />
            </Button>
            <div className="flex h-8 w-10 items-center justify-center border-x text-sm font-medium">
              {quantity}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={incrementQuantity}
              disabled={quantity >= item.product.stock}
              className="h-8 w-8 rounded-l-none"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          {/* Subtotal */}
          <div className="text-right">
            <p className="text-sm font-semibold">{subtotal.toFixed(2)}€</p>
            {quantity > 1 && (
              <p className="text-xs text-muted-foreground">
                {quantity} × {parseFloat(item.product.price).toFixed(2)}€
              </p>
            )}
          </div>
        </div>

        {/* Warning de stock bajo */}
        {quantity >= item.product.stock && (
          <p className="mt-1 text-xs text-orange-600">
            Cantidad máxima alcanzada
          </p>
        )}
      </div>
    </div>
  );
}
