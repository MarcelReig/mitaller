/**
 * Profile Edit Page
 * 
 * Página para editar el perfil del artista autenticado.
 * URL: /dashboard/perfil
 * 
 * Features:
 * - Carga datos del artista actual
 * - Formulario completo de edición
 * - Loading state
 * - Error handling
 * - Redirect después de guardar
 */

'use client';

import { useRouter } from 'next/navigation';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { useMyArtisanProfile } from '@/lib/hooks/useArtisans';
import { useUserRole } from '@/stores/authStore';

export default function ProfileEditPage() {
  const router = useRouter();
  const { data: artisan, isLoading, error } = useMyArtisanProfile();
  const { isArtisan, hasArtisanProfile } = useUserRole();

  /**
   * Callback después de guardar exitosamente
   */
  const handleSuccess = () => {
    // Opción 1: Redirigir al perfil público
    // router.push(`/artesanos/${artisan?.slug}`);
    
    // Opción 2: Mantener en la página (el toast ya muestra éxito)
    // No hacer nada, el usuario puede seguir editando
    
    // Opción 3: Refrescar datos
    // Ya se hace automáticamente por React Query
  };

  /**
   * Callback al cancelar
   */
  const handleCancel = () => {
    router.push('/dashboard');
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-sm text-muted-foreground">
            Cargando tu perfil...
          </p>
        </div>
      </div>
    );
  }

  // Error: No es artesano
  if (!isArtisan) {
    return (
      <div className="container max-w-3xl py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Acceso restringido</AlertTitle>
          <AlertDescription className="space-y-4">
            <p>Solo los artesanos pueden editar perfiles.</p>
            <Button asChild variant="outline">
              <Link href="/dashboard">Volver al Dashboard</Link>
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Error: No tiene perfil de artesano
  if (!hasArtisanProfile || !artisan) {
    return (
      <div className="container max-w-3xl py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Perfil no encontrado</AlertTitle>
          <AlertDescription className="space-y-4">
            <p>
              No tienes un perfil de artesano asociado. Esto puede ocurrir si:
            </p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Tu cuenta fue creada antes de que se implementara el sistema de perfiles</li>
              <li>Hubo un error durante el registro</li>
            </ul>
            <p className="mt-4">
              <strong>Solución:</strong> Contacta al administrador para que te cree un perfil de artesano.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              El administrador puede ejecutar este comando en el servidor:
              <code className="block mt-1 p-2 bg-muted rounded text-xs">
                python manage.py fix_artisan_profile --email tu@email.com
              </code>
            </p>
            <div className="flex gap-2 mt-4">
              <Button asChild variant="outline">
                <Link href="/dashboard">Volver al Dashboard</Link>
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Error: Fallo al cargar
  if (error) {
    return (
      <div className="container max-w-3xl py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error al cargar perfil</AlertTitle>
          <AlertDescription className="space-y-4">
            <p>
              Hubo un error al cargar tu perfil. Por favor, intenta recargar la página.
            </p>
            <div className="flex gap-2">
              <Button onClick={() => window.location.reload()}>
                Recargar página
              </Button>
              <Button asChild variant="outline">
                <Link href="/dashboard">Volver al Dashboard</Link>
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Renderizar formulario
  return (
    <div className="container max-w-4xl py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Editar perfil</h1>
        <p className="text-muted-foreground mt-1">
          Actualiza la información que aparece en tu perfil público
        </p>
      </div>

      {/* Formulario */}
      <ProfileForm
        artisan={artisan}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  );
}

