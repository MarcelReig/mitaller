# Testing: Perfil Público de Artista

Guía para probar la funcionalidad completa del perfil público de artista.

## 🚀 Inicio rápido

```bash
# 1. Asegúrate de que el backend esté corriendo
cd backend
python manage.py runserver

# 2. En otra terminal, inicia el frontend
cd frontend
npm run dev

# 3. Navega a la página del artista
http://localhost:3000/artesanos/[slug-de-artista]
```

## ✅ Checklist de pruebas

### 1. Página principal (`/artesanos/[slug]`)

- [ ] **Header se carga correctamente**
  - Cover image muestra correctamente
  - Avatar circular se muestra
  - Nombre del artista visible
  - Badges (tipo de artesanía, ubicación, destacado) visibles
  - Bio se muestra si existe

- [ ] **Sección de contacto**
  - Enlaces sociales solo aparecen si están configurados
  - Instagram abre en nueva pestaña
  - Website abre en nueva pestaña
  - Email abre mailto: correctamente
  - Hover effects funcionan

- [ ] **Grid de obras**
  - Obras se muestran en grid responsive
  - 2 columnas en mobile
  - 3 columnas en tablet
  - 4 columnas en desktop
  - Hover muestra overlay con título y categoría
  - Badge "Destacada" visible en obras featured
  - Empty state se muestra si no hay obras

- [ ] **Lightbox**
  - Click en obra abre lightbox
  - Imagen se muestra en grande
  - Botón X cierra el lightbox
  - Click fuera de la imagen cierra el lightbox
  - Click EN la imagen NO cierra el lightbox

- [ ] **Estadísticas**
  - Sección solo visible si tiene obras o productos
  - Contador de obras correcto
  - Contador de productos correcto
  - Ubicación visible

### 2. Loading states

- [ ] **Skeleton correcto**
  - Cover skeleton se muestra
  - Avatar skeleton se muestra
  - Grid skeleton se muestra
  - Transición suave a contenido real

### 3. Error states

- [ ] **404 Not Found**
  - Slug inexistente muestra página 404
  - Botón "Ver todos los artesanos" funciona
  - Botón "Volver al inicio" funciona

### 4. SEO

- [ ] **Metadata dinámica**
  ```bash
  # Ver metadata en el source
  curl http://localhost:3000/artesanos/[slug] | grep -A 20 "<head>"
  ```
  - Title tag correcto
  - Meta description presente
  - Open Graph tags presentes
  - Twitter card tags presentes
  - Imagen de avatar en OG si existe

### 5. Responsive

- [ ] **Mobile (< 768px)**
  - Header se adapta
  - Grid 2 columnas
  - Avatar más pequeño
  - Estadísticas en 2 columnas

- [ ] **Tablet (768px - 1024px)**
  - Grid 3 columnas
  - Layout correcto

- [ ] **Desktop (> 1024px)**
  - Grid 4 columnas
  - Máximo ancho del contenedor respetado

## 🧪 Test cases específicos

### Test 1: Artista con todas las redes sociales

```typescript
// Crear artista con todos los campos:
{
  instagram: "artista123",
  website: "https://artista.com",
  user: { email: "artista@example.com" }
}

// Verificar: 3 enlaces aparecen
```

### Test 2: Artista sin redes sociales

```typescript
// Crear artista sin redes:
{
  instagram: null,
  website: null,
}

// Verificar: Sección de contacto no aparece (null)
```

### Test 3: Artista sin obras

```typescript
// Artist sin obras
works: []

// Verificar:
// - Empty state "Sin obras aún" aparece
// - Emoji 🎨 visible
// - Mensaje descriptivo presente
```

### Test 4: Obra destacada

```typescript
// Obra con is_featured: true

// Verificar:
// - Badge "Destacada" amarillo visible
// - Aparece en top-left de la card
```

### Test 5: Navegación 404

```bash
# Visitar slug inexistente
http://localhost:3000/artesanos/artista-que-no-existe-xyz

# Verificar:
# - Página 404 customizada
# - Emoji 🎨
# - Mensaje "Artista no encontrado"
# - Botones de navegación
```

## 🐛 Errores comunes

### Error: "Artist no encontrado"

**Causa:** El backend no está corriendo o el slug es incorrecto.

**Solución:**
```bash
# Verificar backend
curl http://localhost:8000/api/v1/artists/[slug]/

# Verificar que devuelve JSON válido
```

### Error: "Cannot read property 'display_name' of undefined"

**Causa:** El tipo Artist no coincide con los datos del backend.

**Solución:** Verificar que el serializer del backend devuelve todos los campos esperados.

### Error: Imágenes no se cargan

**Causa:** URLs de Cloudinary incorrectas o configuración faltante.

**Solución:**
```typescript
// Verificar que las URLs son válidas
console.log(artist.avatar);
console.log(artist.cover_image);
console.log(work.thumbnail_url);
```

### Error: Lightbox no cierra

**Causa:** Event handlers mal configurados.

**Solución:** Verificar que `stopPropagation` está en la imagen del lightbox.

## 📊 Performance

### Métricas esperadas

- **First Contentful Paint:** < 1.5s
- **Largest Contentful Paint:** < 2.5s
- **Time to Interactive:** < 3.0s

### Optimizaciones implementadas

✅ Server Components (fetch en servidor)  
✅ Parallel data fetching (Promise.all)  
✅ Next.js Image optimization  
✅ Cloudinary responsive images  
✅ Lazy loading de imágenes  
✅ Skeleton loading states  

## 🔍 Debug tips

### Ver datos fetched

```typescript
// En page.tsx, agregar console.log temporal:
console.log('Artist data:', artist);
console.log('Works data:', works);
```

### Ver network requests

1. Abrir DevTools
2. Tab Network
3. Recargar página
4. Buscar requests a `/api/v1/artists/`

### Ver metadata

```bash
# Ver el HTML generado
curl http://localhost:3000/artesanos/[slug] > output.html
cat output.html | grep -A 30 "<head>"
```

## ✨ Mejoras implementadas

- [x] Loading skeletons elegantes
- [x] 404 page customizada
- [x] Lightbox funcional
- [x] Empty states descriptivos
- [x] Hover effects suaves
- [x] Responsive perfecto
- [x] SEO optimizado
- [x] Performance optimizado

## 🎯 Siguiente paso

Después de verificar que todo funciona:
1. Testear con datos reales de producción
2. Verificar en diferentes navegadores
3. Testear en dispositivos móviles reales
4. Verificar compartir en redes sociales (Open Graph)

