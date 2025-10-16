# Works App - Resumen de Implementación

## 📋 Visión General

La app `works` gestiona el **portfolio de obras artísticas** de los artesanos. Es la galería pública donde muestran su talento y estilo.

### Diferenciación Clave: Works vs Products

| Aspecto | **Works** (Portfolio) | **Products** (Shop) |
|---------|---------------------|-------------------|
| **Propósito** | Mostrar talento y estilo | Vender productos |
| **Transacción** | No se vende | Precio + stock + checkout |
| **Contenido** | Obras destacadas, vendidas, privadas | Solo inventario disponible |
| **Ordenamiento** | Drag & drop personalizado | Por defecto o categorías |
| **Imágenes** | Galería múltiple | Imagen principal + galería |

**Caso de uso:** Un artesano muestra una cerámica vendida en su portfolio pero NO la lista en la tienda. Separar permite portfolio completo sin confundir con inventario actual.

---

## 🏗️ Arquitectura

### Modelo: `Work`

```python
class Work(models.Model):
    artist = ForeignKey(ArtistProfile)  # Dueño del portfolio
    title = CharField(max_length=200)
    description = TextField(blank=True)
    category = CharField(WorkCategory.choices)
    
    # Imágenes en Cloudinary
    thumbnail_url = URLField()  # Imagen principal
    images = JSONField(default=list)  # Galería adicional
    
    # Ordenamiento personalizado
    display_order = IntegerField(default=0)  # Auto-calculado
    is_featured = BooleanField(default=False)
```

**Características:**
- **Auto-ordenamiento:** `display_order` se calcula automáticamente (1, 2, 3...) al crear
- **Reordenamiento:** Endpoint `/reorder/` permite drag & drop
- **Relación:** ForeignKey a `ArtistProfile` (no User) para consistencia

### Categorías

```python
class WorkCategory(TextChoices):
    CERAMICS = 'ceramics', 'Cerámica'
    JEWELRY = 'jewelry', 'Joyería'
    LEATHER = 'leather', 'Marroquinería'
    TEXTILES = 'textiles', 'Textiles'
    WOOD = 'wood', 'Madera'
    GLASS = 'glass', 'Vidrio'
    SCULPTURE = 'sculpture', 'Escultura'
    PAINTING = 'painting', 'Pintura'
    OTHER = 'other', 'Otro'
```

---

## 🔒 Sistema de Permisos

### `IsArtistOwnerOrReadOnly`

**Lógica:**
```
┌─────────────────┬──────────┬─────────────┐
│ Usuario         │ Lectura  │ Escritura   │
├─────────────────┼──────────┼─────────────┤
│ Anónimo         │ ✅ Sí    │ ❌ No       │
│ Admin           │ ✅ Sí    │ ❌ No       │
│ Artesano dueño  │ ✅ Sí    │ ✅ Sí       │
│ Otro artesano   │ ✅ Sí    │ ❌ No       │
└─────────────────┴──────────┴─────────────┘
```

**Implementación:**
```python
class IsArtistOwnerOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        # Lectura pública
        if request.method in SAFE_METHODS:
            return True
        
        # Escritura: usuario autenticado con ArtistProfile
        return (request.user.is_authenticated and 
                hasattr(request.user, 'artist_profile'))
    
    def has_object_permission(self, request, view, obj):
        # Lectura pública
        if request.method in SAFE_METHODS:
            return True
        
        # Escritura: solo el dueño
        return obj.artist.user == request.user
```

**¿Por qué admins NO pueden editar?**
- Respeta la propiedad intelectual del artesano
- Portfolio es espacio personal del creador
- Admins solo moderan desde el admin de Django

---

## 🔄 Sistema de Reordenamiento

### Flujo Drag & Drop

