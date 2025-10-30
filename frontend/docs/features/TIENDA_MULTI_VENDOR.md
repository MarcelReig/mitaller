# Sistema de Tienda Multi-Vendor - Frontend

## 📋 Descripción General

Implementación completa del frontend para el sistema de tienda multi-vendor de MiTaller.art. Permite a los visitantes navegar por las tiendas individuales de cada artesano, añadir productos al carrito, y gestionar compras de múltiples artesanos de forma independiente.

## 🎯 Filosofía: "Juntos pero no revueltos"

Cada artesano tiene:
- ✅ Su propia página de tienda (`/artesanos/{slug}/tienda`)
- ✅ Su propio coste de envío visible en el carrito
- ✅ Productos destacados controlados independientemente
- ✅ Opción de recogida en taller

Los clientes pueden:
- ✅ Comprar a múltiples artesanos en una sola transacción
- ✅ Ver costes de envío separados por artesano
- ✅ Elegir entre envío o recogida (si está disponible)

## 📁 Estructura de Archivos

### Types (`src/types/`)

#### `product.ts` (actualizado)
```typescript
export type ProductArtisan = {
  id: number;
  slug: string;
  display_name: string;
  avatar: string | null;
  shipping_cost: string; // NUEVO
};

export type Product = {
  id: number;
  name: string;
  description: string;
  category: string;
  price: string;
  stock: number;
  thumbnail_url: string;
  images: string[];
  is_active: boolean;
  is_available: boolean;
  is_featured: boolean; // NUEVO
  pickup_available: boolean; // NUEVO
  artisan: ProductArtisan;
  created_at: string;
  updated_at: string;
};
```

#### `artisan.ts` (actualizado)
```typescript
export interface Artisan {
  // ... campos existentes
  shipping_cost: string; // NUEVO
  workshop_address: string; // NUEVO
  pickup_instructions: string; // NUEVO
}
```

#### `cart.ts` (nuevo)
```typescript
// Sistema de carrito multi-vendor

export type CartItemsByArtisan = {
  artisan: {
    id: number;
    slug: string;
    display_name: string;
    avatar: string | null;
    shipping_cost: string;
  };
  items: CartItem[];
  subtotal: number; // Total productos sin envío
  shipping: number; // Coste envío del artesano
  total: number; // Subtotal + shipping
};

export type ShippingOption = 'shipping' | 'pickup';

export type ShippingSelection = {
  [artisanId: number]: {
    option: ShippingOption;
    cost: number; // 0 si pickup, shipping_cost si shipping
  };
};

export type MultiVendorCartSummary = {
  itemsByArtisan: CartItemsByArtisan[];
  totalItems: number;
  totalProducts: number; // Suma subtotales
  totalShipping: number; // Suma envíos
  grandTotal: number; // Total final
};
```

### Hooks (`src/hooks/`)

#### `useProducts.ts` (actualizado)

##### useArtisanProducts (nuevo)
```typescript
export function useArtisanProducts(
  artisanSlug: string,
  filters?: {
    is_featured?: boolean;
    is_active?: boolean;
    category?: string;
  }
): UseQueryResult<Product[], Error>
```

**Features**:
- Fetch productos de un artesano específico
- Filtros opcionales (destacados, activos, categoría)
- Cache de 3 minutos (staleTime: 3 * 60 * 1000)
- React Query con invalidación automática

**Ejemplo**:
```typescript
const { data: products, isLoading } = useArtisanProducts('ToniMercadal', {
  is_featured: true,
  is_active: true
});
```

#### `useArtisans.ts` (nuevo)

##### useArtisan
```typescript
export function useArtisan(slug: string): UseQueryResult<Artisan, Error>
```

**Features**:
- Fetch datos completos del artesano
- Incluye shipping_cost y campos de recogida
- Cache de 5 minutos

**Ejemplo**:
```typescript
const { data: artisan } = useArtisan('ToniMercadal');
console.log(artisan.shipping_cost); // "5.00"
```

#### `useCartByArtisan.ts` (nuevo)

```typescript
export function useCartByArtisan(): CartItemsByArtisan[]
```

