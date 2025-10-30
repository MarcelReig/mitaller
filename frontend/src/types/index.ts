// Barrel export de todos los tipos de la aplicación

// User types
export type {
  User,
  UserRole,
  ArtisanProfile,
  AuthResponse,
  RegisterData,
  LoginData,
} from './user';

// Artisan types (artesanos - craftspeople)
export type {
  Artisan,
  ArtisanSummary,
  ArtisanListItem,
  ArtisanFormData,
  ArtisanUpdateData,
  ArtisanFilters,
  CraftType,
  Location,
} from './artisan';

export { CRAFT_TYPE_LABELS, LOCATION_LABELS } from './artisan';

// Work types
export type {
  Work,
  WorkArtisan,
  WorkFormData,
  WorkFilters,
  WorkListResponse,
} from './work';

// Product types
export type {
  Product,
  ProductArtisan,
  ProductFormData,
  ProductFilters,
  ProductListResponse,
  CartItem,
  CartSummary,
} from './product';

// Cart types (multi-vendor)
export type {
  CartItemsByArtisan,
  ShippingOption,
  ShippingSelection,
  MultiVendorCartSummary,
} from './cart';

// Order types
export type {
  Order,
  OrderItem,
  OrderItemProduct,
  OrderItemArtisan,
  OrderStatus,
  PaymentStatus,
  CreateOrderData,
  CreateOrderResponse,
  OrderFilters,
  OrderListResponse,
} from './order';

export {
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  PAYMENT_STATUS_COLORS,
} from './order';

// API Response types
export type ApiError = {
  detail?: string;
  [key: string]: unknown;
};

export type PaginatedResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};
