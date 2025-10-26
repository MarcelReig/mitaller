# 🎨 Artists vs Artisans - Diferenciación de Modelos

## ⚠️ IMPORTANTE: Nomenclatura del Proyecto

MiTaller tiene **DOS modelos de creadores separados** con propósitos diferentes:

## 1. 🛠️ ARTISANS (Artesanos) - FOCO ACTUAL ✅

**App:** `artisans`  
**Modelo:** `ArtisanProfile`  
**Related name en User:** `user.artisan_profile`

### Descripción
Artesanos con **taller físico** que venden productos tangibles en un marketplace.

### Características
- ✅ **Taller en Menorca** (ubicación física específica)
- ✅ **Venta de productos** con precio y stock
- ✅ **Stripe Connect** para pagos directos
- ✅ **Gestión de inventario** (stock, pedidos)
- ✅ **Categorías específicas:** cerámica, joyería, marroquinería, textiles, madera, vidrio
- ✅ **Modelo de negocio:** E-commerce con productos físicos

### Ejemplos
- Ceramista que vende tazas artesanales
- Joyero que vende anillos de plata
- Marroquinero que vende bolsos de cuero
- Carpintero que vende muebles artesanales

### Campos Específicos
```python
class ArtisanProfile:
    craft_type = CharField(choices=CraftType)  # Tipo de artesanía
    location = CharField(choices=MenorcaLocation)  # Municipio en Menorca
    phone = CharField()  # Teléfono del taller
    stripe_account_id = CharField()  # Para pagos
    stripe_charges_enabled = BooleanField()
    total_products = IntegerField()  # Productos en venta
```

### URLs Públicas
```
/artesanos/{slug}/          → Perfil público del artesano
/artesanos/{slug}/tienda/   → Tienda de productos
/artesanos/{slug}/obras/    → Portfolio/galería
```

---

## 2. 🎭 ARTISTS (Artistas) - MODELO FUTURO 🔮

**App:** `artists`  
**Modelo:** `ArtistProfile`  
**Related name en User:** `user.artist_profile`

### Descripción
Artistas visuales, músicos, performers que **NO venden productos físicos** necesariamente.

### Características (Planificadas)
- 🎨 **Arte visual:** Pintura, escultura, fotografía, arte digital
- 🎵 **Artes escénicas:** Música, danza, teatro, performance
- 🖼️ **Portfolio digital** sin necesariamente vender
- 💼 **Servicios:** Encargos, exposiciones, eventos
- 🌍 **Ubicación flexible** (no limitado a Menorca)
- 🎟️ **Modelo de negocio:** Servicios, encargos, eventos (diferente a e-commerce)

### Ejemplos (Futuros)
- Pintor que expone en galerías y acepta encargos
- Fotógrafo que ofrece sesiones
- Músico que actúa en eventos
- Bailarín disponible para espectáculos

### Campos Específicos (Planificados)
```python
class ArtistProfile:
    discipline = CharField()  # Pintura, música, danza, etc.
    exhibition_history = TextField()  # Historial de exposiciones
    awards = TextField()  # Premios y reconocimientos
    available_for_commissions = BooleanField()  # Acepta encargos
    available_for_events = BooleanField()  # Disponible para eventos
    base_price_range = CharField()  # Rango de precios orientativo
```

### URLs Públicas (Futuras)
```
/artistas/{slug}/           → Perfil público del artista
/artistas/{slug}/portfolio/ → Portfolio/obras
/artistas/{slug}/servicios/ → Servicios y encargos
```

---

## 📊 Comparación Directa

| Aspecto | ARTISANS (Actual) | ARTISTS (Futuro) |
|---------|-------------------|------------------|
| **App Django** | `artisans` | `artists` |
| **Modelo** | `ArtisanProfile` | `ArtistProfile` |
| **Ubicación** | Menorca específico | Global/flexible |
| **Negocio** | E-commerce productos | Servicios/encargos |
| **Productos físicos** | ✅ Sí (con stock) | ❌ No necesariamente |
| **Stripe Connect** | ✅ Sí | 🔮 Quizás (pagos servicios) |
| **Stock/Inventario** | ✅ Sí | ❌ No |
| **Taller físico** | ✅ Sí | ❌ No necesariamente |
| **Categorías** | Craft types | Disciplines |
| **Estado** | ✅ **IMPLEMENTADO** | 🔮 **FUTURO** |

---

## 🎯 Relaciones con Otros Modelos

### ARTISANS (Actual)

```python
# shop.Product
artisan = ForeignKey('artisans.ArtisanProfile')  # ✅ CORRECTO

# orders.OrderItem
artisan = ForeignKey('artisans.ArtisanProfile')  # ✅ CORRECTO

# works.Work
artisan = ForeignKey('artisans.ArtisanProfile')  # ✅ CORRECTO

# payments.Payment
artisan = ForeignKey('artisans.ArtisanProfile')  # ✅ CORRECTO
```

### ARTISTS (Futuro)

```python
# future_services.Service (no existe aún)
artist = ForeignKey('artists.ArtistProfile')  # 🔮 FUTURO

# future_commissions.Commission (no existe aún)
artist = ForeignKey('artists.ArtistProfile')  # 🔮 FUTURO
```

---

## ⚠️ ERRORES COMUNES A EVITAR

### ❌ INCORRECTO

```python
# En shop/models.py - MAL
from artists.models import ArtistProfile  # ❌ WRONG APP
artist = ForeignKey(ArtistProfile)  # ❌ WRONG MODEL

# En orders/models.py - MAL
artist = ForeignKey('artists.ArtistProfile')  # ❌ WRONG
```

