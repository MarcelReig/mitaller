'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { useIsAdmin } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { SafeImage } from '@/components/ui/SafeImage';
import { avatarUrl } from '@/lib/cloudinary';
import {
  Menu,
  X,
  ShoppingCart,
  User,
  LogOut,
  LayoutDashboard,
  Palette,
  Shield,
} from 'lucide-react';

/**
 * Navbar principal para páginas públicas
 * 
 * Features:
 * - Logo con link al home
 * - Navegación: Inicio, Artesanos
 * - Carrito con badge de cantidad
 * - Usuario autenticado: Avatar + dropdown con opciones
 * - Usuario no autenticado: Botón "Entrar"
 * - Responsive con menú hamburguesa en mobile
 * - Sticky top
 */
export default function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout, isArtisan } = useAuth();
  const { totalItems } = useCart();
  const isAdmin = useIsAdmin();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Helper para verificar si un link está activo
  const isActive = (path: string) => pathname === path;

  // Iniciales del usuario para el avatar fallback
  const getUserInitials = () => {
    if (!user) return 'U';
    if (user.first_name && user.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
    }
    return user.username[0].toUpperCase();
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
          >
            <Palette className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">MiTaller.art</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive('/') ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              Inicio
            </Link>
            <Link
              href="/artesanos"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive('/artesanos') || pathname?.startsWith('/artesanos/')
                  ? 'text-primary'
                  : 'text-muted-foreground'
              }`}
            >
              Artesanos
            </Link>
            {isAdmin && (
              <Link
                href="/admin/dashboard"
                className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${
                  pathname?.startsWith('/admin')
                    ? 'text-primary'
                    : 'text-muted-foreground'
                }`}
              >
                <Shield className="h-4 w-4" />
                Admin
              </Link>
            )}
          </div>

          {/* Right Side: Cart + User */}
          <div className="flex items-center space-x-4">
            {/* Carrito */}
            <Link href="/carrito">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-xs font-bold text-primary-foreground flex items-center justify-center">
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </Button>
            </Link>

            {/* Usuario Autenticado */}
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9">
                      <SafeImage
                        src={avatarUrl(user.artist_profile?.avatar)}
                        alt={user.username}
                        fallbackType="avatar"
                        fallbackId={user.id}
                        className="w-full h-full object-cover rounded-full"
                      />
                      <AvatarFallback>{getUserInitials()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user.username}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  
                  {/* Si es artesano, mostrar link al dashboard */}
                  {isArtisan && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard" className="cursor-pointer">
                          <LayoutDashboard className="mr-2 h-4 w-4" />
                          Mi taller
                        </Link>
                      </DropdownMenuItem>
                      {user.artist_profile && (
                        <DropdownMenuItem asChild>
                          <Link 
                            href={`/artesanos/${user.artist_profile.slug}`}
                            className="cursor-pointer"
                          >
                            <User className="mr-2 h-4 w-4" />
                            Ver perfil público
                          </Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                    </>
                  )}
                  
                  <DropdownMenuItem 
                    onClick={logout}
                    className="cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Cerrar sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              /* Usuario No Autenticado */
              <Link href="/login" className="hidden md:block">
                <Button size="sm">
                  <User className="mr-2 h-4 w-4" />
                  Entrar
                </Button>
              </Link>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t py-4 space-y-3">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive('/') 
                  ? 'bg-primary/10 text-primary' 
                  : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              Inicio
            </Link>
            <Link
              href="/artesanos"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive('/artesanos') || pathname?.startsWith('/artesanos/')
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              Artesanos
            </Link>

            {isAuthenticated && user ? (
              <>
                {isArtisan && (
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-muted transition-colors"
                  >
                    Mi taller
                  </Link>
                )}
                {isAdmin && (
                  <Link
                    href="/admin/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-muted transition-colors"
                  >
                    🛠️ Admin
                  </Link>
                )}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full text-left px-4 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-muted transition-colors"
                >
                  Cerrar sesión
                </button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-center"
              >
                Entrar
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
