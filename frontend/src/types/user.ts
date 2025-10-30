// Tipos para usuarios y autenticación del sistema MiTaller.art

/**
 * Roles disponibles en el sistema
 * - admin: Administrador del marketplace
 * - artisan: Artesano que vende productos físicos (cerámica, joyería, etc.)
 * - customer: Cliente registrado (compras como invitado por ahora)
 */
export type UserRole = 'admin' | 'artisan' | 'customer';

/**
 * Perfil del artesano asociado al usuario
 * Solo disponible si el usuario tiene role='artisan'
 */
export interface ArtisanProfile {
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
  is_active: boolean;
  can_sell?: boolean; // true si es artesano aprobado
  has_artisan_profile?: boolean; // true si tiene ArtisanProfile asociado
  artisan_slug?: string | null; // slug del perfil artesano
  date_joined?: string;
  artisan_profile?: ArtisanProfile; // Perfil artesano (opcional)
}

/**
 * Respuesta del endpoint de login/token
 */
export interface AuthResponse {
  message?: string;
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
  password_confirm: string; // Confirmación de contraseña (validación backend)
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

