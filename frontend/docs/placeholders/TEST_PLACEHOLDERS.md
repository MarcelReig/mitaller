# 🧪 Guía de Testing - Sistema de Placeholders

## ✅ Checklist de Verificación

### 1. Componentes SafeImage y SafeNextImage

#### Test 1.1: URL Válida de Cloudinary
```tsx
// Debe mostrar la imagen real
<SafeNextImage
  src="https://res.cloudinary.com/demo/image/upload/v1234/sample.jpg"
  alt="Test válido"
  width={400}
  height={400}
  fallbackType="artwork"
  fallbackId="test-1"
/>
```
**Resultado esperado:** ✅ Muestra la imagen de Cloudinary

---

#### Test 1.2: URL Inválida (404)
```tsx
// Debe mostrar el placeholder automáticamente
<SafeNextImage
  src="https://res.cloudinary.com/demo/image/upload/INVALID.jpg"
  alt="Test inválido"
  width={400}
  height={400}
  fallbackType="artwork"
  fallbackId="test-2"
/>
```
**Resultado esperado:** ✅ Muestra placeholder de artwork

---

#### Test 1.3: URL null/undefined
```tsx
// Debe mostrar el placeholder inmediatamente
<SafeNextImage
  src={null}
  alt="Test sin imagen"
  width={400}
  height={400}
  fallbackType="empty"
  fallbackText="Sin imagen"
/>
```
**Resultado esperado:** ✅ Muestra placeholder "Sin imagen"

---

### 2. Tipos de Placeholder

#### Test 2.1: Artwork Placeholder
```tsx
<SafeImage
  src={null}
  alt="Obra"
  fallbackType="artwork"
  fallbackId="123"
  className="w-64 h-64"
/>
```
**Resultado esperado:** ✅ Fondo slate-700, texto "Obra"

---

#### Test 2.2: Product Placeholder
```tsx
<SafeImage
  src={null}
  alt="Producto"
  fallbackType="product"
  fallbackId="456"
  className="w-64 h-64"
/>
```
**Resultado esperado:** ✅ Fondo sky-500 (azul), texto "Producto"

---

#### Test 2.3: Avatar Placeholder
```tsx
<SafeImage
  src={null}
  alt="Avatar"
  fallbackType="avatar"
  fallbackId="789"
  className="w-32 h-32 rounded-full"
/>
```
**Resultado esperado:** ✅ Fondo slate-700, texto "Avatar", redondo

---

#### Test 2.4: Empty State Placeholder
```tsx
<SafeImage
  src={null}
  alt="Vacío"
  fallbackType="empty"
  fallbackText="No hay obras"
  className="w-64 h-48"
/>
```
**Resultado esperado:** ✅ Fondo slate-100 (gris claro), texto "No hay obras"

---

### 3. Consistencia de IDs

#### Test 3.1: Mismo ID = Misma Imagen
```tsx
{/* Estos dos deben mostrar la MISMA imagen placeholder */}
<SafeImage src={null} alt="Test 1" fallbackType="artwork" fallbackId="999" />
<SafeImage src={null} alt="Test 2" fallbackType="artwork" fallbackId="999" />
```
**Resultado esperado:** ✅ Ambos muestran la misma imagen de Picsum (seed=artwork-999)

---

#### Test 3.2: IDs Diferentes = Imágenes Diferentes
```tsx
{/* Estos dos deben mostrar imágenes DIFERENTES */}
<SafeImage src={null} alt="Test 1" fallbackType="artwork" fallbackId="111" />
<SafeImage src={null} alt="Test 2" fallbackType="artwork" fallbackId="222" />
```
**Resultado esperado:** ✅ Cada uno muestra una imagen diferente

---

### 4. Tamaños Predefinidos

#### Test 4.1: Thumbnail (400x400)
```tsx
<SafeNextImage
  src={null}
  alt="Thumbnail"
  width={400}
  height={400}
  fallbackType="artwork"
  fallbackId="thumb"
  fallbackSize="thumbnail"
/>
```
**Resultado esperado:** ✅ Placeholder de 400x400

---

#### Test 4.2: Medium (800x600)
```tsx
<SafeNextImage
  src={null}
  alt="Medium"
  width={800}
  height={600}
  fallbackType="artwork"
  fallbackId="med"
  fallbackSize="medium"
/>
```
**Resultado esperado:** ✅ Placeholder de 800x600

---

### 5. Integración con Componentes Existentes

#### Test 5.1: WorkCard en Dashboard
1. Ir a `/dashboard/obras`
2. Verificar que las thumbnails de obras se muestren correctamente
3. Apagar Cloudinary (simulado con DevTools bloqueando el dominio)
4. Recargar página

**Resultado esperado:** ✅ Muestra placeholders de artwork para las obras sin imagen

---

#### Test 5.2: Avatar en DashboardHeader
1. Ir a `/dashboard`
2. Verificar avatar del usuario en header
3. Si no hay avatar, debe mostrar el AvatarFallback con iniciales

**Resultado esperado:** ✅ Avatar o iniciales visibles

---

#### Test 5.3: WorkGallery en Página de Obra
1. Ir a `/artesanos/[slug]/obras/[workId]`
2. Verificar que las imágenes de la galería se cargan
3. Si alguna falla, debe mostrar placeholder

**Resultado esperado:** ✅ Grid completo sin imágenes rotas

---

#### Test 5.4: Productos en Artistas
1. Ir a `/artistas/[slug]`
2. Ver tab de "Productos"
3. Verificar que las imágenes de productos se muestran

**Resultado esperado:** ✅ Todos los productos con imagen o placeholder

---

### 6. Performance

