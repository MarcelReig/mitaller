# Guía de Tipos TypeScript - MiTaller.art

Sistema completo de tipos TypeScript para la API de Django REST Framework.

## 📁 Estructura de Tipos

```
src/types/
├── index.ts          # Barrel export (importa desde aquí)
├── user.ts           # Usuario y autenticación
├── artist.ts         # Artistas y perfiles
├── work.ts           # Obras de portfolio
├── product.ts        # Productos de tienda
└── order.ts          # Órdenes y checkout
```

## 🎯 Uso Rápido

### Importación Centralizada

```typescript
// ✅ RECOMENDADO: Importar desde index
import type { Artist, Product, Order, User } from '@/types';
import { CRAFT_TYPE_LABELS, ORDER_STATUS_LABELS } from '@/types';

// ❌ EVITAR: Importar directamente desde archivos
import type { Artist } from '@/types/artist';
```

## 📚 Tipos Principales

### 1. **User & Auth** (`user.ts`)

```typescript
import type { User, AuthResponse, LoginData } from '@/types';

// Usuario autenticado
const user: User = {
  id: 1,
  email: "juan@example.com",
  username: "juanartesano",
  role: "artisan", // 'artisan' | 'admin' | 'customer'
  artist_profile: {
    id: 1,
    slug: "juan-ceramista",
    display_name: "Juan el Ceramista",
    avatar: "https://...",
    // ...más campos
  }
};

// Login
const loginData: LoginData = {
  email: "juan@example.com",
  password: "secret123"
};
```

### 2. **Artist** (`artist.ts`)

```typescript
import type { Artist, CraftType, Location } from '@/types';
import { CRAFT_TYPE_LABELS, LOCATION_LABELS } from '@/types';

// Artista completo
const artist: Artist = {
  id: 1,
  slug: "juan-ceramista",
  display_name: "Juan el Ceramista",
  bio: "Artesano especializado en cerámica tradicional...",
  craft_type: "ceramics",
  location: "mao",
  avatar: "https://...",
  total_works: 15,
  total_products: 8,
  is_featured: true,
  // ...
};

// Labels en español
console.log(CRAFT_TYPE_LABELS[artist.craft_type]); // "Cerámica"
console.log(LOCATION_LABELS[artist.location]); // "Maó"
```

**Tipos de Artesanía:**
- `ceramics` → Cerámica
- `jewelry` → Joyería
- `textiles` → Textiles
- `wood` → Madera
- `leather` → Marroquinería
- `glass` → Vidrio
- `other` → Otro

**Ubicaciones de Menorca:**
- `mao` → Maó
- `ciutadella` → Ciutadella
- `es_mercadal` → Es Mercadal
- `alaior` → Alaior
- `es_migjorn` → Es Migjorn Gran
- `es_castell` → Es Castell
- `ferreries` → Ferreries
- `sant_lluis` → Sant Lluís

### 3. **Work** (`work.ts`)

Obras del portfolio (no están a la venta).

```typescript
import type { Work } from '@/types';

const work: Work = {
  id: 1,
  artist: {
    id: 1,
    slug: "juan-ceramista",
    display_name: "Juan el Ceramista"
  },
  title: "Jarrón Mediterráneo",
  description: "Pieza única inspirada en el mar...",
  image_url: "https://...",
  year: 2024,
  display_order: 1,
  is_featured: true,
  created_at: "2024-01-15T10:00:00Z",
  updated_at: "2024-01-15T10:00:00Z"
};
```

### 4. **Product** (`product.ts`)

Productos a la venta en la tienda.

```typescript
import type { Product, CartItem } from '@/types';

const product: Product = {
  id: 1,
  artist: {
    id: 1,
    slug: "juan-ceramista",
    display_name: "Juan el Ceramista",
    avatar: "https://..."
  },
  name: "Plato de Cerámica Artesanal",
  description: "Plato decorativo hecho a mano...",
  category: "ceramics",
  price: "45.00",
  stock: 5,
  thumbnail_url: "https://...",
  images: ["https://...", "https://..."],
  is_active: true,
  is_available: true,
  formatted_price: "45.00 €",
  created_at: "2024-01-15T10:00:00Z",
  updated_at: "2024-01-15T10:00:00Z"
};

// Item del carrito
const cartItem: CartItem = {
  product: product,
  quantity: 2
};
```

### 5. **Order** (`order.ts`)

Órdenes de compra y checkout.

```typescript
import type { Order, OrderStatus, PaymentStatus } from '@/types';
import { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from '@/types';

const order: Order = {
  id: 1,
  order_number: "ORD-2024-0001",
  customer_email: "cliente@example.com",
  customer_name: "María García",
  customer_phone: "+34 666 777 888",
  shipping_address: "Calle Mayor 123",
  shipping_city: "Maó",
  shipping_postal_code: "07703",
  shipping_country: "España",
  status: "processing",
  payment_status: "succeeded",
  total_amount: "90.00",
  formatted_total: "90.00 €",
  items: [
    {
      id: 1,
      product: { id: 1, name: "Plato Cerámica", is_available: true },
      artist: {
        id: 1,
        slug: "juan-ceramista",
        display_name: "Juan el Ceramista",
        avatar: "https://..."
      },
      product_name: "Plato Cerámica",
      product_price: "45.00",
      quantity: 2,
      subtotal: "90.00",
      formatted_subtotal: "90.00 €",
      created_at: "2024-01-15T10:00:00Z"
    }
  ],
  notes: "",
  created_at: "2024-01-15T10:00:00Z",
  updated_at: "2024-01-15T10:00:00Z"
};

// Labels en español
console.log(ORDER_STATUS_LABELS[order.status]); // "Procesando"
console.log(PAYMENT_STATUS_LABELS[order.payment_status]); // "Exitoso"
```

