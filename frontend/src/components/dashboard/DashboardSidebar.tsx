/**
 * DashboardSidebar Component
 * 
 * Sidebar de navegación del dashboard.
 * 
 * Features:
 * - Navegación entre secciones
 * - Active state en ruta actual
 * - Responsive (visible en desktop)
 * - Icons con Lucide
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Images,
  ShoppingBag,
  Receipt,
  Eye,
  User,
  Settings,
} from 'lucide-react';

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    exact: true, // Solo marcar active si es exactamente /dashboard
  },
  {
    name: 'Mis Obras',
    href: '/dashboard/obras',
    icon: Images,
  },
  {
    name: 'Tienda',
    href: '/dashboard/tienda',
    icon: ShoppingBag,
  },
  {
    name: 'Pedidos',
    href: '/dashboard/pedidos',
    icon: Receipt,
  },
  {
    name: 'Preview Portfolio',
    href: '/dashboard/preview',
    icon: Eye,
  },
  {
    name: 'Mi Perfil',
    href: '/dashboard/perfil',
    icon: User,
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border hidden lg:block">
      
      {/* Logo/Brand */}
      <div className="flex h-16 items-center px-6 border-b border-border">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-2xl font-bold text-primary">
            Mitaller
          </span>
        </Link>
      </div>
      
      {/* Navigation */}
      <nav className="flex flex-col gap-1 p-4">
        {navigation.map((item) => {
          const Icon = item.icon;
          
          // Determinar si está activo
          let isActive = false;
          if (item.exact) {
            isActive = pathname === item.href;
          } else {
            isActive = pathname?.startsWith(item.href) || false;
          }
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
      
      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
        <Link
          href="/dashboard/configuracion"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <Settings className="h-5 w-5" />
          <span>Configuración</span>
        </Link>
      </div>
      
    </aside>
  );
}

