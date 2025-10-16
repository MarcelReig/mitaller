# 📦 Guía de Gestión de Dependencias

## Problema Común: Downgrade de Paquetes

### ❌ Lo que NO hacer:
```bash
# Tener requirements.txt desactualizado:
requests==2.31.0  # Versión vieja

# Luego hacer:
pip install -r requirements.txt
# → Baja de versión (downgrade) ❌
```

---

## ✅ Solución: Mantener requirements.txt Actualizado

### **Workflow Correcto**

```bash
# 1. Activar entorno virtual
cd mitaller/backend
source venv/bin/activate

# 2a. Instalar nueva dependencia
pip install nueva-libreria==1.0.0

# 2b. O actualizar existente
pip install --upgrade paquete-existente

# 3. Regenerar requirements.txt
pip freeze > requirements.txt

# 4. Commit a git
git add requirements.txt
git commit -m "Add/Update dependencies"
```

---

## 🎯 Estrategias de Versionado

### **Opción 1: Versiones Exactas (Actual)** ✅

**requirements.txt:**
```
Django==5.0.1
djangorestframework==3.14.0
stripe==7.0.0
```

**Ventajas:**
- ✅ Reproducibilidad perfecta
- ✅ Todos los entornos tienen exactamente las mismas versiones
- ✅ No hay sorpresas

**Desventajas:**
- ❌ No recibe actualizaciones de seguridad automáticamente
- ❌ Hay que actualizar manualmente

**Recomendado para:** Producción

---

### **Opción 2: Versiones Compatibles**

**requirements.txt:**
```
Django>=5.0,<5.1
djangorestframework>=3.14,<4.0
stripe>=7.0,<8.0
```

**Ventajas:**
- ✅ Permite actualizaciones de parches (5.0.1, 5.0.2, etc.)
- ✅ Recibe fixes de seguridad
- ✅ No rompe compatibilidad

**Desventajas:**
- ❌ Puede haber pequeñas diferencias entre entornos
- ❌ Necesita testing más robusto

**Recomendado para:** Desarrollo activo

---

### **Opción 3: Versiones Mínimas**

**requirements.txt:**
```
Django>=5.0
djangorestframework>=3.14
stripe>=7.0
```

**Ventajas:**
- ✅ Máxima flexibilidad
- ✅ Siempre usa versiones recientes

**Desventajas:**
- ❌ Puede instalar versiones incompatibles
- ❌ Difícil de reproducir bugs

**Recomendado para:** Proyectos experimentales

---

## 📊 Recomendación para MiTaller.art

Usa **versiones exactas** (como ahora) pero **actualiza regularmente**:

```bash
# Cada 1-2 semanas:
source venv/bin/activate

# Ver paquetes desactualizados
pip list --outdated

# Actualizar paquetes seleccionados
pip install --upgrade django djangorestframework stripe

# Regenerar requirements
pip freeze > requirements.txt

# Ejecutar tests
python manage.py test

# Si todo pasa, commit
git add requirements.txt
git commit -m "Update dependencies"
```

---

## 🔄 Comandos Útiles

### Ver paquetes instalados
```bash
pip list
```

### Ver paquetes desactualizados
```bash
pip list --outdated

# Output ejemplo:
# Package    Version  Latest   Type
# requests   2.31.0   2.32.5   wheel
```

### Actualizar un paquete específico
```bash
pip install --upgrade requests
```

### Actualizar TODOS los paquetes (CUIDADO)
```bash
pip install --upgrade -r requirements.txt
```

### Ver dependencias de un paquete
```bash
pip show stripe
```

### Desinstalar paquete y sus dependencias
```bash
pip uninstall stripe
```

---

## 🛠️ Herramientas Avanzadas (Opcional)

### **pip-tools** (Recomendado para proyectos grandes)

```bash
# Instalar
pip install pip-tools

# Crear requirements.in (versiones flexibles)
cat > requirements.in << EOF
Django>=5.0,<5.1
djangorestframework>=3.14,<4.0
stripe>=7.0,<8.0
EOF

# Compilar a requirements.txt (versiones exactas)
pip-compile requirements.in

# Actualizar todas las dependencias
pip-compile --upgrade requirements.in

# Instalar
pip-sync requirements.txt
```