**Features**:
- Agrupa items del carrito por artesano
- Calcula subtotal, envío y total por artesano
- Se actualiza automáticamente con cambios en el carrito
- Ordena artesanos alfabéticamente

**Lógica**:
1. Lee items del cartStore (Zustand)
2. Agrupa por `artisan.id`
3. Calcula totales para cada grupo
4. Retorna array ordenado

**Ejemplo de uso**:
```typescript
const itemsByArtisan = useCartByArtisan();

itemsByArtisan.forEach(group => {
  console.log(group.artisan.display_name);
  console.log('Subtotal:', group.subtotal);
  console.log('Envío:', group.shipping);
  console.log('Total:', group.total);
});
```

#### `useCartTotals.ts` (nuevo)

```typescript
export function useCartTotals(): {
  totalItems: number;
  totalProducts: number;
  totalShipping: number;
  grandTotal: number;
}
```

**Features**:
- Calcula totales globales del carrito
- Se recalcula automáticamente
- Optimizado con useMemo

#### `useMediaQuery.ts` (nuevo)

```typescript
export function useMediaQuery(query: string): boolean
```

**Uso**: Detectar breakpoints para componentes responsive.

**Ejemplo**:
```typescript
const isMobile = useMediaQuery('(max-width: 768px)');
```

### Componentes (`src/components/`)

#### `products/ProductCard.tsx`

**Tarjeta de producto reutilizable con diseño mejorado**

**Props**:
```typescript
interface ProductCardProps {
  product: Product;
  onClick?: (product: Product) => void;
  className?: string;
}
```

**Features**:
- Imagen con fallback a placeholder
- Badge "Destacado" si `is_featured=true`
- Badge "Agotado" si `stock=0`
- Badge "Últimas X unidades" si stock < 5
- Badge "Recogida disponible" si `pickup_available=true`
- Botón "Añadir al carrito" con validación de stock
- Optimistic UI (delay 300ms para feedback)
- Click en card abre modal de detalle
- Hover con scale y shadow
- Texto alineado a la izquierda
- Layout con flexbox (precio y botón al fondo)

**Ubicación**: `/Users/marcelreig/Code/side-project/mitaller/frontend/src/components/products/ProductCard.tsx:40`

#### `products/ProductGrid.tsx`

**Grid responsive de productos**

**Props**:
```typescript
interface ProductGridProps {
  products?: Product[];
  isLoading: boolean;
  error?: Error | null;
  onRetry?: () => void;
  onProductClick?: (product: Product) => void;
}
```

**Features**:
- Grid responsive (1-2-3-4 columnas según viewport)
- Estados de loading, error, empty
- Skeleton loaders durante carga
- Mensaje de error con botón retry
- Mensaje cuando no hay productos

**Grid Layout**:
- Mobile: 1 columna
- Tablet: 2 columnas
- Desktop: 3 columnas
- XL: 4 columnas

#### `products/ProductDetailModal.tsx`

**Modal de detalle del producto con galería**

**Props**:
```typescript
interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}
```

**Features**:
- Responsive (Dialog en desktop, Drawer en mobile)
- Galería de imágenes con thumbnails
- Información completa del producto
- Selector de cantidad con validación de stock
- Botón "Añadir al carrito"
- Badges de estado (destacado, agotado, recogida)
- Link al perfil del artesano
- Scroll en contenido largo

**Ubicación**: `/Users/marcelreig/Code/side-project/mitaller/frontend/src/components/products/ProductDetailModal.tsx:19`

#### `cart/CartItemRow.tsx`

**Fila de producto en el carrito**

**Props**:
```typescript
interface CartItemRowProps {
  item: CartItem;
  onUpdateQuantity: (productId: number, quantity: number) => void;
  onRemove: (productId: number) => void;
}
```

**Features**:
- Imagen miniatura (80x80px)
- Nombre y precio unitario
- Selector de cantidad (+/- buttons)
- Debounce de 500ms para actualización
- Validación contra stock disponible
- Botón eliminar con icono
- Cálculo de subtotal
- Warning si cantidad máxima alcanzada

**Ubicación**: `/Users/marcelreig/Code/side-project/mitaller/frontend/src/components/cart/CartItemRow.tsx:36`

#### `cart/CartDrawer.tsx` ⭐ COMPONENTE CLAVE