**Estados de Orden:**
- `pending` → Pendiente
- `processing` → Procesando
- `shipped` → Enviado
- `delivered` → Entregado
- `cancelled` → Cancelado

**Estados de Pago:**
- `pending` → Pendiente
- `processing` → Procesando
- `succeeded` → Exitoso
- `failed` → Fallido
- `refunded` → Reembolsado
- `cancelled` → Cancelado

## 🎨 Ejemplos de Uso

### Componente con Tipos

```tsx
import type { Product } from '@/types';
import { CRAFT_TYPE_LABELS } from '@/types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  return (
    <div>
      <h3>{product.name}</h3>
      <p>{CRAFT_TYPE_LABELS[product.category]}</p>
      <p>{product.formatted_price}</p>
      {product.is_available ? (
        <button onClick={() => onAddToCart(product)}>
          Añadir al carrito
        </button>
      ) : (
        <span>Agotado</span>
      )}
    </div>
  );
}
```

### Filtros con Tipos

```tsx
import type { ArtistFilters, CraftType, Location } from '@/types';
import { CRAFT_TYPE_LABELS, LOCATION_LABELS } from '@/types';

export function ArtistFilterForm() {
  const [filters, setFilters] = useState<ArtistFilters>({
    search: '',
    craft_type: undefined,
    location: undefined,
  });

  return (
    <form>
      <input
        value={filters.search}
        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
      />
      
      <select
        value={filters.craft_type}
        onChange={(e) => setFilters({ 
          ...filters, 
          craft_type: e.target.value as CraftType 
        })}
      >
        <option value="">Todos</option>
        {Object.entries(CRAFT_TYPE_LABELS).map(([key, label]) => (
          <option key={key} value={key}>{label}</option>
        ))}
      </select>
    </form>
  );
}
```

### Badges de Estado

```tsx
import type { Order } from '@/types';
import { ORDER_STATUS_COLORS } from '@/types';

export function OrderStatusBadge({ order }: { order: Order }) {
  const colorClass = ORDER_STATUS_COLORS[order.status];
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs ${colorClass}`}>
      {ORDER_STATUS_LABELS[order.status]}
    </span>
  );
}
```

### API Calls con Tipos

```tsx
import axiosInstance from '@/lib/axios';
import type { Product, ProductListResponse } from '@/types';

// Fetch productos
async function fetchProducts(): Promise<Product[]> {
  const response = await axiosInstance.get<ProductListResponse>(
    '/api/v1/shop/products/'
  );
  return response.data.results;
}

// Fetch un producto
async function fetchProduct(id: number): Promise<Product> {
  const response = await axiosInstance.get<Product>(
    `/api/v1/shop/products/${id}/`
  );
  return response.data;
}

// Crear producto
async function createProduct(data: ProductFormData): Promise<Product> {
  const response = await axiosInstance.post<Product>(
    '/api/v1/shop/products/',
    data
  );
  return response.data;
}
```

## 📦 Tipos Auxiliares

### Respuestas Paginadas

```typescript
import type { PaginatedResponse, Product } from '@/types';

const response: PaginatedResponse<Product> = {
  count: 100,
  next: "http://api.../products/?page=2",
  previous: null,
  results: [/* array de productos */]
};
```

### Errores de API

```typescript
import type { ApiError } from '@/types';

try {
  await createProduct(data);
} catch (error: any) {
  const apiError = error.response?.data as ApiError;
  console.error(apiError.detail);
}
```

## ✅ Best Practices

1. **Siempre usa `type` en imports:**
   ```typescript
   import type { Product } from '@/types'; // ✅
   import { Product } from '@/types'; // ❌
   ```

2. **Importa labels para UI:**
   ```typescript
   import { CRAFT_TYPE_LABELS } from '@/types';
   // Nunca hardcodear "Cerámica" en el código
   ```

3. **Type guards para verificar tipos:**
   ```typescript
   function isArtisan(user: User): boolean {
     return user.role === 'artisan';
   }
   ```

4. **Tipos para props de componentes:**
   ```typescript
   interface Props {
     product: Product;
     onSelect: (id: number) => void;
   }
   ```

## 🔄 Sincronización con Backend

Estos tipos deben coincidir con los serializers de Django:
- `accounts/serializers.py` → `user.ts`
- `artists/serializers.py` → `artist.ts`
- `works/serializers.py` → `work.ts`
- `shop/serializers.py` → `product.ts`
- `orders/serializers.py` → `order.ts`

Si cambias el backend, actualiza los tipos correspondientes.

## 📝 Próximos Pasos

1. ✅ Tipos completos creados
2. ✅ Barrel export en `index.ts`
3. ✅ Labels en español
4. ⏳ Usar en componentes
5. ⏳ Validación con Zod (opcional)

