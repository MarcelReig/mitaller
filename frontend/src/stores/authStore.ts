import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'sonner';
import axiosInstance, {
  setToken,
  setRefreshToken,
  removeAllTokens,
  getToken,
  getRefreshToken,
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
  login: (data: LoginData) => Promise<User>;
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
          console.log('[AUTH] Intentando login con email:', data.email);
          
          const response = await axiosInstance.post<AuthResponse>(
            '/api/v1/auth/login/',
            data
          );

          console.log('[AUTH] Respuesta del login:', response.data);

          const { access, refresh, user } = response.data;

          console.log('[AUTH] Usuario recibido del backend:', {
            id: user.id,
            email: user.email,
            username: user.username,
            role: user.role,
          });

          // Verificación de seguridad: el email debe coincidir
          if (user.email.toLowerCase() !== data.email.toLowerCase()) {
            console.error('[AUTH] ERROR CRÍTICO: El usuario devuelto no coincide con el email de login!');
            console.error('[AUTH] Email solicitado:', data.email);
            console.error('[AUTH] Email recibido:', user.email);
            
            // Limpiar cualquier token
            removeAllTokens();
            set({ isLoading: false });
            
            toast.error('Error de autenticación. Por favor, intenta nuevamente.');
            throw new Error('Usuario devuelto no coincide con credenciales');
          }

          // Guardar tokens en cookies
          setToken(access);
          setRefreshToken(refresh);

          // Actualizar estado
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          });

          console.log('[AUTH] Login exitoso. Usuario guardado en store:', user.email);
          toast.success(`¡Bienvenido, ${user.username}!`);
          
          return user; // Retornar el usuario para que el componente pueda redirigir
        } catch (error: unknown) {
          set({ isLoading: false });

          const errorMessage =
            (error as { response?: { data?: { detail?: string } } }).response?.data?.detail ||
            'Error al iniciar sesión. Verifica tus credenciales.';

          console.error('[AUTH] Error en login:', error);
          toast.error(errorMessage);
          throw error;
        }
      },

      /**
       * Logout: limpia tokens y resetea estado
       * 
       * Flujo optimizado:
       * 1. Intentar blacklist del token en backend primero
       * 2. Resetear estado y limpiar tokens
       * 3. Redirigir a home
       */
      logout: async () => {
        console.log('[AUTH] Iniciando logout...');
        
        try {
          // Obtener refresh token antes de limpiar
          const refreshToken = getRefreshToken();
          
          // 1. Intentar blacklist en backend (con timeout corto)
          if (refreshToken) {
            console.log('[AUTH] Llamando blacklist en backend...');
            await Promise.race([
              axiosInstance.post('/api/v1/auth/logout/', { refresh: refreshToken }),
              new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Timeout')), 1000)
              )
            ]);
            console.log('[AUTH] Blacklist exitoso');
          }
        } catch (error) {
          // Si falla o timeout, continuar igual
          console.warn('[AUTH] Backend logout failed/timeout, continuando:', error);
        }

        // 2. Resetear estado y limpiar tokens
        console.log('[AUTH] Limpiando tokens y estado...');
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
        removeAllTokens();

        // 3. Redirigir a home
        console.log('[AUTH] Redirigiendo a home...');
        if (typeof window !== 'undefined') {
          window.location.replace('/');
        }
      },

      /**
       * Registro de nuevo usuario
       * Después del registro exitoso, hace login automático
       * y redirige al dashboard para mejor UX
       */
      register: async (data: RegisterData) => {
        // Limpiar cualquier sesión anterior antes de registrar
        console.log('[AUTH] Iniciando registro. Limpiando sesiones anteriores...');
        removeAllTokens();
        set({ 
          user: null, 
          isAuthenticated: false, 
          isLoading: true 
        });

        try {
          console.log('[AUTH] PASO 1/3: Registrando usuario con email:', data.email);
          
          // 1. Registrar el usuario
          const registerResponse = await axiosInstance.post('/api/v1/auth/register/', data);
          console.log('[AUTH] ✓ Registro exitoso:', registerResponse.data);

          console.log('[AUTH] PASO 2/3: Haciendo login automático...');

          // 2. Login automático con las mismas credenciales
          const loginResponse = await axiosInstance.post<AuthResponse>(
            '/api/v1/auth/login/',
            {
              email: data.email,
              password: data.password
            }
          );

          console.log('[AUTH] ✓ Login response:', loginResponse.data);

          const { access, refresh, user } = loginResponse.data;

          // Verificación de seguridad: el email debe coincidir
          if (user.email.toLowerCase() !== data.email.toLowerCase()) {
            console.error('[AUTH] ✗ ERROR: El usuario devuelto no coincide');
            console.error('[AUTH] Esperado:', data.email, '| Recibido:', user.email);
            removeAllTokens();
            set({ isLoading: false });
            toast.error('Error de autenticación. Por favor, inicia sesión manualmente.');
            
            if (typeof window !== 'undefined') {
              window.location.href = '/login';
            }
            return;
          }

          console.log('[AUTH] PASO 3/3: Guardando tokens y estado...');

          // Guardar tokens en cookies
          setToken(access);
          setRefreshToken(refresh);

          // Actualizar estado
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          });

          console.log('[AUTH] ✓ Estado actualizado. Usuario:', user.email);
          console.log('[AUTH] ✓ Tokens guardados en cookies');
          
          // Mensaje de bienvenida más cálido
          toast.success(`¡Bienvenido a Mitaller, ${user.username}! 🎉`);

          // 3. Redirigir según el rol del usuario
          const redirectTo = user.role === 'admin' 
            ? '/admin/dashboard' 
            : user.role === 'artisan' 
            ? '/dashboard' 
            : '/';
          
          console.log(`[AUTH] ✓ Redirigiendo a ${redirectTo} (rol: ${user.role})...`);
          if (typeof window !== 'undefined') {
            setTimeout(() => {
              window.location.href = redirectTo;
            }, 500); // Pequeño delay para que se vea el toast
          }
        } catch (error: unknown) {
          set({ isLoading: false });

          console.error('[AUTH] ✗ Error en registro/login:', error);

          // Distinguir entre error de registro y error de login
          const axiosError = error as { response?: { data?: Record<string, unknown>; status?: number }; config?: { url?: string } };
          const isLoginError = axiosError.config?.url?.includes('login');
          
          if (isLoginError) {
            console.error('[AUTH] ✗ El error ocurrió durante el login automático');
            toast.error('Cuenta creada pero el login automático falló. Por favor, inicia sesión manualmente.');
            if (typeof window !== 'undefined') {
              setTimeout(() => {
                window.location.href = '/login';
              }, 2000);
            }
            return;
          }

          // Manejar errores de validación del backend (en registro)
          const errorData = axiosError.response?.data;

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
        // Poner loading INMEDIATAMENTE para prevenir redirects prematuros
        set({ isLoading: true });
        
        const token = getToken();
        console.log('[AUTH] checkAuth iniciado. Token presente:', !!token);

        // Si no hay token, no está autenticado
        if (!token) {
          console.log('[AUTH] No hay token. Usuario no autenticado.');
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
          return;
        }

        console.log('[AUTH] Token encontrado. Verificando sesión con backend...');

        try {
          // Obtener datos del usuario actual
          const response = await axiosInstance.get<User>('/api/v1/auth/profile/');

          console.log('[AUTH] Sesión válida. Usuario:', response.data.email);
          set({
            user: response.data,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          // Token inválido o expirado
          console.warn('[AUTH] Token inválido o expirado. Limpiando sesión.', error);
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
          const response = await axiosInstance.get<User>('/api/v1/auth/profile/');
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
      // NO persistir nada en localStorage por seguridad
      // El usuario se recupera del token en cada carga vía checkAuth()
      partialize: () => ({}),
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
    hasArtistProfile: user?.has_artist_profile === true,
    canCreateWorks: user?.role === 'artisan' && user?.has_artist_profile === true,
  };
};

/**
 * Hook helper simplificado para verificar si el usuario es admin
 */
export const useIsAdmin = () => {
  const user = useAuthStore((state) => state.user);
  return user?.role === 'admin';
};
