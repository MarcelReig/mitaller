// Tipos para usuarios y autenticación del sistema MiTaller.art

/**
 * Roles disponibles en el sistema
 * - artisan: Artesano que puede vender productos
 * - admin: Administrador del marketplace
 * - customer: Cliente que solo compra (no se registra, compra como invitado)
 */
export type UserRole = 'artisan' | 'admin' | 'customer';

/**
 * Perfil del artista asociado al usuario
 * Solo disponible si el usuario tiene role='artisan'
 */
export interface ArtistProfile {
  id: number;
  slug: string;
  display_name: string;
  avatar: string | null;
  craft_type: string;
  location: string;
  bio: string | null;
  is_featured: boolean;
  stripe_account_status: string;
}

/**
 * Usuario autenticado en el sistema
 */
export interface User {
  id: number;
  email: string;
  username: string;
  first_name?: string;
  last_name?: string;
  role: UserRole;
  is_approved?: boolean; // Solo para artesanos
  artist_profile?: ArtistProfile;
}

/**
 * Respuesta del endpoint de login/token
 */
export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}

/**
 * Datos para registro de nuevo usuario
 */
export interface RegisterData {
  email: string;
  username: string;
  password: string;
  first_name?: string;
  last_name?: string;
}

/**
 * Datos para login
 */
export interface LoginData {
  email: string;
  password: string;
}

