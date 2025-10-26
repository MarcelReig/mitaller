# On-Demand Revalidation (ISR)

Sistema de revalidación automática de páginas públicas cuando se actualizan datos desde el dashboard.

## 📋 Índice

1. [¿Qué es On-Demand Revalidation?](#qué-es-on-demand-revalidation)
2. [¿Por qué lo necesitamos?](#por-qué-lo-necesitamos)
3. [Arquitectura](#arquitectura)
4. [Implementación](#implementación)
5. [Uso](#uso)
6. [Testing](#testing)
7. [Troubleshooting](#troubleshooting)

---

## ¿Qué es On-Demand Revalidation?

On-Demand Revalidation es una feature de Next.js 13+ que permite **invalidar el caché de páginas estáticas específicas programáticamente**, forzando su regeneración sin esperar el tiempo de `revalidate`.

### Problema que resuelve

En Mitaller tenemos dos tipos de páginas:

1. **Dashboard (privado)**: Client Components con React Query
   - Dinámico, actualización instantánea
   - Solo visible para usuarios autenticados

2. **Páginas públicas**: Server Components con ISR (Incremental Static Regeneration)
   - Rápidas (cacheo en CDN)
   - Buenas para SEO
   - Pero con caché de 1 hora

**El problema**: Un artesano crea una obra en el dashboard y **no la ve en su perfil público** hasta que expire el caché (1 hora).

**La solución**: On-Demand Revalidation. Cuando se crea/edita/elimina una obra, automáticamente invalidamos el caché del perfil público del artesano.

---

## ¿Por qué lo necesitamos?

### Alternativas descartadas

| Solución | Problema |
|----------|----------|
| `revalidate: 0` | Sin caché = lento, caro, sobrecarga backend |
| `cache: 'no-store'` | Pierdes ISR, peor rendimiento |
| Todo Client-side | Sin SSR, peor SEO, pantallas en blanco |
| Caché corto (30s) | Desperdicio recursos, sigue habiendo delay |

### Beneficios

✅ **Velocidad máxima**: Páginas públicas servidas desde CDN (~50ms)  
✅ **Datos frescos**: Cambios visibles instantáneamente  
✅ **Bajo costo**: Regeneración solo cuando hay cambios reales  
✅ **Mejor UX**: Artesanos ven sus cambios inmediatamente  
✅ **SEO óptimo**: Server-side rendering mantenido  

---

## Arquitectura

### Flujo completo

```
┌─────────────────────────────────────────────────────────────┐
│  1. Usuario actualiza datos en Dashboard                   │
│     (crear/editar/eliminar obra, actualizar perfil)        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  2. React Query Hook ejecuta mutación                      │
│     - useCreateWork / useUpdateWork / useDeleteWork         │
│     - useUpdateArtisanProfile                               │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  3. onSuccess: Invalidar caché React Query (dashboard)     │
│     queryClient.invalidateQueries(['works'])                │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  4. Llamar API de revalidación (Next.js ISR)               │
│     POST /api/revalidate                                    │
│     body: { paths: ['/artesanos/juan-ceramista'] }        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  5. Next.js invalida caché de la página                    │
│     revalidatePath('/artesanos/juan-ceramista')            │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  6. Próxima visita a la página pública                     │
│     - Regenera la página con datos frescos                  │
│     - Nueva versión se cachea (1 hora)                      │
│     - Siguiente visitante ve datos actualizados desde CDN   │
└─────────────────────────────────────────────────────────────┘
```

### Componentes del sistema

```
frontend/
├── src/
│   ├── app/
│   │   └── api/
│   │       └── revalidate/
│   │           └── route.ts              # ← API route para revalidación
│   ├── lib/
│   │   └── hooks/
│   │       ├── useWorks.ts               # ← Revalida al modificar obras
│   │       └── useArtisans.ts            # ← Revalida al modificar perfil
│   └── app/(public)/
│       └── artesanos/
│           └── [slug]/
│               ├── page.tsx              # ← Página con ISR (revalidate: 3600)
│               └── obras/
│                   └── [workId]/
│                       └── page.tsx      # ← Página con ISR (revalidate: 3600)
```

---

## Implementación

### 1. API Route de Revalidación

**Archivo**: `src/app/api/revalidate/route.ts`

```typescript
import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { paths } = await request.json();
  
  // Validaciones...
  
  // Revalidar cada path
  for (const path of paths) {
    revalidatePath(path);
  }
  
  return NextResponse.json({ success: true });
}
```

**Características**:
- Acepta múltiples paths en un solo request
- Manejo de errores robusto
- Solo accesible desde same-origin (seguridad)

### 2. Helper de Revalidación

Función compartida en los hooks:

```typescript
async function revalidatePublicPages(artisanSlug: string) {
  try {
    await fetch('/api/revalidate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        paths: [`/artesanos/${artisanSlug}`]
      })
    });
  } catch (error) {
    console.error('Error revalidating:', error);
    // No mostrar error al usuario (es optimización)
  }
}
```

### 3. Integración en React Query Hooks

#### Obras (useWorks.ts)

```typescript
export function useCreateWork() {
  const user = useAuthStore(state => state.user);
  
  return useMutation({
    mutationFn: (data) => worksApi.createWork(data),
    onSuccess: () => {
      // 1. Invalidar caché React Query (dashboard)
      queryClient.invalidateQueries(['works']);
      
      // 2. Revalidar página pública (ISR)
      if (user?.artisan_profile?.slug) {
        revalidatePublicPages(user.artisan_profile.slug);
      }
    },
  });
}
```

Lo mismo para:
- `useUpdateWork`
- `useDeleteWork`
- `useReorderWorks`

#### Perfil (useArtisans.ts)

```typescript
export function useUpdateArtisanProfile() {
  return useMutation({
    mutationFn: (data) => updateMyArtisanProfile(data),
    onSuccess: (updatedArtisan) => {
      // 1. Invalidar caché React Query
      queryClient.invalidateQueries(['artisan', 'me']);
      
      // 2. Revalidar página pública
      if (updatedArtisan?.slug) {
        revalidatePublicPages(updatedArtisan.slug);
      }
    },
  });
}
```

### 4. Configuración de Caché en Páginas Públicas

**Archivo**: `src/app/(public)/artesanos/[slug]/page.tsx`

```typescript
async function getArtisan(slug: string) {
  const res = await fetch(`${API_URL}/api/v1/artisans/${slug}/`, {
    next: { 
      revalidate: process.env.NODE_ENV === 'development' ? 0 : 3600 
    },
  });
  return res.json();
}
```

**Estrategia**:
- **Desarrollo**: `revalidate: 0` (sin caché, testing fácil)
- **Producción**: `revalidate: 3600` (1 hora, pero se invalida on-demand)

---

## Uso

### Para desarrolladores

No necesitas hacer nada especial. El sistema funciona automáticamente:

1. Usuario crea/edita/elimina obra → página pública se revalida automáticamente
2. Usuario actualiza su perfil (avatar, bio, etc.) → página pública se revalida automáticamente

### Agregar revalidación a nuevas features

Si creas una nueva feature que modifica datos públicos:

1. **Identifica el slug del artesano afectado**
2. **Llama `revalidatePublicPages(slug)` en `onSuccess`**

Ejemplo:

```typescript
export function useCreateProduct() {
  const user = useAuthStore(state => state.user);
  
  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
      
      // Revalidar página pública
      if (user?.artisan_profile?.slug) {
        revalidatePublicPages(user.artisan_profile.slug);
      }
    },
  });
}
```

### Paths adicionales

Si necesitas revalidar múltiples páginas:

```typescript
await fetch('/api/revalidate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    paths: [
      '/artesanos/juan-ceramista',
      '/artesanos/juan-ceramista/obras/1',
      '/artesanos',  // Lista de artesanos
    ]
  })
});
```

---

## Testing

### Test manual en desarrollo

1. **Crear/editar obra**:
   ```bash
   # 1. Visitar perfil público
   http://localhost:3000/artesanos/tu-slug
   
   # 2. Ir al dashboard y crear obra
   http://localhost:3000/dashboard/obras/nueva
   
   # 3. Volver al perfil público
   # ✅ La obra nueva debe aparecer SIN refrescar
   ```

2. **Actualizar perfil**:
   ```bash
   # 1. Visitar perfil público
   http://localhost:3000/artesanos/tu-slug
   
   # 2. Cambiar avatar/bio en dashboard
   http://localhost:3000/dashboard/perfil
   
   # 3. Volver al perfil público
   # ✅ Cambios deben verse inmediatamente
   ```

### Verificar revalidación en logs

En desarrollo, puedes ver los logs en la terminal de Next.js:

```
○ Compiled /api/revalidate in 123ms
✓ Revalidating /artesanos/juan-ceramista
```

### Test en producción

Después de deploy:

1. Crea una obra en el dashboard
2. Abre tu perfil público en ventana incógnito
3. Los cambios deben verse inmediatamente (sin `revalidate: 0`)

---

## Troubleshooting

### Los cambios no se ven inmediatamente

**Posibles causas**:

1. **Error en la llamada a `/api/revalidate`**
   - Abre DevTools → Network
   - Busca llamada a `/api/revalidate`
   - Verifica que retorne `{ success: true }`

2. **Slug del artesano undefined**
   - Verifica: `user?.artisan_profile?.slug` existe
   - Check en `useAuthStore`

3. **Caché del navegador**
   - Prueba en ventana incógnito
   - O hard refresh: `Cmd+Shift+R` (Mac) / `Ctrl+Shift+R` (Windows)

4. **CDN caché (solo producción)**
   - En Vercel, puede tomar ~10-30s propagar a todos los edge servers
   - Espera 30s y prueba de nuevo

### Error 400 en `/api/revalidate`

**Error**: `Se requiere un array "paths"`

**Solución**: Verifica que estás enviando el formato correcto:

```typescript
// ❌ Incorrecto
body: JSON.stringify({ path: '/artesanos/juan' })

// ✅ Correcto
body: JSON.stringify({ paths: ['/artesanos/juan'] })
```

### Revalidación no funciona en producción

**Checklist**:

1. ✅ Verificar que `/api/revalidate/route.ts` está deployado
2. ✅ Verificar logs de Vercel/servidor
3. ✅ Confirmar que `revalidatePath` se está llamando
4. ✅ Probar con múltiples usuarios/navegadores

### Performance: muchas revalidaciones simultáneas

Si múltiples usuarios actualizan al mismo tiempo, Next.js **deduplica** las revalidaciones automáticamente. No hay problema de rendimiento.

---

## Referencias

- [Next.js On-Demand Revalidation](https://nextjs.org/docs/app/building-your-application/data-fetching/fetching-caching-and-revalidating#on-demand-revalidation)
- [Next.js revalidatePath](https://nextjs.org/docs/app/api-reference/functions/revalidatePath)
- [React Query Optimistic Updates](https://tanstack.com/query/latest/docs/react/guides/optimistic-updates)

---

## Changelog

| Fecha | Cambio |
|-------|--------|
| 2025-01-25 | Implementación inicial de on-demand revalidation |
| 2025-01-25 | Integración en useWorks y useArtisans |
| 2025-01-25 | Documentación completa |

