# 🖼️ Sistema de Placeholders - Guía Rápida

## ✅ Estado: IMPLEMENTADO Y FUNCIONAL

---

## 🚀 Uso Rápido

### Para Obras de Arte
```tsx
import { SafeNextImage } from '@/components/ui/SafeNextImage';

<SafeNextImage
  src={work.thumbnail_url}
  alt={work.title}
  fill
  fallbackType="artwork"
  fallbackId={work.id}
  fallbackSize="medium"
/>
```

### Para Productos
```tsx
<SafeNextImage
  src={product.main_image}
  alt={product.name}
  fill
  fallbackType="product"
  fallbackId={product.id}
  fallbackSize="medium"
/>
```

### Para Avatares
```tsx
import { SafeImage } from '@/components/ui/SafeImage';

<SafeImage
  src={user.avatar}
  alt={user.display_name}
  fallbackType="avatar"
  fallbackId={user.id}
  className="w-32 h-32 rounded-full"
/>
```

### Para Estados Vacíos
```tsx
<SafeImage
  src={null}
  alt="Sin contenido"
  fallbackType="empty"
  fallbackText="No hay obras disponibles"
  className="w-full h-48"
/>
```

---

## 📚 Documentación Completa

- **Sistema completo:** `SISTEMA_PLACEHOLDERS.md`
- **Guía de testing:** `TEST_PLACEHOLDERS.md`
- **Resumen implementación:** `../IMPLEMENTACION_PLACEHOLDERS.md`

---

## 🎯 Componentes Clave

| Componente | Uso | Documentación |
|------------|-----|---------------|
| `SafeImage` | `<img>` HTML con fallback | `src/components/ui/SafeImage.tsx` |
| `SafeNextImage` | Next.js `<Image>` con fallback | `src/components/ui/SafeNextImage.tsx` |
| `useImageFallback` | Hook para manejo de errores | `src/hooks/useImageFallback.ts` |
| `placeholders.ts` | Funciones helper | `src/lib/placeholders.ts` |

---

## ⚡ Quick Tips

### 1. Siempre usa SafeImage/SafeNextImage para imágenes de usuario
✅ **Correcto:**
```tsx
<SafeNextImage src={userUpload} fallbackType="artwork" fallbackId={id} />
```

❌ **Incorrecto:**
```tsx
<Image src={userUpload} />  // Sin fallback, puede romperse
```

### 2. Usa el tipo correcto de placeholder
- `artwork` → Obras de arte, galerías
- `product` → Productos en tienda
- `avatar` → Fotos de perfil
- `empty` → Estados sin contenido
- `generic` → Casos no específicos

### 3. Incluye fallbackId para consistencia
```tsx
// ✅ Mismo ID = misma imagen placeholder
<SafeNextImage fallbackId={work.id} />
```

### 4. Los avatares de shadcn/ui ya tienen fallback
```tsx
// Avatar de shadcn/ui NO necesita SafeImage
<Avatar>
  <AvatarImage src={url} />
  <AvatarFallback>{initials}</AvatarFallback>
</Avatar>
```

---

## 🐛 Troubleshooting

### Problema: "Invalid src prop"
**Solución:** Verifica que el dominio esté en `next.config.ts`:
```typescript
images: {
  remotePatterns: [
    { hostname: 'via.placeholder.com' },
    { hostname: 'picsum.photos' },
  ]
}
```

### Problema: Placeholder no se muestra
**Solución:** Verifica que estés usando `SafeImage` o `SafeNextImage`, no `Image` directo.

### Problema: TypeScript error en fallbackType
**Solución:** Usa uno de los tipos válidos: `'artwork' | 'product' | 'avatar' | 'empty' | 'generic'`

---

## 📊 Cobertura Actual

- ✅ Dashboard obras
- ✅ Dashboard header
- ✅ Portfolio público (WorkCard)
- ✅ Galería de obras (WorkGallery)
- ✅ Página de artistas
- ✅ Productos en artistas
- ✅ Todas las imágenes protegidas

---

## 🎉 Resultado

**Antes:** Imágenes rotas, mala UX, dependencia de Unsplash  
**Ahora:** Sistema robusto, placeholders automáticos, 100% confiable

---

**Para más detalles, consulta `SISTEMA_PLACEHOLDERS.md`**

