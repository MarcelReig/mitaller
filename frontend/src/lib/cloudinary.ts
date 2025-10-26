/**
 * Cloudinary Image Transformation Helpers
 * 
 * Similar a la configuración de Marina, pero adaptado para Next.js 15 y TypeScript.
 * 
 * CONFIGURACIÓN REQUERIDA:
 * Añade estas variables a tu archivo .env.local:
 * 
 * ```
 * NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=tu-cloud-name
 * NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=tu-upload-preset
 * ```
 * 
 * NOTAS:
 * - Las transformaciones se aplican directamente en las URLs de Cloudinary
 * - Formato: /upload/transformation_params/image_path
 * - Optimización automática: f_auto (formato), q_auto (calidad), dpr_auto (densidad pixel)
 */

/**
 * Parámetros de transformación de Cloudinary
 */
export interface CloudinaryTransformParams {
  w?: number;       // width
  h?: number;       // height
  c?: string;       // crop mode: 'fill', 'limit', 'fit', 'scale', etc.
  g?: string;       // gravity: 'auto', 'center', 'face', etc.
  q?: string;       // quality: 'auto', 'auto:eco', 'auto:good', 'auto:best', o número
  f?: string;       // format: 'auto', 'webp', 'jpg', 'png'
  dpr?: string;     // device pixel ratio: 'auto' o número
  a?: string;       // angle/rotation: 'auto' para orientación automática
  e?: string;       // effects: 'blur:300', 'grayscale', etc.
}

/**
 * Aplica transformaciones a una URL de Cloudinary
 * 
 * @param url - URL original de Cloudinary
 * @param params - Parámetros de transformación
 * @returns URL transformada o URL original si no es válida
 * 
 * @example
 * ```ts
 * transformImageUrl(url, { 
 *   w: 800, 
 *   h: 600, 
 *   c: 'fill', 
 *   q: 'auto:good' 
 * })
 * // Returns: .../upload/w_800,h_600,c_fill,q_auto:good,f_auto,dpr_auto/.../image.jpg
 * ```
 */
export function transformImageUrl(
  url: string | null | undefined,
  params: CloudinaryTransformParams = {}
): string {
  // Validaciones básicas
  if (!url || typeof url !== 'string') {
    return url || '';
  }

  // Buscar el marcador /upload/ en la URL
  const uploadMarker = '/upload/';
  const idx = url.indexOf(uploadMarker);
  
  // Si no es una URL de Cloudinary válida, retornar sin cambios
  if (idx === -1) {
    return url;
  }

  try {
    // Defaults: optimización automática de formato, calidad y DPR
    const defaults: CloudinaryTransformParams = {
      f: 'auto',
      q: 'auto',
      dpr: 'auto',
    };

    // Combinar defaults con params personalizados
    const finalParams = { ...defaults, ...params };

    // Orden de los parámetros (importante para Cloudinary)
    // a_auto debe ir primero para orientación correcta
    const paramOrder: (keyof CloudinaryTransformParams)[] = [
      'a', 'f', 'q', 'dpr', 'c', 'g', 'w', 'h', 'e'
    ];

    // Construir string de transformación
    const transformParts: string[] = [];
    
    for (const key of paramOrder) {
      const value = finalParams[key];
      if (value !== undefined && value !== null && value !== '') {
        transformParts.push(`${key}_${value}`);
      }
    }

    const transformation = transformParts.join(',');
    
    // Si no hay transformación, retornar URL original
    if (!transformation) {
      return url;
    }

    // Insertar transformación en la URL
    return url.replace(uploadMarker, `${uploadMarker}${transformation}/`);
  } catch (error) {
    console.error('Error aplicando transformación de Cloudinary:', error);
    return url;
  }
}

/**
 * URL optimizada para thumbnails/previews (grids, cards)
 * Crop: fill (rellena espacio cortando imagen)
 * Gravity: auto (enfoca en lo importante)
 * Tamaño: 600x600px
 * Calidad: eco (optimizada para previews)
 * 
 * @example
 * ```ts
 * <Image src={thumbUrl(work.thumbnail_url)} alt="..." />
 * ```
 */
