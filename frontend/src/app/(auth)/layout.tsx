import type { Metadata } from 'next';
import Link from 'next/link';
import { Palette } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Autenticación',
};

/**
 * Layout para páginas de autenticación (login, registro)
 * 
 * Características:
 * - Sin navbar ni footer (experiencia limpia)
 * - Centrado vertical y horizontal
 * - Fondo con gradiente sutil
 * - Logo en la parte superior
 * - Card contenedor con sombra
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4">
      {/* Logo superior */}
      <Link
        href="/"
        className="flex items-center space-x-2 mb-8 hover:opacity-80 transition-opacity"
      >
        <Palette className="h-8 w-8 text-primary" />
        <span className="text-2xl font-bold">MiTaller.art</span>
      </Link>

      {/* Card contenedor */}
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-lg shadow-lg p-8">
          {children}
        </div>
      </div>

      {/* Footer mínimo */}
      <p className="mt-8 text-sm text-muted-foreground">
        © 2025 MiTaller.art. Marketplace de Artesanos de Menorca.
      </p>
    </div>
  );
}