**Drawer del carrito multi-vendor**

**Props**:
```typescript
interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}
```

**Features**:
- Drawer desde el lado derecho (Sheet)
- Items agrupados por artesano
- Header con nombre y avatar del artesano
- Subtotal, envío y total por artesano
- Separadores visuales entre artesanos
- Grand total al final
- Botón "Vaciar carrito"
- Botón "Proceder al pago"
- Scroll en contenido
- Estados empty (carrito vacío)

**Estructura Visual**:
```
┌─────────────────────────┐
│ Carrito (2)        [X]  │
├─────────────────────────┤
│ [Avatar] Artesano A     │
│                         │
│ • Producto 1    [- 2 +] │
│ • Producto 2    [- 1 +] │
│                         │
│ Subtotal:       40.00€  │
│ Envío:           5.00€  │
│ Total:          45.00€  │
├─────────────────────────┤
│ [Avatar] Artesano B     │
│                         │
│ • Producto 3    [- 1 +] │
│                         │
│ Subtotal:       15.00€  │
│ Envío:           6.50€  │
│ Total:          21.50€  │
├─────────────────────────┤
│ TOTAL FINAL:    66.50€  │
│ [Proceder al pago]      │
└─────────────────────────┘
```

**Ubicación**: `/Users/marcelreig/Code/side-project/mitaller/frontend/src/components/cart/CartDrawer.tsx:18`

#### `layout/Navbar.tsx` (actualizado)

**Cambios**:
- Integración de CartDrawer en lugar de link a /carrito
- Badge con contador de items (totalItems)
- Estado local para open/close del drawer
- Botón del carrito con icono ShoppingCart

**Ejemplo**:
```typescript
const [isCartOpen, setIsCartOpen] = useState(false);
const totalItems = useCartStore((state) => state.totalItems);

<Button onClick={() => setIsCartOpen(true)}>
  <ShoppingCart className="h-5 w-5" />
  {totalItems > 0 && (
    <span className="badge">{totalItems > 9 ? '9+' : totalItems}</span>
  )}
</Button>

<CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
```

### Pages (`src/app/`)

#### `(public)/artesanos/[slug]/tienda/page.tsx` ⭐ PÁGINA PRINCIPAL

**Página de tienda del artesano**

**URL**: `/artesanos/{slug}/tienda`

**Features**:
- Header del artesano (nombre, avatar, bio, tipo de artesanía)
- Breadcrumb navigation
- Filtros:
  - Tabs por categoría (Todos, Cerámica, Joyería, etc.)
  - Toggle "Solo destacados"
- ProductGrid con productos del artesano
- ProductDetailModal al hacer click
- Botón "Volver al perfil"
- Link "Ver perfil completo"
- Responsive design

**Estado Local**:
```typescript
const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
const [selectedCategory, setSelectedCategory] = useState<string>('all');
const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
```

**Data Fetching**:
```typescript
const { data: artisan } = useArtisan(slug);
const { data: products, isLoading, error, refetch } = useArtisanProducts(slug, {
  ...(selectedCategory !== 'all' && { category: selectedCategory }),
  ...(showFeaturedOnly && { is_featured: true }),
});
```

**Ubicación**: `/Users/marcelreig/Code/side-project/mitaller/frontend/src/app/(public)/artesanos/[slug]/tienda/page.tsx:31`

#### `(public)/explorar/page.tsx` ⭐ NUEVA PÁGINA

**Página de exploración de todos los productos**

**URL**: `/explorar`

**Features**:
- Listado de todos los productos de la plataforma (multi-vendor)
- Búsqueda de texto libre en tiempo real
- Filtros por categoría (tabs con todas las categorías)
- Contador de resultados dinámico
- Grid responsivo de productos (1-4 columnas)
- ProductDetailModal al hacer click
- Breadcrumb de navegación
- Estados de carga, error y vacío
- Botones de limpieza rápida de filtros
- CTA para registro de artesanos cuando no hay productos

**Estado Local**:
```typescript
const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
const [selectedCategory, setSelectedCategory] = useState<string>('all');
const [searchTerm, setSearchTerm] = useState('');
```

