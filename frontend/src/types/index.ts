// Barrel export de todos los tipos de la aplicación

// User types
export type {
  User,
  UserRole,
  ArtistProfile,
  AuthResponse,
  RegisterData,
  LoginData,
} from './user';

// Artist types
export type {
  Artist,
  ArtistSummary,
  ArtistFormData,
  ArtistFilters,
  CraftType,
  Location,
} from './artist';

export { CRAFT_TYPE_LABELS, LOCATION_LABELS } from './artist';

// Work types
export type {
  Work,
  WorkArtist,
  WorkFormData,
  WorkFilters,
  WorkListResponse,
} from './work';

// Product types
export type {
  Product,
  ProductArtist,
  ProductFormData,
  ProductFilters,
  ProductListResponse,
  CartItem,
  CartSummary,
} from './product';

// Order types
export type {
  Order,
  OrderItem,
  OrderItemProduct,
  OrderItemArtist,
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
  [key: string]: any;
};

export type PaginatedResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

