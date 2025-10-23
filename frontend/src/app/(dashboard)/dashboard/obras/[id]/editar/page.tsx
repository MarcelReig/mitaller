/**
 * Edit Work Page
 * 
 * Página para editar una obra existente
 */

'use client';

import { use } from 'react';
import { notFound } from 'next/navigation';
import { WorkForm } from '@/components/works/WorkForm';
import { useWork, useUpdateWork } from '@/lib/hooks/useWorks';
import { Skeleton } from '@/components/ui/skeleton';
import type { WorkFormData } from '@/lib/schemas/workSchema';

interface EditWorkPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditWorkPage({ params }: EditWorkPageProps) {
  const { id } = use(params);
  const workId = parseInt(id);

  const { data: work, isLoading, error } = useWork(workId);
  const updateWork = useUpdateWork();

  if (isLoading) {
    return <WorkFormSkeleton />;
  }

  if (error || !work) {
    notFound();
  }

  const handleSubmit = async (data: WorkFormData) => {
    const workData = {
      title: data.title,
      description: data.description || '',
      category: data.category || undefined,
      is_featured: data.is_featured,
      thumbnail_url: data.images[0]?.url || '',
      images: data.images.map(img => img.url), // ✅ CORREGIDO: Solo URLs
    };

    await updateWork.mutateAsync({ id: workId, data: workData });
  };

  // Convertir datos del backend a formato del formulario
  const initialData: Partial<WorkFormData> = {
    title: work.title,
    description: work.description || '',
    category: work.category as WorkFormData['category'],
    is_featured: work.is_featured,
    // ✅ CORREGIDO: Backend devuelve array de strings
    images: Array.isArray(work.images) 
      ? work.images.map((url) => ({
          url: url,
          publicId: undefined, // No disponible desde backend
        }))
      : [],
  };

  return (
    <WorkForm
      mode="edit"
      initialData={initialData}
      onSubmit={handleSubmit}
    />
  );
}

/**
 * Loading skeleton
 */
function WorkFormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96" />
      </div>

      <div className="space-y-6">
        <Skeleton className="h-96 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  );
}
