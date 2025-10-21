# Guía de Hooks Personalizados - MiTaller.art

Sistema completo de hooks personalizados con React Query para data fetching y gestión de estado.

## 📁 Hooks Creados

```
src/hooks/
├── useAuth.ts          # Autenticación con auto-check en mount
├── useCart.ts          # Carrito de compras con persistencia
├── useWorks.ts         # CRUD de obras con React Query
└── useProducts.ts      # CRUD de productos con React Query
```

## 🔐 1. useAuth Hook

**Purpose:** Gestión de autenticación con JWT

### API

```typescript
const {
  // Estado
  user,              // User | null
  isAuthenticated,   // boolean
  isLoading,         // boolean
  
  // Acciones
  login,             // (email, password) => Promise<void>
  logout,            // () => void
  register,          // (data) => Promise<void>
  checkAuth,         // () => Promise<void>
  refreshUser,       // () => Promise<void>
  
  // Helpers de roles
  isArtisan,         // boolean
  isAdmin,           // boolean
  isCustomer,        // boolean
  isApproved,        // boolean
  canSell,           // boolean (artisan + approved)
} = useAuth();
```

### Características

✅ **Auto-check** en mount: Verifica sesión activa automáticamente  
✅ **Helpers de roles**: `isArtisan`, `canSell`, etc.  
✅ **TypeScript** completo  
✅ **Persistencia** en localStorage (solo isAuthenticated)  
✅ **Tokens** en cookies (más seguro)  

### Ejemplo de Uso

```tsx
'use client';

import { useAuth } from '@/hooks/useAuth';

export function ProtectedPage() {
  const { isAuthenticated, isArtisan, canSell, user } = useAuth();

  if (!isAuthenticated) {
    return <div>Debes iniciar sesión</div>;
  }

  if (!isArtisan) {
    return <div>Solo artesanos</div>;
  }

  if (!canSell) {
    return <div>Tu cuenta está pendiente de aprobación</div>;
  }

  return (
    <div>
      <h1>Bienvenido, {user.username}</h1>
      <p>Dashboard del artesano</p>
    </div>
  );
}
```

## 🛒 2. useCart Hook

**Purpose:** Gestión del carrito de compras

### API

```typescript
const {
  // Estado
  items,           // CartItem[]
  totalItems,      // number (cantidad total de items)
  subtotal,        // number (precio total)
  
  // Acciones
  addItem,         // (product, quantity?) => void
  removeItem,      // (productId) => void
  updateQuantity,  // (productId, quantity) => void
  clearCart,       // () => void
} = useCart();
```

### CartItem Type

```typescript
interface CartItem {
  product: Product;
  quantity: number;
}
```

### Características

✅ **Validación de stock**: No permite exceder stock disponible  
✅ **Persistencia**: Guarda en localStorage  
✅ **Cálculo automático**: Totales se actualizan automáticamente  
✅ **Toasts informativos**: Feedback al usuario  
✅ **Optimistic updates**: UI instantánea  

### Ejemplo de Uso

```tsx
import { useCart } from '@/hooks/useCart';
import type { Product } from '@/types';

export function ProductCard({ product }: { product: Product }) {
  const { addItem, totalItems } = useCart();

  const handleAddToCart = () => {
    addItem(product, 1);
  };

  return (
    <div>
      <h3>{product.name}</h3>
      <p>{product.formatted_price}</p>
      <button onClick={handleAddToCart}>
        Añadir al carrito ({totalItems})
      </button>
    </div>
  );
}
```

```tsx
import { useCart } from '@/hooks/useCart';

export function CartPage() {
  const { items, subtotal, removeItem, updateQuantity, clearCart } = useCart();

  return (
    <div>
      <h1>Carrito ({items.length} productos)</h1>
      
      {items.map((item) => (
        <div key={item.product.id}>
          <h3>{item.product.name}</h3>
          <input
            type="number"
            value={item.quantity}
            onChange={(e) => updateQuantity(item.product.id, Number(e.target.value))}
            min="1"
            max={item.product.stock}
          />
          <button onClick={() => removeItem(item.product.id)}>Eliminar</button>
        </div>
      ))}
      
      <p>Total: {subtotal.toFixed(2)} €</p>
      <button onClick={clearCart}>Vaciar carrito</button>
    </div>
  );
}
```

## 🎨 3. useWorks Hook

**Purpose:** CRUD de obras con React Query

### API

#### Queries (Fetching)

```typescript
// Lista de obras
const { data: works, isLoading, error } = useWorks(artistSlug?);

// Obra individual
const { data: work, isLoading } = useWork(workId);
```

#### Mutations (Create/Update/Delete)

```typescript
// Crear obra
const createWork = useCreateWork();
await createWork.mutateAsync(data);

// Actualizar obra
const updateWork = useUpdateWork();
await updateWork.mutateAsync({ id, data });

// Eliminar obra
const deleteWork = useDeleteWork();
await deleteWork.mutateAsync(id);

// Reordenar obras
const reorderWorks = useReorderWorks();
await reorderWorks.mutateAsync([
  { id: 1, display_order: 0 },
  { id: 2, display_order: 1 },
]);
```

