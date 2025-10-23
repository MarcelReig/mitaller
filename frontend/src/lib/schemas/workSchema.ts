/**
 * Work Form Schema - Validación con Zod
 * 
 * Define las reglas de validación para crear/editar obras:
 * - Título: requerido, 3-200 caracteres
 * - Descripción: opcional, max 2000 caracteres
 * - Categoría: opcional, enum de categorías válidas
 * - Imágenes: mínimo 1, máximo 20
 * - Featured: boolean
 */

import { z } from 'zod';

/**
 * Categorías válidas de obras
 */
export const WORK_CATEGORIES = [
  'ceramics',
  'painting',
  'sculpture',
  'jewelry',
  'textile',
  'wood',
  'glass',
  'metal',
  'other',
] as const;

/**
 * Labels en español para las categorías
 */
export const WORK_CATEGORY_LABELS: Record<typeof WORK_CATEGORIES[number], string> = {
  ceramics: 'Cerámica',
  painting: 'Pintura',
  sculpture: 'Escultura',
  jewelry: 'Joyería',
  textile: 'Textil',
  wood: 'Madera',
  glass: 'Vidrio',
  metal: 'Metal',
  other: 'Otro',
};

/**
 * Schema para una imagen individual
 */
const imageSchema = z.object({
  url: z.string().url('URL inválida').min(1, 'URL no puede estar vacía'),
  publicId: z.string().optional(), // Cloudinary public_id
  isUploading: z.boolean().optional(), // Estado de upload
});

/**
 * Schema principal del formulario de obra
 */
export const workFormSchema = z.object({
  title: z
    .string()
    .min(3, 'El título debe tener al menos 3 caracteres')
    .max(200, 'El título no puede exceder 200 caracteres')
    .trim(),
  
  description: z
    .string()
    .max(2000, 'La descripción no puede exceder 2000 caracteres')
    .trim()
    .optional()
    .or(z.literal('')),
  
  category: z
    .enum(WORK_CATEGORIES)
    .optional()
    .nullable(),
  
  is_featured: z
    .boolean()
    .catch(false),
  
  images: z
    .array(imageSchema)
    .min(1, 'Debes subir al menos una imagen')
    .max(20, 'Máximo 20 imágenes por obra'),
});

/**
 * Tipo inferido del schema
 */
export type WorkFormData = z.infer<typeof workFormSchema>;

/**
 * Tipo para una imagen
 */
export type WorkImage = z.infer<typeof imageSchema>;

/**
 * Valores por defecto del formulario
 */
export const defaultWorkFormValues: Partial<WorkFormData> = {
  title: '',
  description: '',
  category: null,
  is_featured: false,
  images: [],
};

