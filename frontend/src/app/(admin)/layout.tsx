/**
 * Admin Layout
 *
 * Layout separado para el panel de administración.
 * Incluye AdminSidebar y protección de rutas para admin.
 *
 * Features:
 * - Sidebar específico de admin
 * - Protección: solo usuarios con role='ADMIN'
 * - Layout completamente separado del dashboard de artesanos
 */

'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import AdminSidebar from '@/components/admin/AdminSidebar';
import Navbar from '@/components/layout/Navbar';
import { Loader2 } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    console.log('[ADMIN LAYOUT] Estado:', {
      isAuthenticated,
      isLoading,
      role: user?.role,
      hasChecked
    });

    if (!isLoading && !hasChecked) {
      setHasChecked(true);
    }

    // Verificar autenticación y rol de admin
    if (hasChecked && !isLoading) {
      if (!isAuthenticated) {
        console.log('[ADMIN LAYOUT] No autenticado, redirigiendo a login');
        router.push('/login');
        return;
      }

      if (user?.role !== 'admin') {
        console.log('[ADMIN LAYOUT] Usuario no es admin, redirigiendo a dashboard');
        router.push('/dashboard');
        return;
      }
    }
  }, [isLoading, isAuthenticated, user, hasChecked, router]);

  // Mostrar loader mientras verifica
  if (isLoading || !hasChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-sm text-muted-foreground">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  // Si no es admin o no está autenticado
  if (!isAuthenticated || !user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-sm text-muted-foreground">Redirigiendo...</p>
        </div>
      </div>
    );
  }

  // TODO: Fetch pending artisans count para el badge
  const pendingCount = 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Sidebar */}
      <AdminSidebar pendingArtisansCount={pendingCount} />

      {/* Main content */}
      <div className="lg:pl-64">
        <main className="p-4 md:p-6 lg:p-8 mt-16">
          {children}
        </main>
      </div>
    </div>
  );
}
