'use client';

import { useState } from 'react';
import { useAdminArtisans, useApproveArtisan, useToggleFeatured, useDeleteArtisan } from '@/lib/hooks/useAdminArtisans';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Search,
  CheckCircle2,
  XCircle,
  Loader2,
  UserCheck,
  Trash2,
  ExternalLink,
  Mail,
  Calendar,
  Package,
  Palette,
  ShoppingCart,
  Star,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';
import type { Artisan } from '@/lib/api/admin';

export default function AdminArtisansPage() {
  const [status, setStatus] = useState<'all' | 'pending' | 'approved'>('all');
  const [search, setSearch] = useState('');
  const [selectedArtisan, setSelectedArtisan] = useState<Artisan | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const debouncedSearch = useDebounce(search, 500);

  const filters = {
    status: status === 'all' ? undefined : status,
    search: debouncedSearch || undefined,
  };

  const { data: artisans, isLoading } = useAdminArtisans(filters);
  const approveMutation = useApproveArtisan();
  const toggleFeaturedMutation = useToggleFeatured();
  const deleteMutation = useDeleteArtisan();

  const handleApprove = (id: string) => {
    approveMutation.mutate(id);
  };

  const handleToggleFeatured = (id: string) => {
    toggleFeaturedMutation.mutate(id);
  };

  const handleDeleteClick = (artisan: Artisan) => {
    setSelectedArtisan(artisan);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedArtisan) {
      deleteMutation.mutate(selectedArtisan.id, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setSelectedArtisan(null);
        },
      });
    }
  };

  const pendingCount = artisans?.filter(a => !a.is_approved).length || 0;
  const approvedCount = artisans?.filter(a => a.is_approved).length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Artesanos</h1>
        <p className="text-muted-foreground mt-2 text-sm md:text-base">
          Gestiona los artesanos de la plataforma
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3 md:gap-4">
        <Card>
          <CardHeader className="pb-2 px-4 md:px-6">
            <CardDescription className="text-xs md:text-sm">Total</CardDescription>
          </CardHeader>
          <CardContent className="px-4 md:px-6">
            <div className="text-xl md:text-2xl font-bold">{artisans?.length || 0}</div>
          </CardContent>
        </Card>
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader className="pb-2 px-4 md:px-6">
            <CardDescription className="text-xs md:text-sm">Pendientes</CardDescription>
          </CardHeader>
          <CardContent className="px-4 md:px-6">
            <div className="text-xl md:text-2xl font-bold text-yellow-600">{pendingCount}</div>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-2 px-4 md:px-6">
            <CardDescription className="text-xs md:text-sm">Aprobados</CardDescription>
          </CardHeader>
          <CardContent className="px-4 md:px-6">
            <div className="text-xl md:text-2xl font-bold text-green-600">{approvedCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">Lista de Artesanos</CardTitle>
          <CardDescription className="text-sm">
            {artisans?.length || 0} artesano{artisans?.length !== 1 ? 's' : ''} en total
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Tabs value={status} onValueChange={(v) => setStatus(v as any)} className="w-full sm:w-auto">
              <TabsList className="grid w-full grid-cols-3 sm:w-auto">
                <TabsTrigger value="all" className="text-xs sm:text-sm">
                  Todos
                </TabsTrigger>
                <TabsTrigger value="pending" className="text-xs sm:text-sm">
                  Pendientes
                  {pendingCount > 0 && (
                    <Badge variant="destructive" className="ml-1 sm:ml-2 h-4 w-4 p-0 text-[10px] sm:text-xs flex items-center justify-center">
                      {pendingCount}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="approved" className="text-xs sm:text-sm">
                  Aprobados
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 text-sm"
              />
            </div>
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !artisans || artisans.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-sm">
                No se encontraron artesanos
              </p>
            </div>
          ) : (
            <>
              {/* Mobile: Cards */}
              <div className="block lg:hidden space-y-4">
                {artisans.map((artisan) => (
                  <Card key={artisan.id} className="overflow-hidden">
                    <CardContent className="p-4 space-y-3">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-base truncate">{artisan.username}</h3>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <Mail className="h-3 w-3 shrink-0" />
                            <span className="truncate">{artisan.email}</span>
                          </p>
                        </div>
                        {artisan.is_approved ? (
                          <Badge variant="default" className="shrink-0">
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            Aprobado
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="shrink-0">
                            <XCircle className="mr-1 h-3 w-3" />
                            Pendiente
                          </Badge>
                        )}
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-2 py-2 border-y">
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                            <Palette className="h-3 w-3" />
                          </div>
                          <div className="text-sm font-semibold">{artisan.works_count}</div>
                          <div className="text-[10px] text-muted-foreground">Obras</div>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                            <Package className="h-3 w-3" />
                          </div>
                          <div className="text-sm font-semibold">{artisan.products_count}</div>
                          <div className="text-[10px] text-muted-foreground">Productos</div>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                            <ShoppingCart className="h-3 w-3" />
                          </div>
                          <div className="text-sm font-semibold">{artisan.completed_orders_count}</div>
                          <div className="text-[10px] text-muted-foreground">Pedidos</div>
                        </div>
                      </div>

                      {/* Date */}
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {formatDistanceToNow(new Date(artisan.date_joined), {
                            addSuffix: true,
                            locale: es,
                          })}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        {!artisan.is_approved && (
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleApprove(artisan.id)}
                            disabled={approveMutation.isPending}
                            className="flex-1"
                          >
                            <UserCheck className="mr-2 h-4 w-4" />
                            Aprobar
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant={artisan.is_featured ? "default" : "outline"}
                          onClick={() => handleToggleFeatured(artisan.id)}
                          disabled={toggleFeaturedMutation.isPending}
                          className="flex-1"
                        >
                          <Star className={`mr-2 h-4 w-4 ${artisan.is_featured ? 'fill-current' : ''}`} />
                          {artisan.is_featured ? 'Destacado' : 'Destacar'}
                        </Button>
                        <Link href={`/artesanos/${artisan.slug}`} target="_blank" className="flex-1">
                          <Button size="sm" variant="outline" className="w-full">
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Ver perfil
                          </Button>
                        </Link>
                        {artisan.can_be_deleted && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteClick(artisan)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Desktop: Table con scroll horizontal */}
              <div className="hidden lg:block relative">
                <div className="overflow-x-auto rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[180px] sticky left-0 bg-card z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                          Artesano
                        </TableHead>
                        <TableHead className="min-w-[200px]">Email</TableHead>
                        <TableHead className="min-w-[120px]">Estado</TableHead>
                        <TableHead className="text-center min-w-[80px]">Obras</TableHead>
                        <TableHead className="text-center min-w-[100px]">Productos</TableHead>
                        <TableHead className="text-center min-w-[90px]">Pedidos</TableHead>
                        <TableHead className="min-w-[140px]">Registrado</TableHead>
                        <TableHead className="text-right min-w-[180px] sticky right-0 bg-card z-20 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                          Acciones
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {artisans.map((artisan) => (
                        <TableRow key={artisan.id}>
                          <TableCell className="sticky left-0 bg-card z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                            <div className="flex flex-col">
                              <span className="font-medium">{artisan.username}</span>
                              {artisan.bio && (
                                <span className="text-xs text-muted-foreground truncate max-w-xs">
                                  {artisan.bio.substring(0, 60)}
                                  {artisan.bio.length > 60 ? '...' : ''}
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">{artisan.email}</TableCell>
                          <TableCell>
                            {artisan.is_approved ? (
                              <Badge variant="default" className="gap-1">
                                <CheckCircle2 className="h-3 w-3" />
                                Aprobado
                              </Badge>
                            ) : (
                              <Badge variant="destructive" className="gap-1">
                                <XCircle className="h-3 w-3" />
                                Pendiente
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline">{artisan.works_count}</Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline">{artisan.products_count}</Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline">{artisan.completed_orders_count}</Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(artisan.date_joined), {
                              addSuffix: true,
                              locale: es,
                            })}
                          </TableCell>
                          <TableCell className="sticky right-0 bg-card z-10 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                            <div className="flex justify-end gap-2">
                              {!artisan.is_approved && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleApprove(artisan.id)}
                                  disabled={approveMutation.isPending}
                                  title="Aprobar artesano"
                                >
                                  <UserCheck className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant={artisan.is_featured ? "default" : "outline"}
                                onClick={() => handleToggleFeatured(artisan.id)}
                                disabled={toggleFeaturedMutation.isPending}
                                title={artisan.is_featured ? "Quitar de destacados" : "Marcar como destacado"}
                              >
                                <Star className={`h-4 w-4 ${artisan.is_featured ? 'fill-current' : ''}`} />
                              </Button>
                              <Link href={`/artesanos/${artisan.slug}`} target="_blank">
                                <Button size="sm" variant="outline" title="Ver perfil público">
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                              </Link>
                              {artisan.can_be_deleted && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDeleteClick(artisan)}
                                  disabled={deleteMutation.isPending}
                                  title="Eliminar artesano"
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar artesano?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminarán todas las obras,
              productos y pedidos asociados a este artesano.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
