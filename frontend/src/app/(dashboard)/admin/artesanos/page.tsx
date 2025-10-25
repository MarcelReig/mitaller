'use client';

import { useState } from 'react';
import { useAdminArtists, useApproveArtist, useDeleteArtist } from '@/lib/hooks/useAdminArtists';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { DeleteArtistModal } from '@/components/admin/DeleteArtistModal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, UserCheck, Trash2, ExternalLink, Loader2 } from 'lucide-react';
import Link from 'next/link';
import type { Artist } from '@/lib/api/admin';

export default function AdminArtistasPage() {
  const [status, setStatus] = useState<'all' | 'pending' | 'approved'>('all');
  const [search, setSearch] = useState('');
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  
  const debouncedSearch = useDebounce(search, 500);
  
  const filters = {
    status: status === 'all' ? undefined : status,
    search: debouncedSearch || undefined,
  };
  
  const { data: artists, isLoading } = useAdminArtists(filters);
  const approveMutation = useApproveArtist();
  const deleteMutation = useDeleteArtist();
  
  const handleApprove = (id: string) => {
    approveMutation.mutate(id);
  };
  
  const handleDeleteClick = (artist: Artist) => {
    setSelectedArtist(artist);
    setModalOpen(true);
  };
  
  const handleDeleteConfirm = () => {
    if (selectedArtist) {
      deleteMutation.mutate(selectedArtist.id, {
        onSuccess: () => {
          setModalOpen(false);
          setSelectedArtist(null);
        },
      });
    }
  };
  
  const stats = {
    total: artists?.length || 0,
    pending: artists?.filter(a => !a.is_approved).length || 0,
    approved: artists?.filter(a => a.is_approved).length || 0,
  };
  
  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">👥 Gestión de Artesanos</h1>
        <p className="text-gray-600">
          Administra los artistas registrados en la plataforma
        </p>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <p className="text-sm text-gray-600">Total</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <p className="text-sm text-gray-600">Pendientes</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <p className="text-sm text-gray-600">Aprobados</p>
          <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
        </div>
      </div>
      
      {/* Filtros */}
      <div className="flex gap-4 items-center">
        <Tabs value={status} onValueChange={(v) => setStatus(v as any)}>
          <TabsList>
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="pending">Pendientes</TabsTrigger>
            <TabsTrigger value="approved">Aprobados</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por nombre o email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      
      {/* Tabla */}
      <div className="bg-white rounded-lg border">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Artista</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-center">Obras</TableHead>
                <TableHead className="text-center">Pedidos</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {artists?.map((artist) => (
                <TableRow key={artist.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={artist.avatar} />
                        <AvatarFallback>
                          {artist.username[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{artist.username}</p>
                        <p className="text-sm text-gray-600">{artist.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={artist.is_approved ? 'default' : 'secondary'}>
                      {artist.is_approved ? 'Aprobado' : 'Pendiente'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline">{artist.works_count}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline">{artist.completed_orders_count}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {!artist.is_approved && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleApprove(artist.id)}
                          disabled={approveMutation.isPending}
                        >
                          <UserCheck className="h-4 w-4" />
                        </Button>
                      )}
                      <Link href={`/artesanos/${artist.slug}`} target="_blank">
                        <Button size="sm" variant="outline">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteClick(artist)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
      
      {/* Modal */}
      <DeleteArtistModal
        artist={selectedArtist}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
}

