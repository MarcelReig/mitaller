/**
 * ImageGalleryEditor Component
 * 
 * Editor visual de galería con:
 * - Grid de thumbnails
 * - Drag & drop para reordenar
 * - Eliminar imágenes
 * - Indicador de portada (primera imagen)
 */

'use client';

import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SafeNextImage } from '@/components/ui/SafeNextImage';
import { cn } from '@/lib/utils';
import type { WorkImage } from '@/lib/schemas/workSchema';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ImageGalleryEditorProps {
  images: WorkImage[];
  onChange: (images: WorkImage[]) => void;
  disabled?: boolean;
}

export function ImageGalleryEditor({
  images,
  onChange,
  disabled = false,
}: ImageGalleryEditorProps) {
  const [imageToDelete, setImageToDelete] = useState<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = images.findIndex((_, i) => i === active.id);
    const newIndex = images.findIndex((_, i) => i === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    onChange(arrayMove(images, oldIndex, newIndex));
  };

  const handleDelete = () => {
    if (imageToDelete === null) return;
    
    const newImages = images.filter((_, index) => index !== imageToDelete);
    onChange(newImages);
    setImageToDelete(null);
  };

  if (images.length === 0) {
    return null;
  }

  return (
    <>
      <div className="space-y-4">
        
        {/* Info */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Arrastra para reordenar • La primera es la portada
          </p>
        </div>

        {/* Grid con drag & drop */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={images.map((_, index) => index)}
            strategy={rectSortingStrategy}
            disabled={disabled}
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {images.map((image, index) => (
                <SortableImageItem
                  key={`${image.url}-${index}`}
                  image={image}
                  index={index}
                  isFirst={index === 0}
                  onDelete={() => setImageToDelete(index)}
                  disabled={disabled}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
        
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog
        open={imageToDelete !== null}
        onOpenChange={() => setImageToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar imagen?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La imagen será eliminada de la obra.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

/**
 * Item individual sortable
 */
interface SortableImageItemProps {
  image: WorkImage;
  index: number;
  isFirst: boolean;
  onDelete: () => void;
  disabled?: boolean;
}

function SortableImageItem({
  image,
  index,
  isFirst,
  onDelete,
  disabled,
}: SortableImageItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: index, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative aspect-square rounded-lg overflow-hidden border-2 bg-muted',
        isDragging && 'ring-2 ring-primary shadow-lg',
        isFirst && 'border-primary'
      )}
    >
      {/* Imagen */}
      <SafeNextImage
        src={image.url || null}
        alt={`Imagen ${index + 1}`}
        fill
        className="object-cover"
        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
        fallbackType="artwork"
        fallbackId={index}
        fallbackSize="thumbnail"
      />

      {/* Overlay con controles */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity">
        
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          className={cn(
            'absolute top-2 left-2 p-1.5 rounded bg-black/50 text-white',
            'cursor-grab active:cursor-grabbing',
            'hover:bg-black/70 transition-colors',
            disabled && 'cursor-not-allowed opacity-50'
          )}
          disabled={disabled}
        >
          <GripVertical className="h-4 w-4" />
        </button>

        {/* Portada badge */}
        {isFirst && (
          <div className="absolute top-2 right-2 px-2 py-1 rounded bg-primary text-primary-foreground text-xs font-semibold flex items-center gap-1">
            <Star className="h-3 w-3 fill-current" />
            Portada
          </div>
        )}

        {/* Delete button */}
        <Button
          size="sm"
          variant="destructive"
          className="absolute bottom-2 right-2 h-8 w-8 p-0"
          onClick={onDelete}
          disabled={disabled}
        >
          <X className="h-4 w-4" />
        </Button>
        
      </div>
    </div>
  );
}

