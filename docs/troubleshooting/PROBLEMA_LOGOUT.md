# 🔐 PROBLEMA: LOGOUT NO FUNCIONA CORRECTAMENTE

## OBJETIVO
Hacer que el logout desde el dashboard:
1. ✅ Muestre un toast verde de confirmación: "Sesión cerrada exitosamente"
2. ✅ Redirija a **home** (`/`) - NO a `/login`
3. ✅ Elimine las cookies `token` y `refresh_token`

---

## PROBLEMA ACTUAL
- Al hacer logout desde el dashboard, redirige a `/login` en lugar de `/`
- El toast aparece pero es blanco/negro (no verde)
- Las cookies se eliminan correctamente

---

## ARCHIVOS IMPLICADOS

### 1. `frontend/src/stores/authStore.ts`
```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'sonner';
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

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthActions {
  login: (data: LoginData) => Promise<User>;
  logout: () => void;
  register: (data: RegisterData) => Promise<void>;
  checkAuth: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      // --- STATE ---
      user: null,
      isAuthenticated: false,
      isLoading: false,

      // --- ACTIONS ---

      login: async (data: LoginData) => {
        set({ isLoading: true });

        try {
          const response = await axiosInstance.post<AuthResponse>(
            '/api/v1/auth/login/',
            data
          );

          const { access, refresh, user } = response.data;

          setToken(access);
          setRefreshToken(refresh);

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          });

          toast.success(`¡Bienvenido, ${user.username}!`);
          
          return user;
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
        // Guardar flag para mostrar toast después del redirect
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('logout_success', 'true');
        }
        
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

        // Redirigir a home
        if (typeof window !== 'undefined') {
          window.location.replace('/');
        }
      },

      register: async (data: RegisterData) => {
        set({ isLoading: true });

        try {
          await axiosInstance.post('/api/v1/auth/register/', data);

          set({ isLoading: false });

          toast.success('Cuenta creada exitosamente. Ya puedes iniciar sesión.');

          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        } catch (error: unknown) {
          set({ isLoading: false });

          const errorData = (error as { response?: { data?: Record<string, unknown> } }).response?.data;

          if (errorData && typeof errorData === 'object') {
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

      checkAuth: async () => {
        const token = getToken();

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
          const response = await axiosInstance.get<User>('/api/v1/auth/profile/');

          set({
            user: response.data,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch {
          removeAllTokens();
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      refreshUser: async () => {
        if (!get().isAuthenticated) {
          return;
        }

        try {
          const response = await axiosInstance.get<User>('/api/v1/auth/profile/');
          set({ user: response.data });
        } catch (error) {
          console.error('Error refreshing user:', error);
          get().logout();
        }
      },

      setUser: (user: User | null) => {
        set({
          user,
          isAuthenticated: !!user,
        });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

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
```

---

### 2. `frontend/src/components/dashboard/DashboardHeader.tsx`
```typescript
/**
 * DashboardHeader Component
 * 
 * Header del dashboard con info de usuario y acciones.
 * 
 * Features:
 * - Avatar y nombre del usuario
 * - Dropdown menu con opciones
 * - Link a portfolio público
 * - Logout
 */

'use client';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { SafeImage } from '@/components/ui/SafeImage';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut, User, Eye } from 'lucide-react';
import { avatarUrl } from '@/lib/cloudinary';
import { useAuth } from '@/hooks/useAuth';

interface DashboardHeaderProps {
  user: {
    id: number;
    display_name: string;
    email: string;
    slug: string;
    avatar?: string | null;
  };
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const { logout } = useAuth();
  
  const handleLogout = () => {
    logout();
  };

  // Calcular iniciales del usuario
  const initials = user.display_name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="sticky top-0 z-30 h-16 bg-card border-b border-border flex items-center justify-between px-4 md:px-6">
      
      {/* Breadcrumb / Page title (opcional) */}
      <div className="flex items-center gap-4">
        {/* Se puede añadir breadcrumbs aquí en futuras iteraciones */}
      </div>
      
      {/* User menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-2">
            <Avatar className="h-8 w-8">
              <SafeImage
                src={user.avatar ? avatarUrl(user.avatar) : null}
                alt={user.display_name}
                fallbackType="avatar"
                fallbackId={user.id}
                className="w-full h-full object-cover rounded-full"
              />
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
            <span className="hidden md:inline font-medium">{user.display_name}</span>
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.display_name}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem asChild>
            <a 
              href={`/artesanos/${user.slug}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="cursor-pointer"
            >
              <Eye className="mr-2 h-4 w-4" />
              <span>Ver mi portfolio público</span>
            </a>
          </DropdownMenuItem>
          
          <DropdownMenuItem asChild>
            <a href="/dashboard/perfil" className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              <span>Editar perfil</span>
            </a>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem asChild>
            <button 
              onClick={(e) => {
                e.preventDefault();
                handleLogout();
              }}
              className="w-full cursor-pointer flex items-center"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Cerrar sesión</span>
            </button>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
    </header>
  );
}
```

---

### 3. `frontend/src/app/(dashboard)/layout.tsx`
```typescript
/**
 * Dashboard Layout
 * 
 * Layout principal para todas las páginas del dashboard.
 * Incluye sidebar, header y área de contenido.
 * 
 * Features:
 * - Sidebar con navegación
 * - Header con usuario
 * - React Query Provider
 * - Toast notifications
 */

