/**
 * ImageUploader Component
 * 
 * Componente completo para subir y gestionar imágenes:
 * - Dropzone para seleccionar archivos
 * - Progress bars de upload
 * - Preview de imágenes subidas
 * - Integración con useCloudinaryUpload
 */

'use client';

import { useCallback } from 'react';
import { FileDropzone } from '@/components/ui/file-dropzone';
import { useCloudinaryUpload } from '@/hooks/useCloudinaryUpload';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { WorkImage } from '@/lib/schemas/workSchema';

interface ImageUploaderProps {
  images: WorkImage[];
  onChange: (images: WorkImage[]) => void;
  maxImages?: number;
  disabled?: boolean;
}

export function ImageUploader({
  images,
  onChange,
  maxImages = 20,
  disabled = false,
}: ImageUploaderProps) {
  const { uploadFiles, uploadingFiles, isUploading } = useCloudinaryUpload();

  const handleFilesSelected = useCallback(
    async (files: File[]) => {
      // Verificar límite
      const remainingSlots = maxImages - images.length;
      if (files.length > remainingSlots) {
        toast.error(`Solo puedes subir ${remainingSlots} imágenes más`);
        return;
      }

      try {
        // Subir archivos
        const results = await uploadFiles(files);

        // Añadir resultados a la lista de imágenes (filtrar URLs vacías)
        const newImages: WorkImage[] = results
          .filter((result) => result.secureUrl && result.secureUrl.trim() !== '')
          .map((result) => ({
            url: result.secureUrl,
            publicId: result.publicId,
          }));

        if (newImages.length > 0) {
          onChange([...images, ...newImages]);
          toast.success(`${newImages.length} imagen(es) subida(s) correctamente`);
        } else {
          toast.error('No se pudieron subir las imágenes');
        }
      } catch (error) {
        console.error('Error uploading files:', error);
        toast.error('Error al subir imágenes');
      }
    },
    [images, maxImages, onChange, uploadFiles]
  );

  const canUploadMore = images.length < maxImages && !disabled;

  return (
    <div className="space-y-4">
      
      {/* Contador */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">
          Imágenes ({images.length}/{maxImages})
        </p>
        {images.length > 0 && (
          <p className="text-xs text-muted-foreground">
            La primera imagen será la portada
          </p>
        )}
      </div>

      {/* Dropzone (solo si hay espacio) */}
      {canUploadMore && (
        <FileDropzone
          onFilesSelected={handleFilesSelected}
          maxFiles={maxImages - images.length}
          disabled={disabled || isUploading}
        />
      )}

      {/* Progress de uploads en curso */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-3">
          {uploadingFiles.map((uploadingFile, index) => (
            <div
              key={`${uploadingFile.file.name}-${index}`}
              className="space-y-2 p-3 bg-muted/50 rounded-lg"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {uploadingFile.status === 'uploading' && (
                    <Loader2 className="h-4 w-4 animate-spin text-primary flex-shrink-0" />
                  )}
                  {uploadingFile.status === 'success' && (
                    <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                  )}
                  {uploadingFile.status === 'error' && (
                    <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
                  )}
                  
                  <p className="text-sm font-medium truncate">
                    {uploadingFile.file.name}
                  </p>
                </div>
                
                <span className="text-xs text-muted-foreground flex-shrink-0">
                  {uploadingFile.progress}%
                </span>
              </div>

              {uploadingFile.status === 'uploading' && (
                <Progress value={uploadingFile.progress} className="h-1" />
              )}

              {uploadingFile.status === 'error' && (
                <p className="text-xs text-destructive">
                  {uploadingFile.error}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Mensaje si llegó al límite */}
      {!canUploadMore && images.length >= maxImages && (
        <div className="p-3 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground text-center">
            Has alcanzado el límite de {maxImages} imágenes
          </p>
        </div>
      )}
      
    </div>
  );
}

