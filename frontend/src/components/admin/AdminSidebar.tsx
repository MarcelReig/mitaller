'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import {
  LayoutDashboard,
  Users,
  Menu,
} from 'lucide-react';

interface NavItem {
  icon: typeof LayoutDashboard;
  label: string;
  href: string;
  badge?: number;
}

interface AdminSidebarProps {
  pendingArtisansCount?: number;
}

export default function AdminSidebar({ pendingArtisansCount = 0 }: AdminSidebarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const navItems: NavItem[] = [
    {
      icon: LayoutDashboard,
      label: 'Dashboard',
      href: '/admin',
    },
    {
      icon: Users,
      label: 'Artesanos',
      href: '/admin/artesanos',
      badge: pendingArtisansCount > 0 ? pendingArtisansCount : undefined,
    },
  ];

  const NavLinks = ({ onItemClick }: { onItemClick?: () => void }) => (
    <nav className="flex flex-col gap-1 p-4">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href ||
                        (item.href !== '/admin' && pathname?.startsWith(item.href));

        return (
          <Link
            key={item.href}
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
            <span>{item.label}</span>
            {item.badge && (
              <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground">
                {item.badge}
              </span>
            )}
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
            <SheetTitle className="sr-only">Menú de navegación del admin</SheetTitle>
            <div className="h-full pt-4">
              {/* Logo en mobile */}
              <div className="flex h-12 items-center px-6 mb-4">
                <Link href="/admin" className="flex items-center gap-2">
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
          <Link href="/admin" className="flex items-center gap-2">
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
