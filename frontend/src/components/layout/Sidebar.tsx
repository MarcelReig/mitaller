'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  LayoutDashboard,
  Palette,
  Package,
  ShoppingBag,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Item de navegación del sidebar
 */
interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

/**
 * Sidebar para dashboard del artesano
 * 
 * Features:
 * - Avatar y nombre del artesano
 * - Navegación del dashboard
 * - Link al perfil público
 * - Botón de logout
 * - Active state en link actual
 * - Responsive: drawer en mobile
 */
export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Items de navegación del dashboard
  const navItems: NavItem[] = [
    {
      label: 'Dashboard',
      href: '/artesano',
      icon: LayoutDashboard,
    },
    {
      label: 'Portfolio',
      href: '/artesano/portfolio',
      icon: Palette,
    },
    {
      label: 'Productos',
      href: '/artesano/productos',
      icon: Package,
    },
    {
      label: 'Ventas',
      href: '/artesano/ventas',
      icon: ShoppingBag,
    },
    {
      label: 'Configuración',
      href: '/artesano/configuracion',
      icon: Settings,
    },
  ];

  // Helper para verificar si un link está activo
  const isActive = (href: string) => {
    if (href === '/artesano') {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  // Iniciales del artesano
  const getInitials = () => {
    if (!user) return 'A';
    if (user.artist_profile?.display_name) {
      const names = user.artist_profile.display_name.split(' ');
      return names.length > 1
        ? `${names[0][0]}${names[1][0]}`.toUpperCase()
        : names[0][0].toUpperCase();
    }
    return user.username[0].toUpperCase();
  };

  // Componente del contenido del sidebar (reutilizable para desktop y mobile)
  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header con Avatar */}
      <div className="p-6 border-b">
        <div className="flex items-center space-x-3">
          <Avatar className="h-12 w-12">
            <AvatarImage
              src={user?.artist_profile?.avatar || undefined}
              alt={user?.artist_profile?.display_name || user?.username}
            />
            <AvatarFallback>{getInitials()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">
              {user?.artist_profile?.display_name || user?.username}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t space-y-2">
        {/* Ver Perfil Público */}
        {user?.artist_profile && (
          <Link
            href={`/artesanos/${user.artist_profile.slug}`}
            target="_blank"
            onClick={() => setMobileOpen(false)}
          >
            <Button variant="outline" className="w-full justify-start" size="sm">
              <ExternalLink className="h-4 w-4 mr-2" />
              Ver Perfil Público
            </Button>
          </Link>
        )}

        {/* Cerrar Sesión */}
        <Button
          variant="ghost"
          className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
          size="sm"
          onClick={() => {
            setMobileOpen(false);
            logout();
          }}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Cerrar Sesión
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="bg-background"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 border-r bg-background h-screen sticky top-0">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <>
          {/* Overlay */}
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setMobileOpen(false)}
          />

          {/* Drawer */}
          <aside className="lg:hidden fixed inset-y-0 left-0 w-64 bg-background border-r z-50 transform transition-transform duration-300 ease-in-out">
            <SidebarContent />
          </aside>
        </>
      )}
    </>
  );
}