**Data Fetching**:
```typescript
const { data: products, isLoading, error, refetch } = useProducts(undefined, {
  ...(selectedCategory !== 'all' && { category: selectedCategory }),
  ...(searchTerm && { search: searchTerm }),
});
```

**Categorías Disponibles**:
- Todos (sin filtro)
- Cerámica
- Joyería
- Textiles
- Madera
- Marroquinería
- Vidrio
- Otro

**Ubicación**: `/Users/marcelreig/Code/side-project/mitaller/frontend/src/app/(public)/explorar/page.tsx`

### Configuración

#### `next.config.ts` (actualizado)

Agregado hostname de Unsplash para imágenes de prueba:

```typescript
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com', // NUEVO
      },
    ],
  },
};
```

## 🎨 Estilos y UI

### Design System

Todos los componentes usan **shadcn/ui**:
- `Card`, `CardContent` - Tarjetas de producto
- `Badge` - Estados (destacado, agotado, recogida)
- `Button` - Acciones
- `Sheet`, `SheetContent` - Drawer del carrito
- `Dialog`, `DialogContent` - Modal de producto
- `ScrollArea` - Scroll en contenido largo
- `Tabs`, `TabsList`, `TabsTrigger` - Filtros de categoría

### Convenciones de Estilo

**Cards**:
- `hover:shadow-lg hover:scale-105` - Hover effect
- `transition-all duration-200` - Transiciones suaves
- `border-border/50` - Bordes sutiles
- `p-6` - Padding consistente

**Texto**:
- Títulos: `text-lg font-semibold`
- Subtítulos: `text-sm text-muted-foreground`
- Precios: `text-2xl font-bold text-primary`
- Alineación a la izquierda por defecto

**Layout**:
- Flexbox para layouts de cards
- Grid responsive para listados
- `space-y-3` para espaciado vertical consistente

## 🔄 Flujo de Usuario

### 1. Navegación a Tienda de Artesano

```
Inicio → Artesanos → [Perfil Artesano] → Tienda
                                         ↓
                              /artesanos/{slug}/tienda
```

### 2. Exploración de Productos

```
[Tienda] → [Filtro: Solo destacados] → [Ver productos destacados]
        → [Filtro: Categoría]        → [Ver productos de categoría]
        → [Click en producto]        → [Modal de detalle]
```

### 3. Añadir al Carrito

```
[ProductCard] → [Botón "Añadir"]     → [Feedback visual 300ms]
                                      → [Producto en carrito]
                                      → [Badge actualizado en navbar]

[ProductModal] → [Selector cantidad] → [Validación stock]
               → [Botón "Añadir"]    → [Producto en carrito]
               → [Modal se cierra]
```

### 4. Gestión del Carrito

```
[Navbar] → [Click icono carrito]     → [Drawer abre desde derecha]
                                      → [Items agrupados por artesano]
                                      → [Subtotales y totales visibles]

[CartDrawer] → [+/- cantidad]        → [Actualización con debounce]
             → [X eliminar]           → [Item removido]
             → [Vaciar carrito]       → [Confirmación]
             → [Proceder al pago]     → [Checkout (futuro)]
```

## 📊 Estado Global (Zustand)

### cartStore

```typescript
interface CartStore {
  items: CartItem[];
  addItem: (product: Product, quantity: number) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  totalItems: number; // computed
}
```

**Persistencia**: LocalStorage con `persist` middleware

**Ubicación**: `/Users/marcelreig/Code/side-project/mitaller/frontend/src/stores/cartStore.ts`

## 🧪 Testing

### Test de Productos Creados

Durante la implementación se crearon 6 productos de prueba:

**Artesano: Toni Mercadal**
1. Plato de Cerámica Artesanal (€35.00, stock: 8)
2. Cuenco de Gres Azul (€28.00, stock: 12, destacado)
3. Jarrón de Terracota (€45.00, stock: 5)

**Artesano: Marga Pons**
1. Pulsera Trenzada (€18.00, stock: 20)
2. Bolso de Piel Natural (€89.00, stock: 3, destacado)
3. Cinturón Artesanal (€42.00, stock: 7)

**URLs de Prueba**:
- http://localhost:3001/artesanos/ToniMercadal/tienda
- http://localhost:3001/artesanos/MargaPons/tienda

