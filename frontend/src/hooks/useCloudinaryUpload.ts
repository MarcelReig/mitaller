/**
 * useCloudinaryUpload Hook
 * 
 * Hook para manejar upload de imágenes a Cloudinary con:
 * - Progress tracking por archivo
 * - Estados de loading y error
 * - Upload múltiple
 * - Cancelación (TODO)
 */

'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import {
  uploadToCloudinary,
  validateFile,
  type CloudinaryUploadResult,
  type UploadOptions,
} from '@/lib/cloudinary/upload';

/**
 * Estado de un archivo siendo subido
 */
export interface UploadingFile {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  result?: CloudinaryUploadResult;
  error?: string;
}

/**
 * Hook para upload de imágenes
 */
export function useCloudinaryUpload() {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  /**
   * Subir un archivo
   */
  const uploadFile = useCallback(
    async (
      file: File,
      options: UploadOptions = {}
    ): Promise<CloudinaryUploadResult | null> => {
      // Validar archivo
      const validation = validateFile(file);
      if (!validation.valid) {
        toast.error(validation.error);
        return null;
      }

      // Añadir a lista de uploading
      const uploadingFile: UploadingFile = {
        file,
        progress: 0,
        status: 'pending',
      };

      setUploadingFiles((prev) => [...prev, uploadingFile]);
      setIsUploading(true);

      try {
        // Update status
        setUploadingFiles((prev) =>
          prev.map((f) =>
            f.file === file ? { ...f, status: 'uploading' as const } : f
          )
        );

        // Upload
        const result = await uploadToCloudinary(file, {
          ...options,
          onProgress: (progress) => {
            setUploadingFiles((prev) =>
              prev.map((f) => (f.file === file ? { ...f, progress } : f))
            );
          },
        });

        // Success
        setUploadingFiles((prev) =>
          prev.map((f) =>
            f.file === file
              ? { ...f, status: 'success' as const, result, progress: 100 }
              : f
          )
        );

        return result;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Error al subir imagen';

        // Error
        setUploadingFiles((prev) =>
          prev.map((f) =>
            f.file === file
              ? { ...f, status: 'error' as const, error: errorMessage }
              : f
          )
        );

        toast.error(errorMessage);
        return null;
      } finally {
        setIsUploading(false);
      }
    },
    []
  );

  /**
   * Subir múltiples archivos
   */
  const uploadFiles = useCallback(
    async (
      files: File[],
      options: UploadOptions = {}
    ): Promise<CloudinaryUploadResult[]> => {
      setIsUploading(true);

      try {
        const results = await Promise.all(
          files.map((file) => uploadFile(file, options))
        );

        // Filtrar nulls (archivos que fallaron)
        return results.filter(
          (result): result is CloudinaryUploadResult => result !== null
        );
      } finally {
        setIsUploading(false);
      }
    },
    [uploadFile]
  );

  /**
   * Limpiar lista de uploads
   */
  const clearUploads = useCallback(() => {
    setUploadingFiles([]);
  }, []);

  return {
    uploadFile,
    uploadFiles,
    uploadingFiles,
    isUploading,
    clearUploads,
  };
}

