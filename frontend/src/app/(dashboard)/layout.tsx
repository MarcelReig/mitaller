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
  
  // Si no hay token, redirect a login
  if (!token) {
    redirect('/login?redirect=/dashboard');
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

