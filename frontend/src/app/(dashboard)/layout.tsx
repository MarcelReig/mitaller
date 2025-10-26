/**
 * Dashboard Layout (Client Component)
 * 
 * Layout principal para todas las páginas del dashboard.
 * Incluye sidebar, header y área de contenido.
 * 
 * Features:
 * - Sidebar con navegación
 * - Header con usuario real del authStore
 * - Protección de rutas con autenticación
 * - Toast notifications
 */

'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Loader2 } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    console.log('[DASHBOARD LAYOUT] Estado actualizado:', { 
      isAuthenticated, 
      isLoading,
      hasUser: !!user,
      hasChecked
    });

    // Marcar que ya se hizo la verificación inicial cuando termine el loading
    if (!isLoading && !hasChecked) {
      setHasChecked(true);
    }

    // Solo redirigir si ya se verificó Y no está autenticado
    if (hasChecked && !isLoading && !isAuthenticated) {
      console.log('[DASHBOARD LAYOUT] Verificación completa: no autenticado, redirigiendo a login');
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, user, hasChecked, router]);

  // Mostrar loader mientras verifica autenticación O aún no ha terminado la primera verificación
  if (isLoading || !hasChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-sm text-muted-foreground">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado después de verificar, mostrar loader mientras redirige
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-sm text-muted-foreground">Redirigiendo a login...</p>
        </div>
      </div>
    );
  }

  // Usuario autenticado: preparar datos para el header
  const userData = {
    id: user.id,
    display_name: user.artisan_profile?.display_name || 
      (user.first_name && user.last_name 
        ? `${user.first_name} ${user.last_name}`.trim()
        : user.username),
    email: user.email,
    slug: user.artisan_profile?.slug || user.artisan_slug || user.username,
    avatar: user.artisan_profile?.avatar || null,
  };

  console.log('[DASHBOARD] Renderizando con usuario:', userData.email);

  return (
    <div className="min-h-screen bg-background">
      
      {/* Sidebar */}
      <DashboardSidebar />
      
      {/* Main content */}
      <div className="lg:pl-64">
        
        {/* Header con datos reales del usuario */}
        <DashboardHeader user={userData} />
        
        {/* Page content */}
        <main className="p-4 md:p-6 lg:p-8">
          {children}
        </main>
        
      </div>
      
    </div>
  );
}