import { ReactNode } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';

export const metadata = {
  title: 'Dashboard | Mitaller',
  description: 'Gestiona tu portfolio de obras',
};

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Verificar si hay token en cookies
  const cookieStore = await cookies();
  const token = cookieStore.get('token');
  
  // Si no hay token, redirect a home
  // (El toast de logout se mostrará allí si viene de un logout)
  if (!token) {
    redirect('/');
  }
  
  // TODO: Decodificar token para obtener datos del usuario
  // Por ahora, usar placeholder (mejorar en siguiente iteración)
  const user = {
    id: 1,
    display_name: 'Artista',
    email: 'artista@mitaller.art',
    slug: 'artista-demo',
    avatar: null,
  };

  return (
    <div className="min-h-screen bg-background">
      
      {/* Sidebar */}
      <DashboardSidebar />
      
      {/* Main content */}
      <div className="lg:pl-64">
        
        {/* Header */}
        <DashboardHeader user={user} />
        
        {/* Page content */}
        <main className="p-4 md:p-6 lg:p-8">
          {children}
        </main>
        
      </div>
      
    </div>
  );
}
```

---

### 4. `frontend/middleware.ts`
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware de Next.js para proteger rutas del dashboard
 * 
 * Features:
 * - Protege rutas /dashboard/* (dashboard artesanos)
 * - Verifica autenticación mediante token JWT en cookies
 * - Valida que el usuario tenga rol de artesano
 * - Redirige a login si no está autenticado
 * - Redirige a home si no tiene permisos
 * 
 * Se ejecuta en Edge Runtime para máxima performance
 */

// Rutas que requieren autenticación de artesano
const ARTISAN_ROUTES = ['/dashboard', '/artesano'];

// Rutas públicas que no requieren middleware
const PUBLIC_ROUTES = ['/', '/artesanos', '/carrito', '/login', '/registro'];

/**
 * Verificar si el usuario tiene un token válido
 * @param request - Request de Next.js
 * @returns true si hay token, false si no
 */
function hasAuthToken(request: NextRequest): boolean {
  const token =
    request.cookies.get('token')?.value ||
    request.headers.get('authorization')?.replace('Bearer ', '');

  return !!token;
}

/**
 * Verificar si la ruta requiere autenticación de artesano
 * @param pathname - Ruta a verificar
 * @returns true si requiere autenticación de artesano
 */
function requiresArtisanAuth(pathname: string): boolean {
  return ARTISAN_ROUTES.some((route) => pathname.startsWith(route));
}

/**
 * Verificar si es una ruta pública
 * @param pathname - Ruta a verificar
 * @returns true si es pública
 */
function isPublicRoute(pathname: string): boolean {
  // Rutas exactas públicas
  if (PUBLIC_ROUTES.includes(pathname)) {
    return true;
  }

  // Rutas dinámicas públicas
  if (
    pathname.startsWith('/artesanos/') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') // Archivos estáticos
  ) {
    return true;
  }

  return false;
}

/**
 * Middleware principal
 * Se ejecuta antes de cada request para verificar permisos
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Si es una ruta pública, permitir acceso
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Si la ruta requiere autenticación de artesano
  if (requiresArtisanAuth(pathname)) {
    const hasToken = hasAuthToken(request);

    // Si no hay token, redirigir a home
    if (!hasToken) {
      const homeUrl = new URL('/', request.url);
      return NextResponse.redirect(homeUrl);
    }

    // Si hay token, verificar rol con el backend
    // IMPORTANTE: En Edge Runtime no podemos hacer llamadas async complejas
    // La verificación del rol se hace mejor en el client-side o en un Server Component
    // Por ahora, confiamos en que el token es válido y el hook useAuth verificará el rol
    
    // Permitir acceso (la verificación de rol se hace en client-side)
    return NextResponse.next();
  }

  // Por defecto, permitir acceso
  return NextResponse.next();
}

/**
 * Config del middleware
 * Define qué rutas deben pasar por el middleware
 */
export const config = {
  matcher: [
    /*
     * Match todas las rutas excepto:
     * - api (API routes)
     * - _next/static (archivos estáticos)
     * - _next/image (optimización de imágenes)
     * - favicon.ico (favicon)
     * - public files (archivos en /public)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|public).*)',
  ],
};
```

