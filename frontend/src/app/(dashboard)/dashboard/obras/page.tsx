/**
 * WorkManager Page
 * 
 * Lista de todas las obras del artista con:
 * - Drag & drop para reordenar
 * - Búsqueda
 * - Acciones: editar, eliminar, preview
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { SafeNextImage } from '@/components/ui/SafeNextImage';
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
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  GripVertical,
  Eye,
  ImageIcon,
} from 'lucide-react';
import { useWorks, useDeleteWork, useReorderWorks } from '@/lib/hooks/useWorks';
import { thumbUrl } from '@/lib/cloudinary';
import type { Work } from '@/lib/api/works';
import { WORK_CATEGORY_LABELS } from '@/types/work';

export default function WorksPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [workToDelete, setWorkToDelete] = useState<Work | null>(null);
  
  const { data: works, isLoading, error } = useWorks();
  const deleteWorkMutation = useDeleteWork();
  const reorderMutation = useReorderWorks();
  
  // Drag & drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Requiere 8px de movimiento para activar drag
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  // Filtrar obras por búsqueda
  const filteredWorks = works?.filter(work =>
    work.title.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];
  
  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) return;
    
    const oldIndex = filteredWorks.findIndex(w => w.id === active.id);
    const newIndex = filteredWorks.findIndex(w => w.id === over.id);
    
    if (oldIndex === -1 || newIndex === -1) return;
    
    // Crear array reordenado
    const reordered = [...filteredWorks];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);
    
    // Enviar nuevo orden al backend
    const newOrder = reordered.map(w => w.id);
    reorderMutation.mutate(newOrder);
  };
  
  // Handle delete
  const handleDelete = () => {
    if (!workToDelete) return;
    
    deleteWorkMutation.mutate(workToDelete.id, {
      onSuccess: () => {
        setWorkToDelete(null);
      },
    });
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-muted animate-pulse rounded" />
            <div className="h-4 w-32 bg-muted animate-pulse rounded" />
          </div>
          <div className="h-10 w-32 bg-muted animate-pulse rounded" />
        </div>
        <div className="h-10 w-full max-w-md bg-muted animate-pulse rounded" />
        <div className="grid gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <h3 className="text-lg font-semibold text-destructive">
              Error al cargar obras
            </h3>
            <p className="text-muted-foreground">
              {error instanceof Error ? error.message : 'Error desconocido'}
            </p>
            <Button onClick={() => window.location.reload()}>
              Reintentar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Mis Obras</h1>
          <p className="text-muted-foreground mt-1">
            {works?.length || 0} {works?.length === 1 ? 'obra' : 'obras'} en tu portfolio
          </p>
        </div>
        
        <Button asChild size="lg">
          <Link href="/dashboard/obras/nueva">
            <Plus className="mr-2 h-5 w-5" />
            Nueva Obra
          </Link>
        </Button>
      </div>
      
      {/* Search */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar obras..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>
      
      {/* Empty state - No obras */}
      {filteredWorks.length === 0 && !searchQuery && works && works.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-primary/10 p-6 mb-4">
              <ImageIcon className="h-12 w-12 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No hay obras aún</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              Comienza a construir tu portfolio creando tu primera obra.
              Las obras aparecerán aquí y en tu portfolio público.
            </p>
            <Button asChild size="lg">
              <Link href="/dashboard/obras/nueva">
                <Plus className="mr-2 h-5 w-5" />
                Crear Primera Obra
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
      
      {/* Empty state - No results */}
      {filteredWorks.length === 0 && searchQuery && (
        <Card>
          <CardContent className="py-16 text-center">
            <p className="text-muted-foreground">
              No se encontraron obras con &ldquo;<strong>{searchQuery}</strong>&rdquo;
            </p>
            <Button 
              variant="ghost" 
              className="mt-4"
              onClick={() => setSearchQuery('')}
            >
              Limpiar búsqueda
            </Button>
          </CardContent>
        </Card>
      )}
      
      {/* Works list with drag & drop */}
      {filteredWorks.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={filteredWorks.map(w => w.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="grid gap-4">
              {filteredWorks.map((work) => (
                <SortableWorkCard
                  key={work.id}
                  work={work}
                  onDelete={() => setWorkToDelete(work)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
      
      {/* Delete confirmation dialog */}
      <AlertDialog open={!!workToDelete} onOpenChange={() => setWorkToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar obra?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La obra <strong>&ldquo;{workToDelete?.title}&rdquo;</strong> y 
              todas sus imágenes serán eliminadas permanentemente de tu portfolio.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteWorkMutation.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteWorkMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteWorkMutation.isPending ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
    </div>
  );
}

/**
 * SortableWorkCard - Card individual con drag handle
 */
interface SortableWorkCardProps {
  work: Work;
  onDelete: () => void;
}

function SortableWorkCard({ work, onDelete }: SortableWorkCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: work.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  
  return (
    <Card 
      ref={setNodeRef} 
      style={style} 
      className={isDragging ? 'shadow-lg ring-2 ring-primary' : ''}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          
          {/* Drag handle */}
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors p-2 -m-2 touch-none"
            aria-label="Reordenar obra"
          >
            <GripVertical className="h-5 w-5" />
          </button>
          
          {/* Thumbnail */}
          <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
            <SafeNextImage
              src={work.thumbnail_url ? thumbUrl(work.thumbnail_url) : null}
              alt={work.title}
              fill
              className="object-cover"
              sizes="80px"
              fallbackType="artwork"
              fallbackId={work.id}
              fallbackSize="thumbnail"
            />
          </div>
          
          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate text-lg">
              {work.title}
            </h3>
            <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1 flex-wrap">
              <span className="flex items-center gap-1">
                <ImageIcon className="h-4 w-4" />
                {work.total_images} {work.total_images === 1 ? 'imagen' : 'imágenes'}
              </span>
              
              {work.category && work.category in WORK_CATEGORY_LABELS && (
                <span className="px-2 py-0.5 bg-muted rounded-full text-xs font-medium">
                  {WORK_CATEGORY_LABELS[work.category as keyof typeof WORK_CATEGORY_LABELS]}
                </span>
              )}
              
              {work.is_featured && (
                <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-semibold">
                  ✨ Destacado
                </span>
              )}
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="sm"
              asChild
              title="Ver en portfolio público"
            >
              <Link 
                href={`/artesanos/${work.artist.slug}/obras/${work.id}`} 
                target="_blank"
                rel="noopener noreferrer"
              >
                <Eye className="h-4 w-4" />
              </Link>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm"
              asChild
              title="Editar obra"
            >
              <Link href={`/dashboard/obras/${work.id}/editar`}>
                <Pencil className="h-4 w-4" />
              </Link>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onDelete}
              title="Eliminar obra"
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          
        </div>
      </CardContent>
    </Card>
  );
}

