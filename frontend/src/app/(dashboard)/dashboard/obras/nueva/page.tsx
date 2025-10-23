/**
 * Create Work Page
 * 
 * Página para crear una nueva obra
 */

'use client';

import { WorkForm } from '@/components/works/WorkForm';
import { useCreateWork } from '@/lib/hooks/useWorks';
import type { WorkFormData } from '@/lib/schemas/workSchema';
import type { WorkFormData as ApiWorkFormData } from '@/lib/api/works';

export default function NewWorkPage() {
  const createWork = useCreateWork();

  const handleSubmit = async (data: WorkFormData) => {
    const payload: ApiWorkFormData = {
      title: data.title,
      description: data.description || '',
      category: data.category || undefined,
      is_featured: data.is_featured,
      thumbnail_url: data.images[0]?.url || '',
      images: data.images.map(img => img.url),
    };

    await createWork.mutateAsync(payload);
  };

  return (
    <WorkForm
      mode="create"
      onSubmit={handleSubmit}
    />
  );
}