export function thumbUrl(url: string | null | undefined): string {
  return transformImageUrl(url, {
    c: 'fill',
    g: 'auto',
    w: 600,
    h: 600,
    q: 'auto:eco',
  });
}

/**
 * URL optimizada para imágenes de portada (hero, headers)
 * Similar a thumbUrl pero sin rotación automática
 * 
 * @example
 * ```ts
 * <Image src={coverUrl(artisan.cover_image)} alt="..." />
 * ```
 */
export function coverUrl(url: string | null | undefined): string {
  return transformImageUrl(url, {
    c: 'fill',
    g: 'auto',
    w: 600,
    h: 600,
    q: 'auto:eco',
  });
}

/**
 * URL optimizada para avatares (circular, small)
 * Crop: fill con gravity face
 * Tamaño: 200x200px
 * 
 * @example
 * ```ts
 * <Image src={avatarUrl(artisan.avatar)} alt="..." />
 * ```
 */
export function avatarUrl(url: string | null | undefined): string {
  return transformImageUrl(url, {
    c: 'fill',
    g: 'face',
    w: 200,
    h: 200,
    q: 'auto:good',
  });
}

/**
 * URL optimizada para galerías/lightbox (alta calidad)
 * Crop: limit (mantiene proporciones, no corta)
 * Ancho máximo: 1600px
 * Calidad: good (alta calidad para zoom)
 * 
 * @example
 * ```ts
 * <Image src={galleryUrl(work.images[0])} alt="..." />
 * ```
 */
export function galleryUrl(url: string | null | undefined): string {
  return transformImageUrl(url, {
    c: 'limit',
    w: 1600,
    q: 'auto:good',
  });
}

/**
 * Sube una imagen a Cloudinary
 * 
 * NOTA: Requiere configuración previa en Cloudinary:
 * 1. Crear un upload preset (Settings > Upload)
 * 2. Configurar el preset como "unsigned" para upload desde cliente
 * 3. Configurar folder y transformaciones por defecto
 * 
 * @param file - Archivo a subir
 * @param options - Opciones de upload
 * @returns URL segura de la imagen subida
 * 
 * @example
 * ```ts
 * const url = await uploadToCloudinary(file, {
 *   preset: 'mitaller_works',
 *   folder: 'works/juan-ceramista'
 * });
 * ```
 */
export async function uploadToCloudinary(
  file: File,
  options: {
    preset?: string;
    folder?: string;
  } = {}
): Promise<string> {
  // Obtener cloud name de variables de entorno
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  
  if (!cloudName) {
    throw new Error(
      'NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME no está configurado en .env.local'
    );
  }

  // Preset por defecto o personalizado
  const preset = options.preset || process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  
  if (!preset) {
    throw new Error(
      'Upload preset no especificado. Proporciona options.preset o configura NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET'
    );
  }

  // Construir endpoint de Cloudinary
  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/upload`;

  // Crear FormData con el archivo
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', preset);
  
  if (options.folder) {
    formData.append('folder', options.folder);
  }

  try {
    // Subir a Cloudinary
    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Error desconocido');
      throw new Error(
        `Error subiendo a Cloudinary: ${response.status} - ${errorText}`
      );
    }

    // Parsear respuesta
    const data = await response.json();
    
    // Retornar URL segura (https)
    return data.secure_url;
  } catch (error) {
    console.error('Error en upload a Cloudinary:', error);
    throw error;
  }
}

/**
 * Utilidad para Next.js Image component
 * Genera props optimizados para <Image> con transformaciones Cloudinary
 * 
 * @example
 * ```tsx
 * <Image
 *   {...getImageProps(work.thumbnail_url, {
 *     width: 600,
 *     height: 600,
 *     alt: work.title
 *   })}
 * />
 * ```
 */
export function getImageProps(
  url: string | null | undefined,
  options: {
    width?: number;
    height?: number;
    quality?: string;
    alt: string;
  }
) {
  const transformedUrl = transformImageUrl(url, {
    w: options.width,
    h: options.height,
    q: options.quality || 'auto:good',
    c: 'fill',
    g: 'auto',
  });

  return {
    src: transformedUrl,
    alt: options.alt,
    width: options.width,
    height: options.height,
  };
}

