/**
 * ProfileImageUpload Component
 * 
 * Componente para subir imágenes de perfil:
 * - Avatar (circular)
 * - Cover Image (rectangular)
 * 
 * Features:
 * - Drag & drop
 * - Preview en tiempo real
 * - Validación de archivos
 * - Upload a Cloudinary
 * - Loading states
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  uploadToCloudinary, 
  validateFile, 
  FILE_UPLOAD_CONFIG 
} from '@/lib/cloudinary/upload';

interface ProfileImageUploadProps {
  /** Tipo de imagen: avatar (circular) o cover (rectangular) */
  type: 'avatar' | 'cover';
  
  /** URL actual de la imagen (puede ser null si no hay imagen) */
  currentImageUrl?: string | null;
  
  /** Callback cuando se sube exitosamente una imagen */
  onImageUploaded: (url: string) => void;
  
  /** Callback para remover la imagen */
  onImageRemoved?: () => void;
  
  /** Clases CSS adicionales */
  className?: string;
}

export function ProfileImageUpload({
  type,
  currentImageUrl,
  onImageUploaded,
  onImageRemoved,
  className,
}: ProfileImageUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  /**
   * Sincronizar previewUrl cuando currentImageUrl cambia
   * Esto permite que las imágenes previamente subidas persistan al cargar el formulario
   */
  useEffect(() => {
    setPreviewUrl(currentImageUrl || null);
  }, [currentImageUrl]);

  // Configuración según tipo
  const config = {
    avatar: {
      label: 'Avatar',
      description: 'Imagen cuadrada (recomendado 400x400px)',
      aspectRatio: 'aspect-square',
      maxHeight: 'max-h-[240px]', // Avatar más compacto
      folder: 'artists/avatars',
    },
    cover: {
      label: 'Imagen de portada',
      description: 'Imagen horizontal (recomendado 1200x400px)',
      aspectRatio: 'aspect-[3/1]',
      maxHeight: 'max-h-[300px]', // Límite razonable para cover
      folder: 'artists/covers',
    },
  }[type];

  /**
   * Manejar drop de archivos
   */
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Validar archivo
    const validation = validateFile(file);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    // Crear preview local
    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Subir a Cloudinary
      const result = await uploadToCloudinary(file, {
        folder: config.folder,
        onProgress: (progress) => {
          setUploadProgress(progress);
        },
      });

      // Notificar éxito
      toast.success(`${config.label} subida correctamente`);
      onImageUploaded(result.secureUrl);
      
      // Limpiar preview local (usamos la URL de Cloudinary ahora)
      URL.revokeObjectURL(localPreview);
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error(
        error instanceof Error 
          ? error.message 
          : `Error al subir ${config.label.toLowerCase()}`
      );
      
      // Restaurar imagen anterior si había
      setPreviewUrl(currentImageUrl || null);
      URL.revokeObjectURL(localPreview);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [config, currentImageUrl, onImageUploaded]);

  /**
   * Configuración de react-dropzone
   */
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
      'image/heic': ['.heic'],
    },
    maxFiles: 1,
    maxSize: FILE_UPLOAD_CONFIG.maxSize,
    disabled: isUploading,
  });

  /**
   * Remover imagen
   */
  const handleRemove = () => {
    setPreviewUrl(null);
    if (onImageRemoved) {
      onImageRemoved();
    }
    toast.success(`${config.label} eliminada`);
  };

  return (
    <div className={cn('space-y-3', className)}>
      {/* Label */}
      <div>
        <label className="text-sm font-medium">
          {config.label}
        </label>
        <p className="text-xs text-muted-foreground mt-1">
          {config.description}
        </p>
      </div>

      {/* Preview / Upload Area */}
      <div
        {...getRootProps()}
        className={cn(
          'relative overflow-hidden rounded-lg border-2 border-dashed transition-colors cursor-pointer',
          config.aspectRatio,
          config.maxHeight,
          isDragActive && 'border-primary bg-primary/5',
          !isDragActive && 'border-border hover:border-primary/50',
          isUploading && 'pointer-events-none opacity-60'
        )}
      >
        <input {...getInputProps()} />

        {/* Preview de imagen */}
        {previewUrl ? (
          <div className="relative w-full h-full group">
            <Image
              src={previewUrl}
              alt={config.label}
              fill
              className={cn(
                'object-cover',
                type === 'avatar' && 'rounded-full p-4'
              )}
            />
            
            {/* Overlay con botón de eliminar */}
            {!isUploading && (
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove();
                  }}
                >
                  <X className="h-4 w-4 mr-1" />
                  Eliminar
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                >
                  <Upload className="h-4 w-4 mr-1" />
                  Cambiar
                </Button>
              </div>
            )}
          </div>
        ) : (
          // Estado vacío - mostrar área de drop
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
            <div className={cn(
              "rounded-full p-3 mb-3",
              isDragActive ? "bg-primary/10" : "bg-muted"
            )}>
              <ImageIcon className={cn(
                "h-8 w-8",
                isDragActive ? "text-primary" : "text-muted-foreground"
              )} />
            </div>
            <p className="text-sm font-medium mb-1">
              {isDragActive ? (
                'Suelta la imagen aquí'
              ) : (
                'Click o arrastra una imagen'
              )}
            </p>
            <p className="text-xs text-muted-foreground">
              JPG, PNG o WEBP (máx. 10MB)
            </p>
          </div>
        )}

        {/* Loading overlay */}
        {isUploading && (
          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 text-white animate-spin mb-2" />
            <p className="text-sm text-white font-medium">
              Subiendo... {uploadProgress}%
            </p>
          </div>
        )}
      </div>

      {/* Ayuda adicional */}
      <p className="text-xs text-muted-foreground">
        Formatos: JPG, PNG, WEBP • Tamaño máximo: 10MB
      </p>
    </div>
  );
}

