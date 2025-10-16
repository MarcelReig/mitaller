# Estructura del Frontend - MiTaller.art

## 📁 Árbol de Directorios

```
src/
├── app/                          # App Router de Next.js 15
│   ├── layout.tsx               # Root layout con QueryClientProvider
│   ├── page.tsx                 # Landing page
│   ├── globals.css              # Estilos globales de Tailwind
│   │
│   ├── (public)/                # Route group para rutas públicas
│   │   ├── layout.tsx          # Layout con Navbar + Footer
│   │   ├── artesanos/
│   │   │   ├── page.tsx        # Directorio de artesanos con filtros
│   │   │   └── [slug]/
│   │   │       └── page.tsx    # Perfil del artesano (portfolio + tienda)
│   │   └── carrito/
│   │       └── page.tsx        # Carrito de compras
│   │
│   ├── (auth)/                  # Route group para autenticación
│   │   ├── layout.tsx          # Layout sin navbar (centrado)
│   │   ├── login/
│   │   │   ├── page.tsx        # Página de login
│   │   │   └── actions.ts      # Server Actions para login
│   │   └── registro/
│   │       ├── page.tsx        # Página de registro
│   │       └── actions.ts      # Server Actions para registro
│   │
│   └── (dashboard)/             # Route group para dashboard
│       └── artesano/
│           ├── layout.tsx      # Layout con Sidebar de navegación
│           ├── page.tsx        # Dashboard home (estadísticas)
│           ├── portfolio/
│           │   └── page.tsx    # Gestión de obras (CRUD)
│           ├── productos/
│           │   └── page.tsx    # Gestión de productos (CRUD)
│           └── ventas/
│               └── page.tsx    # Historial de ventas
│
├── components/
│   ├── ui/                      # Componentes shadcn/ui
│   │   ├── avatar.tsx
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── form.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── select.tsx
│   │   ├── sonner.tsx
│   │   └── tabs.tsx
│   │
│   ├── layout/
│   │   ├── Navbar.tsx          # Navbar principal (público)
│   │   ├── Footer.tsx          # Footer (público)
│   │   └── Sidebar.tsx         # Sidebar (dashboard artesano)
│   │
│   ├── artists/
│   │   ├── ArtistCard.tsx      # Card de artesano
│   │   └── ArtistFilters.tsx   # Filtros de búsqueda
│   │
│   ├── works/
│   │   ├── WorkCard.tsx        # Card de obra
│   │   └── WorkForm.tsx        # Formulario crear/editar obra
│   │
│   ├── products/
│   │   ├── ProductCard.tsx     # Card de producto
│   │   └── ProductForm.tsx     # Formulario crear/editar producto
│   │
│   ├── checkout/
│   │   ├── CartItem.tsx        # Item del carrito
│   │   └── CheckoutForm.tsx    # Formulario con Stripe
│   │
│   └── shared/
│       ├── ImageUploader.tsx   # Upload con react-dropzone
│       └── LoadingSpinner.tsx  # Spinner de carga
│
├── lib/
│   ├── axios.ts                # Instancia configurada de axios
│   ├── stripe.ts               # Configuración de Stripe
│   └── utils.ts                # Utilidades (cn, etc.)
│
├── hooks/
│   ├── useAuth.ts              # Hook personalizado para auth
│   └── useCart.ts              # Hook personalizado para carrito
│
├── stores/
│   ├── authStore.ts            # Zustand store para autenticación
│   └── cartStore.ts            # Zustand store para carrito
│
└── types/
    ├── artist.ts               # Tipos de artista
    ├── work.ts                 # Tipos de obra
    ├── product.ts              # Tipos de producto
    └── order.ts                # Tipos de orden
```

## 🎯 Convenciones de Arquitectura

### Route Groups `(nombre)`
Los route groups no afectan la URL pero permiten organizar layouts:

- `(public)` → Rutas con Navbar + Footer para usuarios públicos
- `(auth)` → Rutas con diseño centrado, sin navbar
- `(dashboard)` → Rutas con Sidebar para artesanos autenticados

### Rutas Dinámicas `[param]`
- `[slug]` → Parámetro dinámico para URLs amigables (ej: `/artesanos/juan-perez`)

### Server Actions `actions.ts`
Archivos con directiva `'use server'` para lógica del servidor:
- Validación server-side
- Integración con backend Django
- Manejo de formularios

## 📦 Stack Tecnológico

- **Framework**: Next.js 15.5.4 (App Router, Turbopack)
- **UI**: React 19, TypeScript 5, Tailwind CSS 4
- **Components**: shadcn/ui (Radix UI)
- **State**: Zustand (global), TanStack Query (server)
- **Forms**: React Hook Form + Zod
- **HTTP**: Axios
- **Payments**: Stripe
- **Images**: react-dropzone, yet-another-react-lightbox
- **Utils**: date-fns, clsx, tailwind-merge

## 🚀 Próximos Pasos

1. ✅ Estructura de carpetas creada
2. ✅ Archivos con comentarios TODO
3. ⏳ Definir tipos TypeScript basados en modelos Django
4. ⏳ Implementar stores de Zustand
5. ⏳ Implementar hooks personalizados
6. ⏳ Desarrollar componentes UI reutilizables
7. ⏳ Implementar páginas y funcionalidades

## 📝 Notas

- Todos los archivos contienen comentarios `TODO` con descripción
- Los tipos deben coincidir con los modelos del backend Django
- La estructura sigue best practices de Next.js 15 App Router
- Preparado para Server Actions y React Server Components