#### Test 6.1: Tiempo de Carga de Placeholder
```bash
# Abrir DevTools → Network → Throttling → Fast 3G
# Navegar a una página con placeholders
```
**Resultado esperado:** ✅ Placeholders cargan instantáneamente (< 100ms)

---

#### Test 6.2: Sin Bloqueo de UI
```bash
# Navegar a página con muchas imágenes
# Scroll mientras cargan
```
**Resultado esperado:** ✅ UI sigue responsive mientras cargan imágenes

---

### 7. Edge Cases

#### Test 7.1: Cambio de src Dinámico
```tsx
const [src, setSrc] = useState(null);

// Después de 2 segundos, cambiar src
setTimeout(() => setSrc("https://valid-url.com/image.jpg"), 2000);

<SafeNextImage
  src={src}
  alt="Dinámico"
  width={400}
  height={400}
  fallbackType="artwork"
  fallbackId="dynamic"
/>
```
**Resultado esperado:** ✅ Primero placeholder, luego imagen real

---

#### Test 7.2: Error Intermitente
```tsx
// Simular URL que falla a veces
<SafeNextImage
  src="https://unstable-server.com/image.jpg"
  alt="Intermitente"
  width={400}
  height={400}
  fallbackType="artwork"
  fallbackId="unstable"
/>
```
**Resultado esperado:** ✅ Si falla, muestra placeholder. Si carga, muestra imagen.

---

#### Test 7.3: CORS Error
```tsx
<SafeNextImage
  src="https://domain-without-cors.com/image.jpg"
  alt="CORS blocked"
  width={400}
  height={400}
  fallbackType="artwork"
  fallbackId="cors"
/>
```
**Resultado esperado:** ✅ Detecta error CORS y muestra placeholder

---

### 8. Configuración de Next.js

#### Test 8.1: Verificar next.config.ts
```typescript
// Debe incluir estos dominios:
images: {
  remotePatterns: [
    { hostname: 'res.cloudinary.com' },
    { hostname: 'via.placeholder.com' },
    { hostname: 'picsum.photos' },
  ]
}
```
**Resultado esperado:** ✅ Todos los dominios configurados

---

### 9. TypeScript

#### Test 9.1: Tipado Correcto
```tsx
// Estos deben dar error de tipo:
<SafeNextImage fallbackType="invalid" />  // ❌ 'invalid' no existe
<SafeNextImage fallbackSize="invalid" />  // ❌ 'invalid' no existe

// Estos deben compilar sin error:
<SafeNextImage fallbackType="artwork" />  // ✅
<SafeNextImage fallbackSize="medium" />   // ✅
```
**Resultado esperado:** ✅ TypeScript detecta tipos incorrectos

---

### 10. Accesibilidad

#### Test 10.1: Atributos alt
```tsx
<SafeNextImage
  src={null}
  alt=""  // ⚠️ Debería haber un warning
  fallbackType="artwork"
  fallbackId="test"
/>

<SafeNextImage
  src={null}
  alt="Descripción clara"  // ✅
  fallbackType="artwork"
  fallbackId="test"
/>
```
**Resultado esperado:** ✅ Siempre incluir alt descriptivo

---

## 🚀 Checklist Final

Antes de considerar el sistema completo, verificar:

- [ ] ✅ SafeImage funciona con URLs válidas
- [ ] ✅ SafeImage muestra placeholder si URL falla
- [ ] ✅ SafeNextImage funciona con URLs válidas
- [ ] ✅ SafeNextImage muestra placeholder si URL falla
- [ ] ✅ Todos los tipos de placeholder funcionan (artwork, product, avatar, empty)
- [ ] ✅ Tamaños predefinidos generan dimensiones correctas
- [ ] ✅ IDs consistentes generan misma imagen
- [ ] ✅ WorkCard en dashboard funciona
- [ ] ✅ WorkGallery en obra individual funciona
- [ ] ✅ Avatar en header funciona
- [ ] ✅ Productos en artistas funcionan
- [ ] ✅ next.config.ts incluye dominios necesarios
- [ ] ✅ TypeScript compila sin errores
- [ ] ✅ No hay errores de linting
- [ ] ✅ Placeholders cargan rápidamente
- [ ] ✅ UI no se bloquea durante carga
- [ ] ✅ Documentación completa (SISTEMA_PLACEHOLDERS.md)

---

## 📝 Cómo Ejecutar Tests

### Test Manual Rápido

1. **Iniciar servidor de desarrollo:**
   ```bash
   cd frontend
   npm run dev
   ```

2. **Navegar a páginas clave:**
   - `/dashboard/obras` - WorkManager
   - `/artesanos/[cualquier-slug]` - Portfolio público
   - `/artesanos/[slug]/obras/[workId]` - Galería individual

3. **Bloquear Cloudinary en DevTools:**
   - Abrir DevTools → Network
   - Filtrar: `res.cloudinary.com`
   - Click derecho → Block request domain
   - Recargar página

4. **Verificar:**
   - ¿Las imágenes se muestran como placeholders?
   - ¿Los placeholders son del tipo correcto (artwork, product, avatar)?
   - ¿La UI sigue siendo funcional?

---

## 🐛 Troubleshooting

### Problema: Placeholder no se muestra
**Solución:** Verificar que `next.config.ts` incluye `via.placeholder.com` y `picsum.photos`

### Problema: Error de TypeScript
**Solución:** Verificar que los tipos estén correctamente importados desde `@/lib/placeholders`

### Problema: Next.js Image optimization error
**Solución:** Agregar el dominio a `remotePatterns` en `next.config.ts`

### Problema: Imagen no cambia a placeholder al fallar
**Solución:** Verificar que el componente use `onError` handler del hook `useImageFallback`

---

**Fecha de creación:** 20 Octubre 2025  
**Versión:** 1.0  
**Estado:** ✅ Listo para testing