```
1. Frontend: Usuario arrastra obra de posición 3 a posición 1
   
2. Frontend envía nuevo orden:
   POST /api/v1/works/reorder/
   { "work_ids": [5, 2, 8, 1, 3] }

3. Backend actualiza display_order secuencialmente:
   Work ID 5: display_order = 1
   Work ID 2: display_order = 2
   Work ID 8: display_order = 3
   Work ID 1: display_order = 4
   Work ID 3: display_order = 5

4. Backend retorna obras reordenadas
```

### Endpoint: `POST /api/v1/works/reorder/`

**Request:**
```json
{
  "work_ids": [5, 2, 8, 1, 3]
}
```

**Validaciones:**
- ✅ Todos los IDs existen
- ✅ Todas las obras pertenecen al artesano autenticado
- ✅ No hay IDs duplicados
- ✅ Transacción atómica (todo o nada)

**Response 200:**
```json
{
  "message": "5 obras reordenadas exitosamente",
  "works": [
    { "id": 5, "title": "...", "display_order": 1 },
    { "id": 2, "title": "...", "display_order": 2 },
    ...
  ]
}
```

**Errores:**
- `404`: Algunas obras no existen o no pertenecen al artesano
- `400`: Lista de IDs inválida
- `403`: Usuario no es el dueño

---

## 🛣️ Endpoints API

### Públicos (sin autenticación)

```http
GET  /api/v1/works/
     Lista todas las obras
     Query params: ?artist=1&category=ceramics&is_featured=true&search=jarrón

GET  /api/v1/works/{id}/
     Detalle de una obra
```

### Privados (solo artesano dueño)

```http
POST   /api/v1/works/
       Crear nueva obra
       Body: { "title", "thumbnail_url", "description", ... }

PATCH  /api/v1/works/{id}/
       Actualizar obra
       Body: { "title": "Nuevo título", ... }

DELETE /api/v1/works/{id}/
       Eliminar obra

POST   /api/v1/works/reorder/
       Reordenar obras (drag & drop)
       Body: { "work_ids": [5, 2, 8, 1, 3] }
```

---

## 🔍 Filtros y Búsqueda

### Filtros Exactos
```http
GET /api/v1/works/?artist=1              # Por artista
GET /api/v1/works/?category=ceramics     # Por categoría
GET /api/v1/works/?is_featured=true      # Solo destacadas
```

### Búsqueda de Texto
```http
GET /api/v1/works/?search=cerámica
# Busca en: title, description
```

### Ordenamiento
```http
GET /api/v1/works/?ordering=display_order    # Por orden personalizado (default)
GET /api/v1/works/?ordering=-created_at      # Más recientes primero
GET /api/v1/works/?ordering=title            # Alfabético
```

---

## 📊 Signals: Contadores Automáticos

### Flujo de Actualización

```python
# Cuando se crea/modifica/elimina Work:
@receiver(post_save, sender='works.Work')
def update_work_count_on_save(sender, instance, **kwargs):
    update_artist_work_count(instance.artist)

@receiver(post_delete, sender='works.Work')
def update_work_count_on_delete(sender, instance, **kwargs):
    update_artist_work_count(instance.artist)

# Función helper:
def update_artist_work_count(artist_profile):
    count = Work.objects.filter(artist=artist_profile).count()
    artist_profile.total_works = count
    artist_profile.save(update_fields=['total_works'])
```

**Resultado:** `ArtistProfile.total_works` siempre está sincronizado.

---

## ✅ Tests Implementados (25/25 passing)

### Modelo Tests (6)
- ✅ Crear obra básica
- ✅ Auto-cálculo de `display_order`
- ✅ `display_order` manual
- ✅ Propiedad `total_images`
- ✅ Representación string
- ✅ Ordenamiento correcto

### API Tests (17)
- ✅ Listado público sin auth
- ✅ Detalle público sin auth
- ✅ Crear obra (artesano autenticado)
- ✅ Crear obra (usuario no artesano) → 403
- ✅ Actualizar propia obra
- ✅ Actualizar obra ajena → 403
- ✅ Eliminar propia obra
- ✅ Eliminar obra ajena → 403
- ✅ Filtros: artista, categoría, destacado
- ✅ Búsqueda por texto
- ✅ Reordenar obras
- ✅ Reordenar obras ajenas → 404
- ✅ Validación: `images` debe ser lista
- ✅ Validación: URLs deben ser válidas

