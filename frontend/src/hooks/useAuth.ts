import { useEffect } from 'react';
import { useAuthStore, useUserRole } from '@/stores/authStore';

/**
 * Hook personalizado para acceder a la autenticación
 * 
 * Wrapper sobre useAuthStore que proporciona una API más limpia
 * para acceder al estado y acciones de autenticación.
 * 
 * Ejecuta checkAuth() automáticamente en mount para verificar
 * si hay una sesión activa.
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { user, isAuthenticated, isArtisan, login, logout } = useAuth();
 *   
 *   if (!isAuthenticated) {
 *     return <LoginForm onSubmit={login} />;
 *   }
 *   
 *   if (isArtisan) {
 *     return <div>Dashboard del artesano</div>;
 *   }
 *   
 *   return <div>Hola, {user.username}</div>;
 * }
 * ```
 */
export function useAuth() {
  const {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    register,
    checkAuth,
    refreshUser,
  } = useAuthStore();

  const roles = useUserRole();

  // Verificar autenticación al montar el componente
  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      checkAuth();
    }
  }, [checkAuth, isAuthenticated, isLoading]);

  return {
    // Estado
    user,
    isAuthenticated,
    isLoading,

    // Acciones
    login,
    logout,
    register,
    checkAuth,
    refreshUser,

    // Helpers de roles
    ...roles,
  };
}

/**
 * Helper para obtener la ruta de redirección por defecto según el rol del usuario
 * 
 * @param role - Rol del usuario ('admin', 'artisan', 'customer', etc.)
 * @returns Ruta a la que debe ser redirigido el usuario
 * 
 * @example
 * ```tsx
 * const user = await login(credentials);
 * const redirectTo = getDefaultRoute(user.role);
 * router.push(redirectTo);
 * ```
 */
export const getDefaultRoute = (role: string): string => {
  switch (role) {
    case 'admin':
      return '/admin';
    case 'artisan':
      return '/dashboard';
    case 'customer':
      return '/';
    default:
      return '/';
  }
};
