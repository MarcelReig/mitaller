# Scripts de Seeding - Datos de Prueba

Scripts para popular la base de datos con datos de prueba durante desarrollo.

---

## 📋 Scripts Disponibles

### `create_test_data.py`
Crea datos de prueba básicos para el sistema de Orders.

**Crea:**
- 1 Artesano con ArtistProfile
- 2 Productos disponibles para compra
- Muestra IDs para usar en la API

**Uso:**
```bash
python scripts/seeders/create_test_data.py
```

**Credenciales:**
- Email: `artesano@test.com`
- Password: `testpass123`

---

### `create_painter_test_data.py`
Crea un artesano PINTOR completo con portfolio de obras.

**Crea:**
- 1 Pintor (usuario + perfil completo)
- 6 Obras de pintura en su portfolio
- Imágenes de prueba usando Picsum placeholders

**Uso:**
```bash
python scripts/seeders/create_painter_test_data.py
```

**Credenciales:**
- Email: `pintor@test.com`
- Password: `pintor123`
- Username: `maria_pintura`
- Perfil: Maria Soler - Atelier de Pintura

**Obras incluidas:**
1. Paisaje de Menorca
2. Marina al Atardecer
3. Bodegón Mediterráneo
4. Retrato de Mujer
5. Abstracción Azul
6. Calles de Ciutadella

---

## 💡 Cuándo Usar

### Usar estos scripts cuando:
- Inicias desarrollo en una BD limpia
- Necesitas datos de prueba rápidos
- Quieres probar flujos de Orders/Shop
- Necesitas un artista con portfolio para testing frontend
- Estás demostrando funcionalidad a otros devs

### NO usar en:
- Base de datos de producción
- Entornos de staging con datos reales
- Cuando tengas datos reales existentes que no quieras mezclar

---

## 🔧 Características de los Scripts

### Idempotentes
Todos los scripts usan `get_or_create()`:
- Puedes ejecutarlos múltiples veces sin errores
- Si el usuario ya existe, solo muestra la info
- No crea duplicados

### Informativos
Output claro con emojis:
- ✅ Elementos creados
- ℹ️ Elementos que ya existían
- 📧 Credenciales generadas
- 🔗 IDs para usar en APIs

### Datos Realistas
- Nombres de productos/obras realistas
- Imágenes de placeholder consistentes
- Precios y stocks razonables
- Descripciones completas

---

## 📝 Crear Nuevos Scripts de Seeding

### Convenciones

1. **Naming:** `create_*.py` o `seed_*.py`
2. **Estructura:**
   ```python
   #!/usr/bin/env python
   """
   Descripción clara del script.
   
   Crea:
   - Lista de lo que crea
   """
   
   import os
   import django
   
   os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
   django.setup()
   
   # Imports de modelos
   
   def create_data():
       """Función principal."""
       print("🔨 Iniciando...")
       # ... lógica
   
   if __name__ == '__main__':
       create_data()
   ```

3. **Usar `get_or_create()`:** Siempre que sea posible
4. **Prints informativos:** Con emojis y colores
5. **Documentar credenciales:** Al final del output

---

## 🗑️ Limpieza

Para limpiar datos de prueba:

```bash
# Limpiar obras
python scripts/limpiar_obras.py

# O usar Django shell
python manage.py shell
>>> from works.models import Work
>>> Work.objects.all().delete()

# Limpiar usuarios de prueba
>>> from accounts.models import User
>>> User.objects.filter(email__contains='test.com').delete()
```

---

## 🔗 Relacionado

- **Testing Manual:** `/tests/manual/` - Scripts para testing de endpoints
- **Utilidades:** `/scripts/limpiar_obras.py` - Script de limpieza
- **Dev Tools:** `/scripts/dev/` - Herramientas de desarrollo
- **Management Commands:** `/accounts/management/commands/` - Commands de Django

---

**Última actualización:** Octubre 2025

