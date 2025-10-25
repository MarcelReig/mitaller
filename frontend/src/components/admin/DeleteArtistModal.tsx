'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertTriangle, Trash2 } from 'lucide-react';
import type { Artist } from '@/lib/api/admin';

interface DeleteArtistModalProps {
  artist: Artist | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

export function DeleteArtistModal({
  artist,
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
}: DeleteArtistModalProps) {
  const [confirmed, setConfirmed] = useState(false);
  
  if (!artist) return null;
  
  const handleClose = () => {
    setConfirmed(false);
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Eliminar Artista
          </DialogTitle>
          <DialogDescription>
            Esta acción es permanente y no se puede deshacer.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Datos del artista */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <p><strong>Nombre:</strong> {artist.username}</p>
            <p><strong>Email:</strong> {artist.email}</p>
            <p><strong>Obras:</strong> {artist.works_count}</p>
            <p><strong>Productos:</strong> {artist.products_count}</p>
          </div>
          
          {/* Advertencias condicionales */}
          {!artist.can_be_deleted ? (
            <div className="bg-red-50 border-l-4 border-red-500 p-4">
              <p className="text-red-800 font-semibold">
                ⚠️ No se puede eliminar
              </p>
              <p className="text-red-700 text-sm mt-1">
                Este artista tiene {artist.completed_orders_count} pedidos 
                completados. Por razones de auditoría, debe conservarse.
              </p>
            </div>
          ) : (
            <>
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
                <p className="text-yellow-800 font-semibold">
                  Esta acción eliminará:
                </p>
                <ul className="text-yellow-700 text-sm mt-2 space-y-1 list-disc list-inside">
                  <li>Usuario y perfil de artista</li>
                  <li>{artist.works_count} obras</li>
                  <li>Todas las imágenes de Cloudinary</li>
                </ul>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="confirm"
                  checked={confirmed}
                  onCheckedChange={(checked) => setConfirmed(checked as boolean)}
                />
                <label
                  htmlFor="confirm"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Confirmo que deseo eliminar este artista permanentemente
                </label>
              </div>
            </>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isDeleting}>
            Cancelar
          </Button>
          {artist.can_be_deleted && (
            <Button
              variant="destructive"
              onClick={onConfirm}
              disabled={!confirmed || isDeleting}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {isDeleting ? 'Eliminando...' : 'Eliminar Artista'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

