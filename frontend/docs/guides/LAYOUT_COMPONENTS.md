# Componentes de Layout - MiTaller.art

Componentes de navegación y estructura para el frontend de Next.js 15.

## 📁 Componentes Creados

```
src/components/layout/
├── Navbar.tsx     # Navbar público con auth + carrito
├── Footer.tsx     # Footer con links y redes sociales
└── Sidebar.tsx    # Sidebar para dashboard del artesano
```

## 🎯 1. Navbar (Navegación Pública)

### Características

✅ **Logo** con link al home  
✅ **Links de navegación**: Inicio, Artesanos  
✅ **Carrito** con badge de cantidad de items  
✅ **Usuario autenticado**:
  - Avatar con dropdown menu
  - Link a "Mi Taller" (si es artesano)
  - Link a perfil público
  - Cerrar sesión
✅ **Usuario no autenticado**: Botón "Entrar"  
✅ **Responsive** con menú hamburguesa en mobile  
✅ **Sticky top** con backdrop blur  

### Uso

```tsx
import Navbar from '@/components/layout/Navbar';

export default function PublicLayout({ children }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  );
}
```

### Features Técnicas

- 🔐 Integrado con `useAuth()` hook
- 🛒 Integrado con `useCart()` hook
- 🎨 Usa shadcn/ui: `Button`, `DropdownMenu`, `Avatar`
- 📱 Menú mobile con animaciones
- ✨ Active states en links
- 🎭 Avatar con fallback a iniciales

### Estados

- **Autenticado como artesano**: Muestra avatar + "Mi Taller"
- **Autenticado (no artesano)**: Muestra avatar sin dashboard
- **No autenticado**: Muestra botón "Entrar"
- **Carrito con items**: Badge con número

## 🦶 2. Footer

### Características

✅ **Logo y descripción** del proyecto  
✅ **Links útiles**: Inicio, Artesanos, Sobre nosotros, Contacto  
✅ **Redes sociales**: Instagram, Facebook, Email  
✅ **Copyright** con año dinámico  
✅ **Links legales**: Privacidad, Términos, Cookies  
✅ **Fondo oscuro** (slate-900) con buen contraste  

### Uso

```tsx
import Footer from '@/components/layout/Footer';

export default function PublicLayout({ children }) {
  return (
    <>
      <main>{children}</main>
      <Footer />
    </>
  );
}
```

### Diseño

- Grid responsive: 1 columna en mobile, 4 en desktop
- Logo ocupa 2 columnas en desktop
- Hover states en todos los links
- Iconos de lucide-react

## 📐 3. Sidebar (Dashboard Artesano)

### Características

✅ **Avatar y nombre** del artesano  
✅ **Navegación del dashboard**:
  - Dashboard (home)
  - Portfolio
  - Productos
  - Ventas
  - Configuración
✅ **Ver perfil público** (abre en nueva pestaña)  
✅ **Cerrar sesión**  
✅ **Active state** en link actual  
✅ **Responsive**: Drawer en mobile con overlay  

### Uso

```tsx
import Sidebar from '@/components/layout/Sidebar';

export default function DashboardLayout({ children }) {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}
```

### Features Técnicas

- 🔐 Integrado con `useAuth()` hook
- 🎨 Usa shadcn/ui: `Button`, `Avatar`
- 📱 **Desktop**: Sidebar fijo de 256px
- 📱 **Mobile**: Drawer deslizable con overlay
- ✨ Active states con bg-primary
- 🎭 Avatar con fallback a iniciales
- 🔗 Link al perfil público con `target="_blank"`

### Estados

- **Desktop (lg+)**: Sidebar visible siempre
- **Mobile (<lg)**: Botón hamburguesa que abre drawer
- **Link activo**: Fondo primary, texto blanco
- **Link inactivo**: Texto muted, hover muted bg

## 🛒 Store del Carrito

### CartStore (`stores/cartStore.ts`)

Store de Zustand para gestión del carrito.

**Estado:**
```typescript
{
  items: CartItem[],        // Productos en el carrito
  totalItems: number,       // Cantidad total de items
  subtotal: number          // Precio total
}
```

