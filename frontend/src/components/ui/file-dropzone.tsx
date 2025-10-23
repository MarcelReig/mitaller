/**
 * FileDropzone Component
 * 
 * Zona de drag & drop para subir archivos con:
 * - Drag & drop visual feedback
 * - Click para seleccionar
 * - Validación de archivos
 * - Preview de archivos seleccionados
 */

'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, FileImage } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FILE_UPLOAD_CONFIG } from '@/lib/cloudinary/upload';

interface FileDropzoneProps {
  onFilesSelected: (files: File[]) => void;
  maxFiles?: number;
  disabled?: boolean;
  className?: string;
}

export function FileDropzone({
  onFilesSelected,
  maxFiles = FILE_UPLOAD_CONFIG.maxFiles,
  disabled = false,
  className,
}: FileDropzoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFilesSelected(acceptedFiles);
      }
    },
    [onFilesSelected]
  );

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragReject,
    fileRejections,
  } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
      'image/heic': ['.heic'],
    },
    maxSize: FILE_UPLOAD_CONFIG.maxSize,
    maxFiles,
    disabled,
    multiple: maxFiles > 1,
  });

  return (
    <div className={cn('space-y-4', className)}>
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={cn(
          'relative border-2 border-dashed rounded-lg p-8 transition-colors cursor-pointer',
          'hover:border-primary hover:bg-muted/50',
          isDragActive && 'border-primary bg-muted/50',
          isDragReject && 'border-destructive bg-destructive/10',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <div className={cn(
            'rounded-full p-4',
            isDragActive ? 'bg-primary/10' : 'bg-muted'
          )}>
            {isDragActive ? (
              <Upload className="h-8 w-8 text-primary" />
            ) : (
              <FileImage className="h-8 w-8 text-muted-foreground" />
            )}
          </div>
          
          <div className="space-y-2">
            {isDragActive ? (
              <p className="text-lg font-medium text-primary">
                Suelta las imágenes aquí
              </p>
            ) : (
              <>
                <p className="text-lg font-medium">
                  Arrastra imágenes aquí
                </p>
                <p className="text-sm text-muted-foreground">
                  o haz click para seleccionar
                </p>
              </>
            )}
            
            <p className="text-xs text-muted-foreground">
              JPG, PNG, WEBP, HEIC • Máx {maxFiles} imágenes • Máx 10MB cada una
            </p>
          </div>
        </div>
      </div>

      {/* Errores de validación */}
      {fileRejections.length > 0 && (
        <div className="space-y-2">
          {fileRejections.map(({ file, errors }) => (
            <div
              key={file.name}
              className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg"
            >
              <X className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
              <div className="flex-1 text-sm">
                <p className="font-medium text-destructive">{file.name}</p>
                {errors.map((error) => (
                  <p key={error.code} className="text-destructive/80">
                    {error.code === 'file-too-large'
                      ? 'Archivo muy grande (máx 10MB)'
                      : error.code === 'file-invalid-type'
                      ? 'Formato no válido'
                      : error.message}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