### ✅ CORRECTO

```python
# En shop/models.py - BIEN
from artisans.models import ArtisanProfile  # ✅ RIGHT APP
artisan = ForeignKey(ArtisanProfile)  # ✅ RIGHT MODEL

# En orders/models.py - BIEN
artisan = ForeignKey('artisans.ArtisanProfile')  # ✅ RIGHT
```

---

## 🔑 Reglas de Nomenclatura

### En el Código

1. **Para artesanos (actual):**
   - Usar siempre: `artisan`, `ArtisanProfile`, `artisans`
   - Import: `from artisans.models import ArtisanProfile`
   - ForeignKey: `artisan = ForeignKey('artisans.ArtisanProfile')`

2. **Para artistas (futuro):**
   - Usar siempre: `artist`, `ArtistProfile`, `artists`
   - Import: `from artists.models import ArtistProfile`
   - ForeignKey: `artist = ForeignKey('artists.ArtistProfile')`

### En la Documentación

- **Artesano/Artisan** → Creador con taller que vende productos físicos
- **Artista/Artist** → Creador de arte visual/escénico (modelo futuro)

### En la UI (Español)

- **Artesanos** → Página principal, listados, perfiles
- **Taller** → Ubicación física del artesano
- **Tienda** → Productos en venta
- **Obras** → Portfolio/galería del artesano

---

## 🚀 Estado de Implementación

### ✅ COMPLETADO - ARTISANS

- [x] App `artisans` creada y configurada
- [x] Modelo `ArtisanProfile` con todos los campos
- [x] Signals para creación automática al registrarse
- [x] API pública para listado y detalle
- [x] Admin configurado con acciones personalizadas
- [x] Integración con `shop.Product`
- [x] Integración con `orders.OrderItem`
- [x] Integración con `works.Work`
- [x] Integración con `payments.Payment`
- [x] Tests completos
- [x] Migraciones aplicadas

### 🔮 PENDIENTE - ARTISTS

- [ ] Modelo `ArtistProfile` (existe pero no usado)
- [ ] API específica para artistas
- [ ] Servicios y encargos
- [ ] Sistema de eventos
- [ ] Integración con calendario
- [ ] Modelo de pagos diferente

---

## 📝 Migraciones Actuales (Octubre 2025)

Se realizó una **migración crítica** para corregir referencias incorrectas:

### Antes (Incorrecto)
```python
# shop.Product
artist = ForeignKey('artists.ArtistProfile')  # ❌ WRONG

# orders.OrderItem  
artist = ForeignKey('artists.ArtistProfile')  # ❌ WRONG
```

### Después (Correcto)
```python
# shop.Product
artisan = ForeignKey('artisans.ArtisanProfile')  # ✅ RIGHT

# orders.OrderItem
artisan = ForeignKey('artisans.ArtisanProfile')  # ✅ RIGHT
```

### Archivos de Migración
- `shop/migrations/0002_alter_product_artisan.py`
- `orders/migrations/0002_alter_orderitem_artisan.py`

**Razón:** Los productos y pedidos pertenecen a **artesanos con taller**, no a artistas visuales/performers.

---

## 💡 Razón de la Separación

### ¿Por qué dos modelos?

1. **Modelos de negocio diferentes:**
   - Artesanos = E-commerce tradicional
   - Artistas = Servicios y encargos

2. **Campos diferentes:**
   - Artesanos necesitan: stock, ubicación física, Stripe Connect
   - Artistas necesitan: disciplina, historial exposiciones, disponibilidad eventos

3. **URLs diferentes:**
   - `/artesanos/` vs `/artistas/`
   - Diferentes flujos de usuario

4. **Escalabilidad:**
   - Futuro crecimiento sin afectar código existente
   - Evitar modelo monolítico con todos los casos de uso

5. **Claridad conceptual:**
   - Código más limpio y mantenible
   - Separación de responsabilidades

---

## 🎓 Para Desarrolladores Futuros

### Al trabajar con productos/tienda:
```python
# SIEMPRE usar artisan
from artisans.models import ArtisanProfile

product.artisan  # ✅
order_item.artisan  # ✅
```

### Al trabajar con servicios (futuro):
```python
# ENTONCES usar artist
from artists.models import ArtistProfile

service.artist  # 🔮 FUTURO
commission.artist  # 🔮 FUTURO
```

### En Admin:
```python
# Para productos/pedidos
list_filter = ['artisan']  # ✅
search_fields = ['artisan__display_name']  # ✅

# Para servicios futuros
list_filter = ['artist']  # 🔮 FUTURO
```

---

## 📚 Documentación Actualizada

Este documento es la **fuente de verdad** para la nomenclatura del proyecto.

**Última actualización:** Octubre 25, 2025  
**Autor:** Equipo MiTaller  
**Versión:** 2.0 (Post-migración crítica)

---

## ✅ Checklist de Migración Completada

- [x] Modelos actualizados (`shop.Product.artisan`, `orders.OrderItem.artisan`)
- [x] Admin actualizado (referencias a `artisan`)
- [x] Migraciones generadas y aplicadas
- [x] Tests pasando correctamente
- [x] Documentación actualizada (este archivo)
- [x] READMEs de apps actualizados
- [x] Sin errores de linting

**Status:** ✅ **MIGRACIÓN COMPLETA Y FUNCIONAL**

---

**MiTaller** - Marketplace de artesanía menorquina 🇪🇸

