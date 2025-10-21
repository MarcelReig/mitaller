/**
 * DashboardHeader Component
 * 
 * Header del dashboard con info de usuario y acciones.
 * 
 * Features:
 * - Avatar y nombre del usuario
 * - Dropdown menu con opciones
 * - Link a portfolio público
 * - Logout
 */

'use client';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { SafeImage } from '@/components/ui/SafeImage';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut, User, Eye } from 'lucide-react';
import { avatarUrl } from '@/lib/cloudinary';
import { useAuth } from '@/hooks/useAuth';

interface DashboardHeaderProps {
  user: {
    id: number;
    display_name: string;
    email: string;
    slug: string;
    avatar?: string | null;
  };
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const { logout } = useAuth();
  
  const handleLogout = () => {
    logout();
  };

  // Calcular iniciales del usuario
  const initials = user.display_name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="sticky top-0 z-30 h-16 bg-card border-b border-border flex items-center justify-between px-4 md:px-6">
      
      {/* Breadcrumb / Page title (opcional) */}
      <div className="flex items-center gap-4">
        {/* Se puede añadir breadcrumbs aquí en futuras iteraciones */}
      </div>
      
      {/* User menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-2">
            <Avatar className="h-8 w-8">
              <SafeImage
                src={user.avatar ? avatarUrl(user.avatar) : null}
                alt={user.display_name}
                fallbackType="avatar"
                fallbackId={user.id}
                className="w-full h-full object-cover rounded-full"
              />
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
            <span className="hidden md:inline font-medium">{user.display_name}</span>
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.display_name}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem asChild>
            <a 
              href={`/artesanos/${user.slug}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="cursor-pointer"
            >
              <Eye className="mr-2 h-4 w-4" />
              <span>Ver mi portfolio público</span>
            </a>
          </DropdownMenuItem>
          
          <DropdownMenuItem asChild>
            <a href="/dashboard/perfil" className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              <span>Editar perfil</span>
            </a>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem asChild>
            <button 
              onClick={(e) => {
                e.preventDefault();
                handleLogout();
              }}
              className="w-full cursor-pointer flex items-center"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Cerrar sesión</span>
            </button>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
    </header>
  );
}

