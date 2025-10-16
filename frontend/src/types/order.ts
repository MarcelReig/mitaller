// Tipos para órdenes y checkout

/**
 * Estados de una orden
 */
export type OrderStatus = 
  | 'pending'     // Pendiente
  | 'processing'  // Procesando
  | 'shipped'     // Enviado
  | 'delivered'   // Entregado
  | 'cancelled';  // Cancelado

/**
 * Estados de pago
 */
export type PaymentStatus = 
  | 'pending'     // Pendiente
  | 'processing'  // Procesando
  | 'succeeded'   // Exitoso
  | 'failed'      // Fallido
  | 'refunded'    // Reembolsado
  | 'cancelled';  // Cancelado

/**
 * Referencia al producto en un item de orden
 */
export type OrderItemProduct = {
  id: number;
  name: string;
  is_available: boolean;
};

/**
 * Referencia al artista en un item de orden
 */
export type OrderItemArtist = {
  id: number;
  slug: string;
  display_name: string;
  avatar: string | null;
};

/**
 * Item individual de una orden
 */
export type OrderItem = {
  id: number;
  product: OrderItemProduct;
  artist: OrderItemArtist;
  product_name: string;    // Nombre del producto en el momento de la compra
  product_price: string;   // Precio del producto en el momento de la compra
  quantity: number;
  subtotal: string;
  formatted_subtotal: string;
  created_at: string;
};

/**
 * Orden completa
 */
export type Order = {
  id: number;
  order_number: string;
  customer_email: string;
  customer_name: string;
  customer_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_postal_code: string;
  shipping_country: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  total_amount: string;
  formatted_total: string;
  items: OrderItem[];
  notes: string;
  created_at: string;
  updated_at: string;
};

/**
 * Datos para crear una orden (checkout)
 */
export type CreateOrderData = {
  customer_email: string;
  customer_name: string;
  customer_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_postal_code: string;
  shipping_country: string;
  notes?: string;
  items: {
    product_id: number;
    quantity: number;
  }[];
};

/**
 * Respuesta del backend al crear una orden
 */
export type CreateOrderResponse = {
  order: Order;
  client_secret: string; // Para Stripe Payment Intent
};

/**
 * Filtros para búsqueda de órdenes
 */
export type OrderFilters = {
  status?: OrderStatus;
  payment_status?: PaymentStatus;
  customer_email?: string;
  date_from?: string;
  date_to?: string;
};

/**
 * Respuesta paginada de órdenes
 */
export type OrderListResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: Order[];
};

/**
 * Labels en español para estados de orden
 */
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pendiente',
  processing: 'Procesando',
  shipped: 'Enviado',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
};

/**
 * Labels en español para estados de pago
 */
export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: 'Pendiente',
  processing: 'Procesando',
  succeeded: 'Exitoso',
  failed: 'Fallido',
  refunded: 'Reembolsado',
  cancelled: 'Cancelado',
};

/**
 * Colores para badges de estados (Tailwind classes)
 */
export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export const PAYMENT_STATUS_COLORS: Record<PaymentStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  succeeded: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  refunded: 'bg-orange-100 text-orange-800',
  cancelled: 'bg-gray-100 text-gray-800',
};