### Características

✅ **React Query**: Cache automático, refetching inteligente  
✅ **Optimistic updates**: UI se actualiza antes de la respuesta  
✅ **Rollback**: Revierte cambios si falla el request  
✅ **Invalidación automática**: Actualiza listas después de mutations  
✅ **Multipart/form-data**: Soporte para upload de imágenes  
✅ **Toasts**: Feedback automático de éxito/error  

### Ejemplo de Uso

#### Listar Obras

```tsx
import { useWorks } from '@/hooks/useWorks';

export function WorksGallery({ artistSlug }: { artistSlug?: string }) {
  const { data: works, isLoading, error } = useWorks(artistSlug);

  if (isLoading) return <Spinner />;
  if (error) return <Error message={error.message} />;
  if (!works || works.length === 0) return <Empty />;

  return (
    <div className="grid grid-cols-3 gap-4">
      {works.map((work) => (
        <WorkCard key={work.id} work={work} />
      ))}
    </div>
  );
}
```

#### Crear Obra

```tsx
import { useCreateWork } from '@/hooks/useWorks';
import { useState } from 'react';

export function CreateWorkForm() {
  const createWork = useCreateWork();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    year: 2025,
    image: null,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createWork.mutateAsync(formData);
      // Form se limpia, toast de éxito se muestra automáticamente
      setFormData({ title: '', description: '', year: 2025, image: null });
    } catch (error) {
      // Toast de error se muestra automáticamente
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        required
      />
      {/* ...más campos... */}
      <button type="submit" disabled={createWork.isPending}>
        {createWork.isPending ? 'Creando...' : 'Crear Obra'}
      </button>
    </form>
  );
}
```

#### Actualizar Obra

```tsx
import { useUpdateWork, useWork } from '@/hooks/useWorks';

export function EditWorkForm({ workId }: { workId: number }) {
  const { data: work } = useWork(workId);
  const updateWork = useUpdateWork();

  const handleSubmit = async (data: Partial<WorkFormData>) => {
    await updateWork.mutateAsync({ id: workId, data });
  };

  if (!work) return <Spinner />;

  return <WorkForm initialData={work} onSubmit={handleSubmit} />;
}
```

#### Eliminar Obra

```tsx
import { useDeleteWork } from '@/hooks/useWorks';

export function WorkCard({ work }: { work: Work }) {
  const deleteWork = useDeleteWork();

  const handleDelete = async () => {
    if (!confirm('¿Eliminar esta obra?')) return;
    
    try {
      await deleteWork.mutateAsync(work.id);
      // Toast de éxito automático
    } catch (error) {
      // Toast de error automático
    }
  };

  return (
    <div>
      <img src={work.image_url} alt={work.title} />
      <h3>{work.title}</h3>
      <button onClick={handleDelete} disabled={deleteWork.isPending}>
        Eliminar
      </button>
    </div>
  );
}
```

## 📦 4. useProducts Hook

**Purpose:** CRUD de productos con React Query

### API

#### Queries

```typescript
// Lista de productos (con filtros opcionales)
const { data: products, isLoading } = useProducts(artistSlug?, filters?);

// Producto individual
const { data: product, isLoading } = useProduct(productId);
```

#### Mutations

```typescript
// Crear producto
const createProduct = useCreateProduct();
await createProduct.mutateAsync(data);

// Actualizar producto
const updateProduct = useUpdateProduct();
await updateProduct.mutateAsync({ id, data });

// Eliminar producto
const deleteProduct = useDeleteProduct();
await deleteProduct.mutateAsync(id);
```

### Filtros Disponibles

```typescript
interface ProductFilters {
  category?: CraftType;
  min_price?: number;
  max_price?: number;
  is_available?: boolean;
  search?: string;
}
```

### Características

✅ **Filtros avanzados**: Por categoría, precio, disponibilidad, búsqueda  
✅ **Upload de imágenes**: Thumbnail + galería  
✅ **Optimistic updates**: UI instantánea con rollback si falla  
✅ **Cache inteligente**: 3 minutos (productos cambian frecuentemente)  
✅ **Invalidación selectiva**: Solo actualiza queries afectadas  

### Ejemplo de Uso

#### Listar Productos con Filtros

```typescript
import { useProducts } from '@/hooks/useProducts';
import { useState } from 'react';

export function ProductsPage({ artistSlug }: { artistSlug?: string }) {
  const [filters, setFilters] = useState({
    category: undefined,
    is_available: true,
    search: '',
  });

  const { data: products, isLoading } = useProducts(artistSlug, filters);

  if (isLoading) return <Spinner />;

  return (
    <div>
      {/* Filtros */}
      <input
        placeholder="Buscar..."
        value={filters.search}
        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
      />

      {/* Grid de productos */}
      <div className="grid grid-cols-3 gap-4">
        {products?.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
```

