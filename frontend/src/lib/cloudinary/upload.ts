/**
 * Cloudinary Upload Helper
 * 
 * Funciones para subir imágenes a Cloudinary desde el cliente.
 * - Upload directo (no pasa por backend)
 * - Progress tracking
 * - Error handling
 * - Validación de archivos
 */

import { getToken } from '@/lib/axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Interfaz para la respuesta de signature del backend
 */

interface SignatureResponse {
  signature: string;
  timestamp: number;
  api_key: string;
  cloud_name: string;
  upload_preset: string;
  folder: string;
  transformation: string;
}

/**
 * Solicitar signature al backend
 */
async function getUploadSignature(folder: string = 'mitaller'): Promise<SignatureResponse> {
  const token = getToken(); // Usar helper de axios que lee de cookies
  
  if (!token) {
    throw new Error('No estás autenticado. Por favor inicia sesión.');
  }

  const response = await fetch(`${API_URL}/api/v1/works/cloudinary/signature/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ folder }),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Sesión expirada. Por favor inicia sesión de nuevo.');
    }
    throw new Error('Error al obtener firma de upload');
  }

  return response.json();
}

/**
 * Configuración de validación de archivos
 */
export const FILE_UPLOAD_CONFIG = {
  maxSize: 10 * 1024 * 1024, // 10MB
  acceptedFormats: ['image/jpeg', 'image/png', 'image/webp', 'image/heic'],
  acceptedExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.heic'],
  maxFiles: 20,
} as const;

/**
 * Resultado del upload
 */
export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
  secureUrl: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
}

/**
 * Opciones de upload
 */
export interface UploadOptions {
  folder?: string;
  onProgress?: (progress: number) => void;
  transformation?: string;
}

/**
 * Validar archivo antes de subir
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
  // Validar tamaño
  if (file.size > FILE_UPLOAD_CONFIG.maxSize) {
    return {
      valid: false,
      error: `El archivo "${file.name}" excede el tamaño máximo de 10MB`,
    };
  }

  // Validar formato
  const acceptedFormats: string[] = [...FILE_UPLOAD_CONFIG.acceptedFormats];
  if (!acceptedFormats.includes(file.type)) {
    return {
      valid: false,
      error: `El archivo "${file.name}" no es un formato válido. Usa JPG, PNG o WEBP`,
    };
  }

  return { valid: true };
}

/**
 * Subir archivo a Cloudinary
 */
export async function uploadToCloudinary(
  file: File,
  options: UploadOptions = {}
): Promise<CloudinaryUploadResult> {
  const { folder = 'mitaller', onProgress } = options;

  // Validar archivo
  const validation = validateFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // Solicitar signature al backend
  const signatureData = await getUploadSignature(folder);

  // Crear FormData con signed upload
  // Incluir parámetros firmados: timestamp, folder, upload_preset, transformation
  // Más: file, signature, api_key (requeridos por Cloudinary)
  const formData = new FormData();
  formData.append('file', file);
  formData.append('signature', signatureData.signature);
  formData.append('timestamp', signatureData.timestamp.toString());
  formData.append('api_key', signatureData.api_key);
  formData.append('upload_preset', signatureData.upload_preset);
  formData.append('folder', signatureData.folder);
  formData.append('transformation', signatureData.transformation);
  
  // URL de Cloudinary con el cloud_name del backend
  const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${signatureData.cloud_name}/image/upload`;

  // XMLHttpRequest para track progress
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // Progress handler
    if (onProgress) {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          onProgress(progress);
        }
      });
    }

    // Success handler
    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve({
            url: response.url,
            publicId: response.public_id,
            secureUrl: response.secure_url,
            format: response.format,
            width: response.width,
            height: response.height,
            bytes: response.bytes,
          });
        } catch {
          reject(new Error('Error al procesar respuesta de Cloudinary'));
        }
      } else {
        // Parsear error de Cloudinary
        let errorMessage = xhr.statusText;
        try {
          const errorResponse = JSON.parse(xhr.responseText);
          console.error('Cloudinary upload error:', {
            status: xhr.status,
            error: errorResponse
          });
          errorMessage = errorResponse.error?.message || errorMessage;
        } catch {
          console.error('Cloudinary upload failed:', xhr.status, xhr.responseText);
        }
        reject(new Error(`Error al subir imagen (${xhr.status}): ${errorMessage}`));
      }
    });

    // Error handler
    xhr.addEventListener('error', () => {
      reject(new Error('Error de red al subir imagen'));
    });

    // Timeout handler
    xhr.addEventListener('timeout', () => {
      reject(new Error('Tiempo de espera agotado al subir imagen'));
    });

    // Configurar y enviar
    xhr.open('POST', cloudinaryUrl);
    xhr.timeout = 60000; // 60 segundos
    xhr.send(formData);
  });
}

/**
 * Subir múltiples archivos en paralelo
 */
export async function uploadMultipleToCloudinary(
  files: File[],
  options: UploadOptions = {}
): Promise<CloudinaryUploadResult[]> {
  if (files.length > FILE_UPLOAD_CONFIG.maxFiles) {
    throw new Error(`Máximo ${FILE_UPLOAD_CONFIG.maxFiles} archivos permitidos`);
  }

  // Subir todos en paralelo
  const uploadPromises = files.map((file) => uploadToCloudinary(file, options));

  return Promise.all(uploadPromises);
}

/**
 * Obtener URL con transformaciones de Cloudinary
 * Nota: Esta función requiere el cloud_name. Para usarla con signed uploads,
 * necesitas pasar el cloud_name como parámetro.
 */
export function getTransformedUrl(
  cloudName: string,
  publicId: string,
  transformation: string
): string {
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformation}/${publicId}`;
}

/**
 * Transformaciones comunes
 */
export const CLOUDINARY_TRANSFORMATIONS = {
  thumbnail: 'w_400,h_400,c_fill,q_auto:eco,f_auto',
  medium: 'w_800,h_600,c_fill,q_auto:good,f_auto',
  large: 'w_1200,q_auto:good,f_auto',
} as const;