### Signal Tests (2)
- ✅ Contador aumenta al crear
- ✅ Contador disminuye al eliminar

---

## 🎨 Uso con Cloudinary

### Upload de Imágenes

**Frontend:**
```typescript
// 1. Usuario selecciona imagen
const file = event.target.files[0];

// 2. Upload a Cloudinary
const formData = new FormData();
formData.append('file', file);
formData.append('upload_preset', 'mitaller_works');

const response = await fetch(
  'https://api.cloudinary.com/v1_1/{cloud_name}/image/upload',
  { method: 'POST', body: formData }
);

const data = await response.json();
const imageUrl = data.secure_url;  // URL pública

// 3. Guardar URL en Work
await api.post('/api/v1/works/', {
  title: 'Mi Obra',
  thumbnail_url: imageUrl,  // URL de Cloudinary
  images: [url2, url3]      // URLs adicionales
});
```

**Backend solo almacena URLs**, Cloudinary gestiona hosting y transformaciones.

---

## 📚 Uso Completo: Ejemplo

### Crear Portfolio Completo

```python
# 1. Artesano crea obras
work1 = Work.objects.create(
    artist=artist_profile,
    title='Jarrón de Cerámica',
    category=WorkCategory.CERAMICS,
    thumbnail_url='https://res.cloudinary.com/.../jarron.jpg',
    images=['https://.../jarron2.jpg', 'https://.../jarron3.jpg']
)
# display_order = 1 (auto)

work2 = Work.objects.create(
    artist=artist_profile,
    title='Collar Artesanal',
    category=WorkCategory.JEWELRY,
    thumbnail_url='https://res.cloudinary.com/.../collar.jpg',
    is_featured=True  # Destacada
)
# display_order = 2 (auto)

# 2. Reordenar (poner collar primero)
# POST /api/v1/works/reorder/
# { "work_ids": [2, 1] }

# 3. Ver portfolio público
# GET /api/v1/works/?artist=1
# Retorna: [work2 (order=1), work1 (order=2)]
```

---

## 🔧 Configuración Admin de Django

```python
@admin.register(Work)
class WorkAdmin(admin.ModelAdmin):
    list_display = ('title', 'artist', 'category', 'is_featured', 'display_order', 'created_at')
    list_filter = ('artist', 'category', 'is_featured', 'created_at')
    search_fields = ('title', 'description', 'artist__display_name')
    list_editable = ('display_order', 'is_featured')
    
    fieldsets = (
        ('Información Básica', { 'fields': ('artist', 'title', 'description', 'category') }),
        ('Imágenes', { 'fields': ('thumbnail_url', 'images') }),
        ('Configuración', { 'fields': ('display_order', 'is_featured') }),
        ('Metadata', { 'fields': ('created_at', 'updated_at'), 'classes': ('collapse',) }),
    )
```

---

## 🚀 Próximos Pasos Sugeridos

### Backend
- [ ] Endpoint para estadísticas (`GET /works/stats/`)
- [ ] Soft delete (campo `deleted_at` para papelera)
- [ ] Versionamiento de obras
- [ ] Tags/etiquetas adicionales

### Frontend
- [ ] Componente `WorkGallery` con lightbox
- [ ] Drag & drop visual para reordenamiento
- [ ] Upload múltiple de imágenes
- [ ] Preview antes de publicar

---

## 📖 Referencias

- **Código fuente:** `/backend/works/`
- **Tests:** `/backend/works/tests.py`
- **Migraciones:** `/backend/works/migrations/`
- **Signals:** `/backend/artists/signals.py` (líneas 53-117)

---

**Implementado:** ✅ Completo y testeado (25/25 tests passing)  
**Autor:** Sistema de IA - Cursor  
**Fecha:** 2025-10-12

