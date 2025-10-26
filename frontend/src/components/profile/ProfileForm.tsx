/**
 * ProfileForm Component
 * 
 * Formulario completo para editar perfil de artista.
 * 
 * Secciones:
 * 1. Imágenes (avatar + cover)
 * 2. Información básica (nombre, bio, craft, location)
 * 3. Redes sociales (instagram, website, phone)
 * 
 * Features:
 * - Validación con Zod
 * - React Hook Form
 * - Auto-save indication
 * - Error handling
 * - Success feedback
 */

'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Eye, X, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProfileImageUpload } from './ProfileImageUpload';
import { CRAFT_TYPE_LABELS, LOCATION_LABELS } from '@/types/artisan';
import type { Artisan, CraftType, Location } from '@/types/artisan';
import { useUpdateArtisanProfile } from '@/lib/hooks/useArtisans';

/**
 * Schema de validación con Zod
 */
const profileFormSchema = z.object({
  display_name: z
    .string()
    .min(3, 'Mínimo 3 caracteres')
    .max(150, 'Máximo 150 caracteres'),
  
  bio: z
    .string()
    .max(2000, 'Máximo 2000 caracteres')
    .optional()
    .or(z.literal('')),
  
  craft_type: z.enum([
    'ceramics',
    'jewelry',
    'leather',
    'textiles',
    'wood',
    'glass',
    'other',
  ] as const),
  
  location: z.enum([
    'mao',
    'ciutadella',
    'alaior',
    'es_castell',
    'ferreries',
    'es_mercadal',
    'es_migjorn',
    'sant_lluis',
    'other',
  ] as const),
  
  instagram: z
    .string()
    .max(100, 'Máximo 100 caracteres')
    .optional()
    .or(z.literal('')),
  
  website: z
    .string()
    .url('URL inválida')
    .optional()
    .or(z.literal('')),
  
  phone: z
    .string()
    .max(20, 'Máximo 20 caracteres')
    .optional()
    .or(z.literal('')),
  
  // Imágenes (manejadas por separado)
  avatar: z.string().nullable().optional(),
  cover_image: z.string().nullable().optional(),
});

type ProfileFormData = z.infer<typeof profileFormSchema>;

interface ProfileFormProps {
  /** Datos actuales del artesano */
  artisan: Artisan;
  
  /** Callback al guardar exitosamente */
  onSuccess?: () => void;
  
  /** Callback al cancelar */
  onCancel?: () => void;
}

export function ProfileForm({ artisan, onSuccess, onCancel }: ProfileFormProps) {
  const updateProfile = useUpdateArtisanProfile();

  // Inicializar formulario con datos actuales
  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      display_name: artisan.display_name,
      bio: artisan.bio || '',
      craft_type: artisan.craft_type as CraftType,
      location: artisan.location as Location,
      instagram: artisan.instagram || '',
      website: artisan.website || '',
      phone: '', // El backend no devuelve phone en el serializer actual
      avatar: artisan.avatar,
      cover_image: artisan.cover_image,
    },
  });

  /**
   * Actualizar formulario cuando cambien los datos del artesano
   * Esto permite que las imágenes se actualicen después de guardar
   */
  useEffect(() => {
    form.reset({
      display_name: artisan.display_name,
      bio: artisan.bio || '',
      craft_type: artisan.craft_type as CraftType,
      location: artisan.location as Location,
      instagram: artisan.instagram || '',
      website: artisan.website || '',
      phone: '',
      avatar: artisan.avatar,
      cover_image: artisan.cover_image,
    });
  }, [artisan, form]);

  /**
   * Manejar submit del formulario
   */
  const onSubmit = async (data: ProfileFormData) => {
    try {
      // Preparar datos para la API (eliminar campos vacíos)
      const payload = {
        display_name: data.display_name,
        bio: data.bio || undefined,
        craft_type: data.craft_type,
        location: data.location,
        instagram: data.instagram || undefined,
        website: data.website || undefined,
        phone: data.phone || undefined,
        // ✅ Incluir imágenes en el payload
        avatar: data.avatar || undefined,
        cover_image: data.cover_image || undefined,
      };

      await updateProfile.mutateAsync(payload);
      
      // Ejecutar callback de éxito si existe
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      // El hook ya maneja el toast de error automáticamente
      console.error('Error updating profile:', error);
    }
  };

  const isSubmitting = updateProfile.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        
        {/* SECCIÓN 1: IMÁGENES */}
        <Card>
          <CardHeader>
            <CardTitle>Imágenes del perfil</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Avatar - 1 columna en desktop */}
              <div className="lg:col-span-1">
                <ProfileImageUpload
                  type="avatar"
                  currentImageUrl={form.watch('avatar')}
                  onImageUploaded={(url) => {
                    form.setValue('avatar', url);
                  }}
                  onImageRemoved={() => {
                    form.setValue('avatar', null);
                  }}
                />
              </div>

              {/* Cover Image - 2 columnas en desktop */}
              <div className="lg:col-span-2">
                <ProfileImageUpload
                  type="cover"
                  currentImageUrl={form.watch('cover_image')}
                  onImageUploaded={(url) => {
                    form.setValue('cover_image', url);
                  }}
                  onImageRemoved={() => {
                    form.setValue('cover_image', null);
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SECCIÓN 2: INFORMACIÓN BÁSICA */}
        <Card>
          <CardHeader>
            <CardTitle>Información básica</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            
            {/* Display Name */}
            <FormField
              control={form.control}
              name="display_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre público *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="María García - Cerámica Artesanal"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Este es el nombre que aparecerá en tu perfil público
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Bio */}
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Biografía</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Cuéntanos sobre ti, tu trabajo y tu taller..."
                      className="min-h-[120px] resize-none"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {field.value?.length || 0} / 2000 caracteres
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Craft Type y Location - Grid 2 columnas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Craft Type */}
              <FormField
                control={form.control}
                name="craft_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Especialidad *</FormLabel>
                    <Select
                      disabled={isSubmitting}
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona tu especialidad" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(CRAFT_TYPE_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Location */}
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ubicación *</FormLabel>
                    <Select
                      disabled={isSubmitting}
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona tu ubicación" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(LOCATION_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* SECCIÓN 3: REDES SOCIALES */}
        <Card>
          <CardHeader>
            <CardTitle>Redes sociales y contacto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            
            {/* Instagram */}
            <FormField
              control={form.control}
              name="instagram"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instagram</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">@</span>
                      <Input
                        placeholder="tu_usuario"
                        disabled={isSubmitting}
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Solo el nombre de usuario, sin @ ni URL
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Website */}
            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sitio web</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder="https://tu-sitio-web.com"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Phone */}
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teléfono</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="+34 971 123 456"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Opcional. Aparecerá en tu perfil público.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* BOTONES DE ACCIÓN */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
          )}
          
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              window.open(`/artesanos/${artisan.slug}`, '_blank');
            }}
            disabled={isSubmitting}
          >
            <Eye className="h-4 w-4 mr-2" />
            Ver perfil público
          </Button>
          
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Guardar cambios
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}