## 🐛 Correcciones de Bugs y Mejoras de UX

### Bug: Scroll en CartDrawer (Octubre 2025)
**Problema**: El carrito no mostraba scroll vertical cuando el contenido superaba la altura de la pantalla.

**Solución**: Agregado `overflow-hidden` al componente `ScrollArea` en `CartDrawer.tsx:116`
```typescript
<ScrollArea className="flex-1 -mx-6 px-6 overflow-hidden">
```

### Bug: Deformación de Avatares (Octubre 2025)
**Problema**: Las imágenes de perfil se deformaban en toda la aplicación (modal de productos, carrito, navbar, etc.) porque no mantenían las proporciones originales.

**Solución**: Agregado `object-cover` al componente base `AvatarImage` en `frontend/src/components/ui/avatar.tsx:31`
```typescript
className={cn("aspect-square size-full object-cover", className)}
```

**Alcance**: Esta corrección se aplica automáticamente a todos los avatares de la aplicación.

### Mejora: ProductDetailModal Robusto (Octubre 2025)
**Problema**: El modal fallaba si `product.images` no estaba definido en la respuesta del backend.

**Solución**: Código defensivo para manejar arrays undefined
```typescript
const allImages = [
  product.thumbnail_url,
  ...(Array.isArray(product.images) ? product.images : []),
];
```

## ✅ Checklist de Features Implementadas

### Backend Integration
- ✅ Fetch productos por artesano
- ✅ Filtros (is_featured, category, is_active)
- ✅ Serialización de shipping_cost
- ✅ Manejo de errores API

### Componentes UI
- ✅ ProductCard con badges y estados
- ✅ ProductGrid responsive
- ✅ ProductDetailModal (Dialog + Drawer)
- ✅ CartItemRow con debounce
- ✅ CartDrawer multi-vendor
- ✅ Integración en Navbar

### Funcionalidad
- ✅ Añadir al carrito con validación
- ✅ Actualizar cantidad con debounce
- ✅ Eliminar items
- ✅ Vaciar carrito
- ✅ Agrupación por artesano
- ✅ Cálculo de subtotales/totales
- ✅ Persistencia en localStorage

### UX
- ✅ Optimistic UI (feedback 300ms)
- ✅ Estados de loading
- ✅ Mensajes de error
- ✅ Empty states
- ✅ Responsive design
- ✅ Accesibilidad (aria-labels, keyboard nav)

### Estilos
- ✅ Consistencia con ArtisanCard
- ✅ Texto alineado a la izquierda
- ✅ Hover effects
- ✅ Transiciones suaves
- ✅ Badge system

## 🚀 Próximos Pasos

### MVP Completo
1. ✅ Página `/explorar` - Explorar todos los productos **(IMPLEMENTADO)**
2. ⏳ Sistema de órdenes (checkout)
3. ⏳ Integración Stripe Connect
4. ⏳ Confirmación de pedido
5. ⏳ Emails transaccionales

### Mejoras Futuras
- ⏳ Selección de envío/recogida por artesano
- ⏳ Calculadora de envío por peso/región
- ⏳ Reviews de productos
- ⏳ Wishlist / favoritos
- ⏳ Búsqueda avanzada
- ⏳ Filtros por rango de precio
- ⏳ Ordenamiento (más vendido, precio, nuevo)

## 📝 Notas Técnicas

### Performance
- React Query cache: 3-5 min por query
- Debounce cantidad: 500ms
- Optimistic updates en carrito
- Lazy loading de imágenes (Next/Image)
- useMemo para cálculos pesados

### Accesibilidad
- Aria-labels en botones
- Keyboard navigation
- Focus management en modals
- Alt text en todas las imágenes
- Semantic HTML

### Error Handling
- Try/catch en operaciones críticas
- Mensajes de error user-friendly
- Botones de retry
- Fallbacks para imágenes rotas
- Estados de loading claros

---

**Versión**: 1.0.0
**Fecha**: Octubre 2025
**Estado**: ✅ Implementado y funcionando
**Test URLs**:
- http://localhost:3001/artesanos/ToniMercadal/tienda
- http://localhost:3001/artesanos/MargaPons/tienda
