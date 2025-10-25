# Scripts de Desarrollo

Herramientas y scripts auxiliares para facilitar el desarrollo.

---

## 🔧 Scripts Disponibles

### `update_deps.sh`
Script bash para gestión segura de dependencias Python.

**Comandos disponibles:**

```bash
# Ver paquetes desactualizados
./scripts/dev/update_deps.sh outdated

# Actualizar paquete específico
./scripts/dev/update_deps.sh update stripe

# Actualizar TODOS los paquetes (⚠️ cuidado)
./scripts/dev/update_deps.sh update-all

# Instalar nuevo paquete
./scripts/dev/update_deps.sh install pytest

# Verificar dependencias y ejecutar tests
./scripts/dev/update_deps.sh check

# Ver información de un paquete
./scripts/dev/update_deps.sh info django

# Sincronizar con requirements.txt
./scripts/dev/update_deps.sh sync

# Ayuda
./scripts/dev/update_deps.sh help
```

**Características:**
- ✅ Activación automática del venv
- ✅ Regenera `requirements.txt` automáticamente
- ✅ Confirmación antes de operaciones peligrosas
- ✅ Output colorizado
- ✅ Validación de entorno

**Ubicación:** Se ejecuta desde `/backend/`

---

## 💡 Cuándo Usar Cada Script

### `update_deps.sh`

**Usar para:**
- Actualizar una dependencia a nueva versión
- Instalar nueva dependencia al proyecto
- Ver qué paquetes están desactualizados
- Verificar que no hay conflictos de dependencias
- Mantener `requirements.txt` actualizado

**Workflow típico:**
```bash
# 1. Ver qué está desactualizado
./scripts/dev/update_deps.sh outdated

# 2. Actualizar paquete específico
./scripts/dev/update_deps.sh update djangorestframework

# 3. Verificar que todo funciona
./scripts/dev/update_deps.sh check

# 4. Commit del nuevo requirements.txt
git add requirements.txt
git commit -m "chore: actualizar djangorestframework a 3.15.0"
```

---

## 📝 Agregar Nuevos Scripts de Dev

### Convenciones

1. **Tipo de scripts apropiados:**
   - Herramientas de análisis de código
   - Generadores de código
   - Scripts de backup/restore
   - Herramientas de debugging
   - Utilidades de migración

2. **Naming:**
   - Shell scripts: `*.sh`
   - Python scripts: `*.py`
   - Nombres descriptivos: `analyze_models.py`, `backup_db.sh`

3. **Documentación:**
   - Comentario al inicio explicando propósito
   - Help/usage message
   - Ejemplos de uso

4. **Permisos de ejecución:**
   ```bash
   chmod +x scripts/dev/mi_script.sh
   ```

---

## 🚫 Scripts que NO Van Aquí

- **Tests:** Van en `/tests/` o `/tests/manual/`
- **Seeding:** Van en `/scripts/seeders/`
- **Scripts de producción:** Van en `/scripts/` o como management commands
- **Utilidades de limpieza:** Van en `/scripts/`

---

## 🔗 Scripts Relacionados

### En otras ubicaciones

**`/scripts/limpiar_obras.py`**
- Script de utilidades general
- Limpia obras de la BD

**`/scripts/seeders/`**
- Scripts de seeding de datos
- `create_test_data.py`
- `create_painter_test_data.py`

**`/tests/manual/`**
- Scripts de testing manual
- `test_auth_endpoints.py`
- `test_auth_flow.py`

**`/accounts/management/commands/`**
- Django management commands
- `fix_artist_profile.py`

---

## 💡 Tips

### Activar venv automáticamente

Si usas scripts Python en esta carpeta, añade siempre:

```python
#!/usr/bin/env python
import os
import sys
import django

# Asegurarse de estar en el directorio correcto
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BASE_DIR)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()
```

### Shell scripts robustos

```bash
#!/bin/bash
set -e  # Exit on error

# Verificar que estamos en backend/
if [ ! -f "manage.py" ]; then
    echo "Error: Ejecuta desde mitaller/backend/"
    exit 1
fi

# Activar venv si existe
if [ -d "venv" ]; then
    source venv/bin/activate
fi
```

---

**Última actualización:** Octubre 2025

