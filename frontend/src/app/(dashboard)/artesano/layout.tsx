'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Sidebar from '@/components/layout/Sidebar';
import { toast } from 'react-hot-toast';

/**
 * Layout para el dashboard del artesano
 * 
 * Características:
 * - Verifica autenticación (redirect a /login si no autenticado)
 * - Verifica role='artisan' (redirect a / si no es artesano)
 * - Layout de 2 columnas: Sidebar fijo | Contenido scroll
 * - Sidebar responsive (desktop: fijo, mobile: drawer)
 * - Loading state mientras verifica auth
 */
export default function ArtesanoDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, isArtisan, isLoading, user } = useAuth();

  // Verificar autenticación y rol
  useEffect(() => {
    // Esperar a que termine de verificar la auth
    if (isLoading) return;

    // Si no está autenticado, redirigir a login
    if (!isAuthenticated) {
      toast.error('Debes iniciar sesión para acceder');
      router.push('/login');
      return;
    }

    // Si está autenticado pero no es artesano, redirigir a home
    if (!isArtisan) {
      toast.error('Solo los artesanos pueden acceder al dashboard');
      router.push('/');
      return;
    }

    // Si es artesano pero no está aprobado, mostrar aviso
    if (user && !user.is_approved) {
      toast(
        'Tu cuenta está pendiente de aprobación. Algunas funciones están limitadas.',
        {
          icon: '⏳',
          duration: 5000,
        }
      );
    }
  }, [isAuthenticated, isArtisan, isLoading, user, router]);

  // Mostrar loading mientras verifica
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado o no es artesano, no renderizar nada
  // (el useEffect se encargará de redirigir)
  if (!isAuthenticated || !isArtisan) {
    return null;
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-muted/30">
        {/* Container con padding */}
        <div className="container mx-auto p-6 lg:p-8 max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
}