#### Crear Producto con Imágenes

```tsx
import { useCreateProduct } from '@/hooks/useProducts';

export function CreateProductForm() {
  const createProduct = useCreateProduct();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const formData = new FormData(e.currentTarget);
    
    const data = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      category: formData.get('category') as CraftType,
      price: Number(formData.get('price')),
      stock: Number(formData.get('stock')),
      thumbnail: formData.get('thumbnail') as File,
      images: formData.getAll('images') as File[],
      is_active: true,
    };

    try {
      await createProduct.mutateAsync(data);
      // Form se resetea, toast de éxito automático
    } catch (error) {
      // Toast de error automático
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" required />
      <input name="price" type="number" required />
      <input name="stock" type="number" required />
      <input name="thumbnail" type="file" accept="image/*" />
      <input name="images" type="file" accept="image/*" multiple />
      
      <button type="submit" disabled={createProduct.isPending}>
        {createProduct.isPending ? 'Creando...' : 'Crear Producto'}
      </button>
    </form>
  );
}
```

## 🔄 React Query Features

### Cache Keys

Cada hook usa query keys estructuradas para cache óptimo:

```typescript
// Works
workKeys.all           // ['works']
workKeys.lists()       // ['works', 'list']
workKeys.list('slug')  // ['works', 'list', { artistId: 'slug' }]
workKeys.detail(1)     // ['works', 'detail', 1]

// Products
productKeys.all
productKeys.lists()
productKeys.list(filters)
productKeys.detail(id)
```

### Stale Time

- **Works**: 5 minutos (cambian poco)
- **Products**: 3 minutos (cambian más frecuentemente)

### Optimistic Updates

Todas las mutations implementan optimistic updates:

```typescript
onMutate: async (data) => {
  // 1. Cancelar queries en curso
  await queryClient.cancelQueries({ queryKey });

  // 2. Snapshot del estado anterior
  const previous = queryClient.getQueryData(queryKey);

  // 3. Actualizar cache optimistamente
  queryClient.setQueryData(queryKey, newData);

  // 4. Retornar snapshot para rollback
  return { previous };
},
onError: (err, data, context) => {
  // Rollback si falla
  queryClient.setQueryData(queryKey, context.previous);
},
onSuccess: () => {
  // Invalidar queries relacionadas
  queryClient.invalidateQueries({ queryKey });
},
```

### Error Handling

Todos los hooks manejan errores automáticamente:

```typescript
onError: (error: any) => {
  const message =
    error.response?.data?.detail ||
    'Error genérico';
  toast.error(message);
},
```

## ✅ Best Practices

### 1. Usar hooks en componentes

```tsx
// ✅ CORRECTO
function MyComponent() {
  const { data, isLoading } = useProducts();
  // ...
}

// ❌ INCORRECTO
const products = await fetch(...); // No usar fetch directamente
```

### 2. Manejar loading y error states

```tsx
const { data, isLoading, error } = useProducts();

if (isLoading) return <Spinner />;
if (error) return <Error message={error.message} />;
if (!data) return <Empty />;

return <ProductsGrid products={data} />;
```

### 3. Usar mutateAsync para forms

```tsx
const createProduct = useCreateProduct();

const handleSubmit = async (data) => {
  try {
    await createProduct.mutateAsync(data);
    // Éxito: limpiar form, cerrar modal, etc.
  } catch (error) {
    // Error ya manejado por el hook
  }
};
```

### 4. Aprovechar el cache

```tsx
// Primera vez: hace request
const { data } = useProducts();

// Segunda vez (dentro de staleTime): usa cache
const { data: sameData } = useProducts();
```

## 📊 Estado del Proyecto

```
✅ useAuth - Autenticación completa
✅ useCart - Carrito con persistencia
✅ useWorks - CRUD completo con React Query
✅ useProducts - CRUD completo con React Query
✅ TypeScript estricto en todos los hooks
✅ Manejo de errores con toasts
✅ Optimistic updates
✅ Cache inteligente
✅ Documentación JSDoc completa
✅ 0 errores de linting
```

## 🔜 Hooks Futuros (Opcional)

- `useOrders()` - Gestión de órdenes
- `useArtists()` - Listado de artistas
- `useCheckout()` - Proceso de checkout con Stripe
- `useUpload()` - Upload de imágenes a Cloudinary
- `useSearch()` - Búsqueda global con debounce

## 📝 Notas Importantes

- **React Query es requerido**: Todos los hooks usan `@tanstack/react-query`
- **Axios configurado**: Usa el cliente de `@/lib/axios` con JWT automático
- **Toasts automáticos**: No necesitas mostrar toasts manualmente
- **TypeScript**: Todos los hooks están completamente tipados
- **Cache persistence**: React Query maneja el cache en memoria (no en localStorage)

