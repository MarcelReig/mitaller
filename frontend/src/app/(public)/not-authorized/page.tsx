'use client';

import { useRouter } from 'next/navigation';
import { ShieldX, Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotAuthorizedPage() {
  const router = useRouter();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <ShieldX className="h-24 w-24 text-red-500" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">
            ⛔ Acceso Denegado
          </h1>
          <p className="text-gray-600">
            Esta sección es solo para administradores del sistema.
          </p>
          <p className="text-sm text-gray-500">
            Si crees que esto es un error, contacta con soporte.
          </p>
        </div>
        
        <div className="flex gap-4 justify-center">
          <Button
            onClick={() => router.push('/dashboard')}
            variant="outline"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al Dashboard
          </Button>
          
          <Button onClick={() => router.push('/')}>
            <Home className="mr-2 h-4 w-4" />
            Ir al Inicio
          </Button>
        </div>
      </div>
    </div>
  );
}