---

### 5. `frontend/src/app/page.tsx` (home - detector de toast)
```typescript
'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
// ... otros imports

export default function HomePage() {
  // Detectar logout exitoso y mostrar toast
  useEffect(() => {
    const logoutSuccess = sessionStorage.getItem('logout_success');
    if (logoutSuccess === 'true') {
      // Pequeño delay para asegurar que Sonner esté montado
      setTimeout(() => {
        toast.success('Sesión cerrada exitosamente', {
          duration: 4000,
        });
      }, 100);
      
      // Limpiar flag
      setTimeout(() => {
        sessionStorage.removeItem('logout_success');
      }, 500);
    }
  }, []);

  // ... resto del componente
}
```

---

### 6. `frontend/src/app/(auth)/login/page.tsx` (login - detector de toast)
```typescript
'use client';

import { useEffect } from 'react';
// ... otros imports
import { toast } from 'sonner';

export default function LoginPage() {
  const { login, isLoading } = useAuth();
  const router = useRouter();

  // Detectar logout exitoso y mostrar toast
  useEffect(() => {
    const logoutSuccess = sessionStorage.getItem('logout_success');
    if (logoutSuccess === 'true') {
      // Pequeño delay para asegurar que Sonner esté montado
      setTimeout(() => {
        toast.success('Sesión cerrada exitosamente', {
          duration: 4000,
        });
      }, 100);
      
      // Limpiar flag
      setTimeout(() => {
        sessionStorage.removeItem('logout_success');
      }, 500);
    }
  }, []);

  // ... resto del componente
}
```

---

### 7. `frontend/src/components/providers/Providers.tsx`
```typescript
'use client';

import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            gcTime: 5 * 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthInitializer>
        {children}
        <Toaster 
          position="bottom-right"
          toastOptions={{
            duration: 4000,
            classNames: {
              success: 'bg-green-50 dark:bg-green-950 text-green-900 dark:text-green-100 border-green-200 dark:border-green-800',
              error: 'bg-red-50 dark:bg-red-950 text-red-900 dark:text-red-100 border-red-200 dark:border-red-800',
            },
          }}
        />
      </AuthInitializer>
    </QueryClientProvider>
  );
}

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const { checkAuth } = useAuth();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return <>{children}</>;
}
```

---

### 8. `frontend/src/lib/axios.ts` (manejo de cookies)
```typescript
import Cookies from 'js-cookie';

// Nombres de las cookies para los tokens
const TOKEN_COOKIE = 'token';
const REFRESH_TOKEN_COOKIE = 'refresh_token';

export const getToken = (): string | undefined => {
  return Cookies.get(TOKEN_COOKIE);
};

export const setToken = (token: string): void => {
  Cookies.set(TOKEN_COOKIE, token, {
    expires: 1 / 24, // 1 hora
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
};

export const removeToken = (): void => {
  Cookies.remove(TOKEN_COOKIE);
};

export const getRefreshToken = (): string | undefined => {
  return Cookies.get(REFRESH_TOKEN_COOKIE);
};

export const setRefreshToken = (token: string): void => {
  Cookies.set(REFRESH_TOKEN_COOKIE, token, {
    expires: 7,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
};

export const removeRefreshToken = (): void => {
  Cookies.remove(REFRESH_TOKEN_COOKIE);
};

export const removeAllTokens = (): void => {
  removeToken();
  removeRefreshToken();
};

// ... resto del archivo axios
```

---

### 9. `frontend/src/hooks/useAuth.ts`
```typescript
import { useEffect } from 'react';
import { useAuthStore, useUserRole } from '@/stores/authStore';

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
```

---

## COMPORTAMIENTO OBSERVADO

1. Usuario hace click en "Cerrar sesión" en el dashboard
2. Se ejecuta `logout()` de authStore
3. Se guarda flag en `sessionStorage.setItem('logout_success', 'true')`
4. Se eliminan cookies correctamente
5. Se ejecuta `window.location.replace('/')`
6. **PROBLEMA**: La URL final es `http://localhost:3000/login` en lugar de `http://localhost:3000/`
7. El toast aparece pero en blanco/negro, no verde

---

## HIPÓTESIS

- Puede que el `layout.tsx` del dashboard se esté re-renderizando después de eliminar cookies
- El middleware podría estar interceptando el redirect
- Algún componente intermedio está haciendo redirect a `/login`

---

## STACK TÉCNICO

- Next.js 15.5.4 (Turbopack)
- React 19
- Zustand (estado global)
- Sonner (toasts)
- js-cookie (manejo de cookies)
- TypeScript

---

## PREGUNTA PARA CLAUDE

¿Por qué el logout redirige a `/login` en lugar de `/` como está configurado en `window.location.replace('/')`? ¿Qué está interceptando el redirect y cómo lo arreglo?

