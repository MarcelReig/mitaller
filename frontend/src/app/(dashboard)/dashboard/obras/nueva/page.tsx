/**
 * Create Work Page
 * 
 * Página para crear una nueva obra
 */

'use client';

import { WorkForm } from '@/components/works/WorkForm';
import { useCreateWork } from '@/lib/hooks/useWorks';
import { useUserRole } from '@/stores/authStore';
import type { WorkFormData } from '@/lib/schemas/workSchema';
import type { WorkFormData as ApiWorkFormData } from '@/lib/api/works';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function NewWorkPage() {
  const createWork = useCreateWork();
  const { isArtisan, hasArtistProfile, canCreateWorks } = useUserRole();

  const handleSubmit = async (data: WorkFormData) => {
    // Log para debugging
    console.log('Datos del formulario:', data);
    
    const payload: ApiWorkFormData = {
      title: data.title.trim(),
      description: data.description?.trim() || '',
      category: data.category || undefined,
      is_featured: data.is_featured || false,
      thumbnail_url: data.images[0]?.url || undefined,
      images: data.images.map(img => img.url),
    };
    
    // Log del payload que se envía
    console.log('Payload a enviar:', payload);

    await createWork.mutateAsync(payload);
  };

  // Mostrar alerta si el usuario no puede crear obras
  if (!canCreateWorks) {
    return (
      <div className="container max-w-3xl py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No puedes crear obras</AlertTitle>
          <AlertDescription className="space-y-4">
            {!isArtisan && (
              <p>Solo los usuarios con rol de artesano pueden crear obras.</p>
            )}
            {isArtisan && !hasArtistProfile && (
              <>
                <p>
                  Tu cuenta no tiene un perfil de artista asociado. Esto puede ocurrir si:
                </p>
                <ul className="list-disc list-inside space-y-1 mt-2">
                  <li>Tu cuenta fue creada antes de que se implementara el sistema de perfiles</li>
                  <li>Hubo un error durante el registro</li>
                </ul>
                <p className="mt-4">
                  <strong>Solución:</strong> Contacta al administrador para que te cree un perfil de artista.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Puedes ejecutar este comando en el servidor:
                  <code className="block mt-1 p-2 bg-muted rounded text-xs">
                    python manage.py fix_artist_profile --email tu@email.com
                  </code>
                </p>
              </>
            )}
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

  return (
    <WorkForm
      mode="create"
      onSubmit={handleSubmit}
    />
  );
}
