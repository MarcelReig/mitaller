/**
 * WorkForm Component
 * 
 * Formulario completo para crear/editar obras con:
 * - React Hook Form + Zod validation
 * - Upload de imágenes a Cloudinary
 * - Drag & drop para reordenar
 * - Estados de loading/error
 * - Optimistic updates
 */

'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import {
  workFormSchema,
  defaultWorkFormValues,
  WORK_CATEGORIES,
  WORK_CATEGORY_LABELS,
  type WorkFormData,
} from '@/lib/schemas/workSchema';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ImageUploader } from '@/components/works/ImageUploader';
import { ImageGalleryEditor } from '@/components/works/ImageGalleryEditor';
import { Separator } from '@/components/ui/separator';

interface WorkFormProps {
  initialData?: Partial<WorkFormData>;
  mode: 'create' | 'edit';
  onSubmit: (data: WorkFormData) => Promise<void>;
}

export function WorkForm({
  initialData,
  mode,
  onSubmit,
}: WorkFormProps) {
  const router = useRouter();

  const form = useForm<WorkFormData>({
    resolver: zodResolver(workFormSchema),
    defaultValues: {
      ...defaultWorkFormValues,
      ...initialData,
    },
  });

  const {
    formState: { isSubmitting, errors },
    watch,
  } = form;

  const images = watch('images');

  const handleSubmit = async (data: WorkFormData) => {
    try {
      await onSubmit(data);
      
      toast.success(
        mode === 'create'
          ? 'Obra creada correctamente'
          : 'Obra actualizada correctamente'
      );

      router.push('/dashboard/obras');
      router.refresh();
    } catch (error) {
      console.error('Error submitting work:', error);
      toast.error(
        mode === 'create'
          ? 'Error al crear la obra'
          : 'Error al actualizar la obra'
      );
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        
        <div>
          <h1 className="text-3xl font-bold">
            {mode === 'create' ? 'Nueva Obra' : 'Editar Obra'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {mode === 'create'
              ? 'Crea una nueva obra para tu portfolio'
              : 'Modifica los detalles de tu obra'}
          </p>
        </div>
      </div>

      <Separator />

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
          
          {/* Información básica */}
          <Card>
            <CardHeader>
              <CardTitle>Información Básica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Título */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Título <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej: Cerámica azul mediterránea"
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Nombre descriptivo de tu obra
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Descripción */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe tu obra, técnicas utilizadas, inspiración..."
                        rows={5}
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Cuéntale a tus visitantes sobre esta obra (opcional)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Grid 2 columnas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Categoría */}
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoría</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value || undefined}
                        disabled={isSubmitting}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar categoría" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {WORK_CATEGORIES.map((category) => (
                            <SelectItem key={category} value={category}>
                              {WORK_CATEGORY_LABELS[category]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Tipo de obra (opcional)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Featured */}
                <FormField
                  control={form.control}
                  name="is_featured"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Destacar obra</FormLabel>
                        <FormDescription>
                          Se mostrará en posición destacada en tu portfolio
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                
              </div>
              
            </CardContent>
          </Card>

          {/* Imágenes */}
          <Card>
            <CardHeader>
              <CardTitle>
                Imágenes <span className="text-destructive">*</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Upload */}
              <FormField
                control={form.control}
                name="images"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <ImageUploader
                        images={field.value}
                        onChange={field.onChange}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Gallery editor */}
              {images && images.length > 0 && (
                <FormField
                  control={form.control}
                  name="images"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <ImageGalleryEditor
                          images={field.value}
                          onChange={field.onChange}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}
              
            </CardContent>
          </Card>

          {/* Errors generales */}
          {Object.keys(errors).length > 0 && (
            <Card className="border-destructive">
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-destructive">
                    Por favor corrige los siguientes errores:
                  </p>
                  <ul className="list-disc list-inside text-sm text-destructive space-y-1">
                    {Object.entries(errors).map(([key, error]) => (
                      <li key={key}>{error.message}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {mode === 'create' ? 'Crear Obra' : 'Guardar Cambios'}
            </Button>
          </div>
          
        </form>
      </Form>
      
    </div>
  );
}
