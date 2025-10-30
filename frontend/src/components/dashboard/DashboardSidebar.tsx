/**
 * DashboardSidebar Component
 * 
 * Sidebar de navegación del dashboard del artesano.
 * 
 * Features:
 * - Mobile: Off-canvas con Sheet
 * - Desktop: Sidebar fijo
 * - Active state en ruta actual
 * - Icons con Lucide
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import {
  Images,
  ShoppingBag,
  Receipt,
  User,
  Menu,
} from 'lucide-react';

const navigation = [
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
    name: 'Mi Perfil',
    href: '/dashboard/perfil',
    icon: User,
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const NavLinks = ({ onItemClick }: { onItemClick?: () => void }) => (
    <nav className="flex flex-col gap-1 p-4">
      {navigation.map((item) => {
        const Icon = item.icon;
        const isActive = pathname?.startsWith(item.href) || false;

        return (
          <Link
            key={item.name}
            href={item.href}
            onClick={onItemClick}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="h-5 w-5 shrink-0" />
            <span>{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Mobile: Sheet (Off-canvas) */}
      <div className="lg:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="fixed left-4 top-20 z-40 lg:hidden"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Abrir menú</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <SheetTitle className="sr-only">Menú de navegación del dashboard</SheetTitle>
            <div className="h-full pt-4">
              {/* Logo en mobile */}
              <div className="flex h-12 items-center px-6 mb-4">
                <Link href="/dashboard/obras" className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-primary">
                    Mitaller
                  </span>
                </Link>
              </div>
              <NavLinks onItemClick={() => setOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop: Sidebar permanente */}
      <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border hidden lg:block">
        {/* Logo/Brand */}
        <div className="flex h-16 items-center px-6 border-b border-border">
          <Link href="/dashboard/obras" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-primary">
              Mitaller
            </span>
          </Link>
        </div>

        <NavLinks />
      </aside>
    </>
  );
}
