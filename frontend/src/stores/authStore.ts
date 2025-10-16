import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'react-hot-toast';
import axiosInstance, {
  setToken,
  setRefreshToken,
  removeAllTokens,
  getToken,
} from '@/lib/axios';
import type {
  User,
  LoginData,
  RegisterData,
  AuthResponse,
} from '@/types/user';

/**
 * Estado del store de autenticación
 */
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

/**
 * Acciones del store de autenticación
 */
interface AuthActions {
  login: (data: LoginData) => Promise<void>;
  logout: () => void;
  register: (data: RegisterData) => Promise<void>;
  checkAuth: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
}

/**
 * Store de Zustand para manejo de autenticación con JWT
 * 
 * Features:
 * - Login/Logout con tokens JWT
 * - Registro de nuevos usuarios
 * - Persistencia en localStorage
 * - Auto-verificación de sesión al cargar la app
 * - Refresh de datos del usuario
 */
export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      // --- STATE ---
      user: null,
      isAuthenticated: false,
      isLoading: false,

      // --- ACTIONS ---

      /**
       * Login con email y password
       * Guarda tokens en cookies y usuario en el store
       */
      login: async (data: LoginData) => {
        set({ isLoading: true });

        try {
          const response = await axiosInstance.post<AuthResponse>(
            '/api/v1/auth/token/',
            data
          );

          const { access, refresh, user } = response.data;

          // Guardar tokens en cookies
          setToken(access);
          setRefreshToken(refresh);

          // Actualizar estado
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          });

          toast.success(`¡Bienvenido, ${user.username}!`);
        } catch (error: unknown) {
          set({ isLoading: false });

          const errorMessage =
            (error as { response?: { data?: { detail?: string } } }).response?.data?.detail ||
            'Error al iniciar sesión. Verifica tus credenciales.';

          toast.error(errorMessage);
          throw error;
        }
      },

      /**
       * Logout: limpia tokens y resetea estado
       */
      logout: () => {
        // Limpiar tokens de cookies
        removeAllTokens();

        // Resetear estado
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });

        // Opcional: llamar al endpoint de logout del backend para blacklist del token
        axiosInstance
          .post('/api/v1/auth/logout/')
          .catch(() => {
            // Ignorar errores del logout en el backend
          });

        toast.success('Sesión cerrada correctamente');

        // Redirigir a home
        if (typeof window !== 'undefined') {
          window.location.href = '/';
        }
      },

      /**
       * Registro de nuevo usuario
       * Después del registro exitoso, no hace login automático
       * El usuario debe iniciar sesión manualmente
       */
      register: async (data: RegisterData) => {
        set({ isLoading: true });

        try {
          await axiosInstance.post('/api/v1/auth/register/', data);

          set({ isLoading: false });

          toast.success('Cuenta creada exitosamente. Ya puedes iniciar sesión.');

          // Redirigir a login
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        } catch (error: unknown) {
          set({ isLoading: false });

          // Manejar errores de validación del backend
          const errorData = (error as { response?: { data?: Record<string, unknown> } }).response?.data;

          if (errorData && typeof errorData === 'object') {
            // Mostrar el primer error encontrado
            const firstError = Object.values(errorData)[0];
            const errorMessage = Array.isArray(firstError)
              ? firstError[0]
              : String(firstError);

            toast.error(errorMessage);
          } else {
            toast.error('Error al crear la cuenta. Inténtalo de nuevo.');
          }

          throw error;
        }
      },

      /**
       * Verificar si hay una sesión activa al cargar la app
       * Llama al endpoint /me/ para obtener datos del usuario actual
       */
      checkAuth: async () => {
        const token = getToken();

        // Si no hay token, no está autenticado
        if (!token) {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
          return;
        }

        set({ isLoading: true });

        try {
          // Obtener datos del usuario actual
          const response = await axiosInstance.get<User>('/api/v1/auth/me/');

          set({
            user: response.data,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch {
          // Token inválido o expirado
          removeAllTokens();
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      /**
       * Refrescar los datos del usuario actual
       * Útil después de actualizar el perfil
       */
      refreshUser: async () => {
        if (!get().isAuthenticated) {
          return;
        }

        try {
          const response = await axiosInstance.get<User>('/api/v1/auth/me/');
          set({ user: response.data });
        } catch (error) {
          console.error('Error refreshing user:', error);
          // Si falla, hacer logout
          get().logout();
        }
      },

      /**
       * Actualizar usuario manualmente (útil para tests o actualizaciones parciales)
       */
      setUser: (user: User | null) => {
        set({
          user,
          isAuthenticated: !!user,
        });
      },

      /**
       * Actualizar estado de loading manualmente
       */
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: 'auth-storage', // Nombre en localStorage
      // Solo persistir isAuthenticated, no el user completo (por seguridad)
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

/**
 * Hook helper para verificar roles del usuario
 */
export const useUserRole = () => {
  const user = useAuthStore((state) => state.user);

  return {
    isArtisan: user?.role === 'artisan',
    isAdmin: user?.role === 'admin',
    isCustomer: user?.role === 'customer',
    isApproved: user?.is_approved === true,
    canSell: user?.role === 'artisan' && user?.is_approved === true,
  };
};
