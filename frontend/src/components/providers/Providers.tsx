'use client';

import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

/**
 * Providers globales de la aplicación
 * 
 * Features:
 * - React Query para data fetching
 * - Sonner para notificaciones
 * - Verificación de autenticación al iniciar
 */
export function Providers({ children }: { children: React.ReactNode }) {
  // QueryClient para React Query (único por sesión)
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minuto
            gcTime: 5 * 60 * 1000, // 5 minutos
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
            style: {
              background: 'hsl(var(--background))',
              color: 'hsl(var(--foreground))',
              border: '1px solid hsl(var(--border))',
            },
          }}
        />
      </AuthInitializer>
    </QueryClientProvider>
  );
}

/**
 * Inicializa la verificación de autenticación al cargar la app
 */
function AuthInitializer({ children }: { children: React.ReactNode }) {
  const { checkAuth } = useAuth();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return <>{children}</>;
}