**Acciones:**
```typescript
addItem(product, quantity?)     // Añadir producto
removeItem(productId)           // Eliminar producto
updateQuantity(productId, qty)  // Cambiar cantidad
clearCart()                     // Vaciar carrito
calculateTotals()               // Recalcular totales (auto)
```

**Validaciones:**
- ✅ Verifica stock disponible
- ✅ No permite productos no disponibles
- ✅ Muestra toasts informativos
- ✅ Actualiza o crea items según existan

**Persistencia:**
```typescript
// Se guarda en localStorage como 'cart-storage'
// Se recalculan totales al hidratar
```

### Hook useCart (`hooks/useCart.ts`)

Wrapper sobre `useCartStore` para uso más simple:

```tsx
const { items, totalItems, subtotal, addItem, removeItem } = useCart();
```

## 🎨 Estilos y Animaciones

### Transiciones

Todos los componentes usan `transition-colors` para cambios suaves:

```tsx
className="transition-colors hover:text-primary"
```

### Responsive Breakpoints

- `md:` → 768px (tablet)
- `lg:` → 1024px (desktop)

### Colores

- **Primary**: Color principal del tema
- **Muted**: Texto secundario/apagado
- **Destructive**: Acciones de eliminación (rojo)
- **Slate-900**: Fondo oscuro del footer

## 📦 Dependencias Usadas

```json
{
  "shadcn/ui": [
    "Button",
    "DropdownMenu",
    "Avatar"
  ],
  "lucide-react": [
    "Menu", "X", "ShoppingCart", "User",
    "LogOut", "LayoutDashboard", "Palette",
    "Package", "Settings", "ExternalLink",
    "Instagram", "Facebook", "Mail"
  ],
  "next": ["Link", "usePathname"],
  "zustand": ["create", "persist"],
  "react-hot-toast": ["toast"]
}
```

## 🚀 Ejemplos de Uso

### Layout Público

```tsx
// src/app/(public)/layout.tsx
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function PublicLayout({ children }) {
  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
```

### Layout Dashboard

```tsx
// src/app/(dashboard)/artesano/layout.tsx
import Sidebar from '@/components/layout/Sidebar';

export default function DashboardLayout({ children }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 lg:ml-0">
        {children}
      </main>
    </div>
  );
}
```

### Añadir al Carrito

```tsx
import { useCart } from '@/hooks/useCart';
import type { Product } from '@/types';

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();

  return (
    <Button onClick={() => addItem(product, 1)}>
      Añadir al carrito
    </Button>
  );
}
```

### Verificar Autenticación

```tsx
import { useAuth } from '@/hooks/useAuth';

export function ProtectedContent() {
  const { isAuthenticated, isArtisan, canSell } = useAuth();

  if (!isAuthenticated) {
    return <p>Debes iniciar sesión</p>;
  }

  if (!isArtisan) {
    return <p>Solo artesanos</p>;
  }

  if (!canSell) {
    return <p>Tu cuenta aún no está aprobada</p>;
  }

  return <div>Contenido protegido</div>;
}
```

## 🎯 Active States

Los componentes detectan automáticamente la ruta actual:

```tsx
// Navbar
isActive('/') // Inicio activo
isActive('/artesanos') // Artesanos activo

// Sidebar
isActive('/artesano') // Dashboard activo
isActive('/artesano/portfolio') // Portfolio activo
```

## 📱 Responsive Design

### Navbar
- **Desktop**: Links en línea, avatar con dropdown
- **Mobile**: Menú hamburguesa con drawer

### Sidebar
- **Desktop**: Sidebar fijo a la izquierda (256px)
- **Mobile**: Botón que abre drawer con overlay

### Footer
- **Desktop**: Grid de 4 columnas
- **Mobile**: Stack vertical

## ✅ Estado del Proyecto

```
✅ Navbar con auth + carrito
✅ Footer con links y redes
✅ Sidebar para dashboard
✅ Store del carrito con persistencia
✅ Hook useCart
✅ Sin errores de linting
✅ Totalmente tipado con TypeScript
✅ Responsive design
✅ Animaciones suaves
```

## 🔜 Próximos Pasos

1. Implementar layouts en rutas (public, auth, dashboard)
2. Crear páginas que usen estos layouts
3. Probar funcionalidad del carrito
4. Añadir tests (opcional)