**Ventajas:**
- ✅ Separa "lo que quieres" (requirements.in) de "lo que tienes" (requirements.txt)
- ✅ Resuelve dependencias automáticamente
- ✅ Más control sobre actualizaciones

---

### **poetry** (Alternativa moderna)

```bash
# Instalar
pip install poetry

# Inicializar (si empiezas desde cero)
poetry init

# Agregar dependencia
poetry add django

# Actualizar dependencia
poetry update django

# Instalar todo
poetry install
```

**Ventajas:**
- ✅ Gestión de dependencias + entorno virtual integrado
- ✅ Lock file automático
- ✅ Publicación a PyPI fácil

**Desventajas:**
- ❌ Cambio grande en el workflow
- ❌ No compatible con requirements.txt tradicional

---

## 📝 Archivos de Dependencias

### **requirements.txt** (Producción)
```
Django==5.0.1
djangorestframework==3.14.0
stripe==7.0.0
...
```

Contiene SOLO lo necesario para ejecutar la app.

### **requirements-dev.txt** (Desarrollo)
```
-r requirements.txt  # Incluye las de producción

pytest==8.0.0
black==24.1.1
flake8==7.0.0
...
```

Contiene herramientas de desarrollo, testing, linting.

**Uso:**
```bash
# Producción
pip install -r requirements.txt

# Desarrollo
pip install -r requirements-dev.txt
```

---

## 🚨 Problemas Comunes y Soluciones

### Problema 1: "Package conflicts"
```bash
# Error: package-a requires package-b<2.0, but you have 2.1

# Solución: Ver conflictos
pip check

# Reinstalar todo limpio
pip uninstall -r requirements.txt -y
pip install -r requirements.txt
```

### Problema 2: "Module not found" después de actualizar
```bash
# Verificar que el paquete está instalado
pip show nombre-paquete

# Reinstalar
pip install --force-reinstall nombre-paquete
```

### Problema 3: Diferentes versiones en dev vs prod
```bash
# Generar requirements.txt en producción
pip freeze > requirements-prod.txt

# Comparar con local
diff requirements.txt requirements-prod.txt

# Sincronizar
pip install -r requirements-prod.txt
pip freeze > requirements.txt
```

---

## ✅ Checklist de Actualización

Antes de actualizar dependencias:

- [ ] Hacer backup / commit actual
- [ ] Leer changelogs de paquetes a actualizar
- [ ] Actualizar en entorno de desarrollo primero
- [ ] Ejecutar suite de tests completa
- [ ] Verificar que no hay deprecation warnings
- [ ] Probar funcionalidades críticas manualmente
- [ ] Actualizar requirements.txt
- [ ] Documentar cambios breaking si los hay
- [ ] Desplegar a staging
- [ ] Monitorear errores
- [ ] Desplegar a producción

---

## 🎯 Resumen para MiTaller.art

### Setup Actual (OK) ✅
```
requirements.txt → Versiones exactas
Actualizado con: pip freeze > requirements.txt
```

### Workflow Recomendado
```bash
# Semanal/Quincenal:
1. pip list --outdated
2. pip install --upgrade [paquetes-seleccionados]
3. pip freeze > requirements.txt
4. python manage.py test
5. git commit -m "Update dependencies"
```

### Actualización de Seguridad Urgente
```bash
# Ejemplo: Vulnerabilidad en requests
pip install --upgrade requests
pip freeze > requirements.txt
python manage.py test
git commit -m "Security: Update requests to 2.32.5"
git push
# Deploy inmediato a producción
```

---

## 📚 Referencias

- [pip User Guide](https://pip.pypa.io/en/stable/user_guide/)
- [pip-tools](https://github.com/jazzband/pip-tools)
- [Poetry](https://python-poetry.org/)
- [Python Packaging Guide](https://packaging.python.org/)

---

**Última actualización:** 2025-10-15
**Estado actual:** requirements.txt con versiones exactas actualizadas ✅

