'use client';

import Link from 'next/link';
import { useAuthStore } from '@/stores/auth';
import { Button } from '@/components/ui/button';
import { LogOut, User, ShoppingBag } from 'lucide-react';

export default function Header() {
  const { isAuthenticated, user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <ShoppingBag className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">MiTaller.art</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              href="/artistas" 
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Artistas
            </Link>
            <Link 
              href="/obras" 
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Obras
            </Link>
            <Link 
              href="/tienda" 
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Tienda
            </Link>
          </nav>

          {/* Auth Actions */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm">
                    <User className="h-4 w-4 mr-2" />
                    {user?.username || 'Perfil'}
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Salir
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">
                    Iniciar Sesión
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="sm">
                    Registrarse
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}


