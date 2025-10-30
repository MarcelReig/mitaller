# 🤖 Mejores Prácticas para Workflow con IA

> **Fecha:** 2025-10-30
> **Versión:** 1.0
> **Para:** Desarrollo con Claude Code, Cursor y Claude Web

---

## 📋 Índice

1. [Sistema Actual](#sistema-actual)
2. [Mejoras Implementadas Hoy](#mejoras-implementadas-hoy)
3. [Sugerencias Adicionales](#sugerencias-adicionales)
4. [Comandos Disponibles](#comandos-disponibles)
5. [Workflow Optimizado](#workflow-optimizado)
6. [Anti-Patrones a Evitar](#anti-patrones-a-evitar)

---

## 🎯 Sistema Actual

### Herramientas Configuradas

| Herramienta | Uso | Contexto | Comandos |
|-------------|-----|----------|----------|
| **Claude Code** | Desarrollo y refactorización | `/rules`, `/context` | `/rules`, `/context`, `/sync`, `/sync-docs` |
| **Cursor** | Edición rápida | Automático (`.cursorrules`) | N/A |
| **Claude Web** | Planificación y decisiones | Project Knowledge | N/A |

### Documentación Clave

```
.cursorrules                                    # 🔴 CRÍTICO - Reglas del día a día
docs/ai-assistants/CONTEXT_FOR_CLAUDE.md       # 🔴 CRÍTICO - Contexto profundo
docs/ai-assistants/SETUP_GUIDE.md              # 🟡 IMPORTANTE - Guía de uso
ROADMAP.md                                      # 🔴 CRÍTICO - Plan de desarrollo
docs/DOCS_ANALYSIS.md                           # 📊 NUEVO - Análisis de docs
```

---

## ✅ Mejoras Implementadas Hoy

### 1. Comando `/sync-docs` - Actualización Automática de Documentación

**Qué hace:**
- Analiza cambios recientes en el proyecto (commits, archivos nuevos, módulos)
- Identifica qué documentación debe actualizarse
- Sugiere actualizaciones específicas
- Actualiza versiones y changelogs automáticamente

**Cuándo usar:**
```bash
# Después de completar una feature importante
/sync-docs

# Al finalizar una fase del ROADMAP
/sync-docs

# Mantenimiento regular (cada 2 semanas)
/sync-docs
```

**Beneficios:**
- ✅ Documentación siempre actualizada
- ✅ No olvidas actualizar archivos críticos
- ✅ Changelog automático generado
- ✅ Versionado consistente

### 2. Análisis Completo de Documentación

**Archivo creado:** `docs/DOCS_ANALYSIS.md`

**Qué contiene:**
- Clasificación de 97 archivos .md del proyecto
- Identificación de archivos críticos vs obsoletos
- Recomendaciones de limpieza
- Guía de qué actualizar y cuándo

**Beneficios:**
- ✅ Claridad sobre qué documentar
- ✅ Eliminar redundancia
- ✅ Mantener proyecto limpio y mantenible

---

## 💡 Sugerencias Adicionales

### 🚀 Nivel 1: Optimizaciones Inmediatas (Implementar Ya)

#### 1.1. Crear Comando `/feature` - Iniciar Nueva Feature

**Propósito:** Template automático para documentar nuevas features.

**Uso:**
```bash
/feature "Sistema de notificaciones"
```

**Qué debería hacer:**
1. Crear archivo en `docs/features/SISTEMA_NOTIFICACIONES.md` usando template
2. Añadir sección en ROADMAP.md si no existe
3. Crear checklist de tareas
4. Proporcionar estructura de archivos a crear

**Ejemplo de output:**
```markdown
# 📋 Feature: Sistema de Notificaciones

## 🎯 Objetivo
[Descripción]

## 📦 Archivos a crear/modificar
- [ ] backend/notifications/models.py
- [ ] backend/notifications/views.py
- [ ] frontend/src/types/notification.ts
- [ ] frontend/src/components/notifications/

## ✅ Checklist
- [ ] Backend: Modelo Notification
- [ ] Backend: Endpoint GET /api/v1/notifications/
- [ ] Frontend: Tipos TypeScript
- [ ] Frontend: Componente NotificationBell
- [ ] Tests: Unit tests backend
- [ ] Docs: Actualizar CONTEXT_FOR_CLAUDE.md
```

#### 1.2. Crear Comando `/commit` - Commits Inteligentes

**Propósito:** Generar mensaje de commit basado en cambios realizados.

**Uso:**
```bash
/commit
```

**Qué debería hacer:**
1. Analizar `git diff --staged`
2. Identificar tipo de cambio (feat, fix, refactor, docs)
3. Generar mensaje siguiendo Conventional Commits
4. Incluir scope apropiado
5. Proponer el commit o preguntar confirmación

**Ejemplo:**
```bash
# Detecta que cambiaste artisans/models.py y types/artisan.ts
/commit

# Output:
feat(artisans): add pickup_instructions field to ArtisanProfile

- Add pickup_instructions TextField to ArtisanProfile model
- Update ArtisanSerializer to include new field
- Update Artisan type in frontend with pickup_instructions
- Run migration 0004_artisanprofile_pickup_instructions

¿Proceder con este commit? (y/n)
```

#### 1.3. Alias de Comandos Frecuentes

**Crear aliases cortos para comandos largos:**

```bash
# En .claude/commands/r.md (alias de rules)
---
description: Alias corto para /rules
---
Ejecuta el comando /rules para cargar las reglas del proyecto.
```

```bash
# En .claude/commands/c.md (alias de context)
---
description: Alias corto para /context
---
Ejecuta el comando /context para cargar el contexto completo.
```

**Beneficio:** Velocidad. `/r` en lugar de `/rules`.

---

### 🔥 Nivel 2: Automatizaciones Avanzadas (Implementar en 1-2 semanas)

#### 2.1. Pre-commit Hook con Verificación de Docs

**Propósito:** Recordarte actualizar docs antes de commit.

**Implementación:**
```bash
# .git/hooks/pre-commit
#!/bin/bash

# Detectar si hay cambios en backend/*/models.py
if git diff --cached --name-only | grep -q "backend/.*/models.py"; then
  echo "⚠️  Detectados cambios en modelos. ¿Actualizaste los tipos TypeScript?"
  echo "   Ejecuta: /sync para verificar"
  read -p "¿Continuar? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi

# Detectar si ROADMAP.md fue modificado pero CONTEXT_FOR_CLAUDE no
if git diff --cached --name-only | grep -q "ROADMAP.md"; then
  if ! git diff --cached --name-only | grep -q "CONTEXT_FOR_CLAUDE.md"; then
    echo "⚠️  ROADMAP.md cambió pero CONTEXT_FOR_CLAUDE.md no."
    echo "   ¿Necesitas sincronizar? Ejecuta: /sync-docs"
  fi
fi
```

#### 2.2. GitHub Action para Verificar Documentación

**Propósito:** CI que verifica que documentación está actualizada.

**Ejemplo `.github/workflows/docs-check.yml`:**
```yaml
name: Docs Check

on: [pull_request]

jobs:
  check-docs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Check CONTEXT version updated
        run: |
          # Verificar que versión de CONTEXT aumentó si hay cambios significativos
          if git diff origin/main --name-only | grep -E "backend/.*/(models|views).py|frontend/src/types"; then
            VERSION=$(grep "Versión del snapshot:" docs/ai-assistants/CONTEXT_FOR_CLAUDE.md)
            echo "Found changes in models/views/types"
            echo "Current CONTEXT version: $VERSION"
            echo "⚠️  Remember to update CONTEXT_FOR_CLAUDE.md version"
          fi
```

#### 2.3. Template de PR con Checklist de Docs

**Archivo:** `.github/pull_request_template.md`

```markdown
## 📝 Descripción

[Describe los cambios]

## 🔄 Tipo de cambio

- [ ] 🐛 Bug fix
- [ ] ✨ Nueva feature
- [ ] ♻️ Refactorización
- [ ] 📝 Solo documentación

## ✅ Checklist

### Código
- [ ] Tests pasan
- [ ] Linter pasa
- [ ] No hay console.logs

### Documentación (si aplica)
- [ ] Actualicé CONTEXT_FOR_CLAUDE.md si añadí módulos/endpoints
- [ ] Actualicé .cursorrules si añadí patrones nuevos
- [ ] Actualicé ROADMAP.md si completé una fase
- [ ] Ejecuté /sync para verificar consistencia FE/BE

### Si cambié backend:
- [ ] Actualicé serializers
- [ ] Actualicé tipos TypeScript correspondientes
- [ ] Ejecuté /sync para confirmar sincronización

## 📸 Screenshots (si aplica)

[Añade screenshots de UI changes]
```

---

### 🎓 Nivel 3: Mejoras de Proceso (Pensar a Medio Plazo)

#### 3.1. Sesiones de "Documentation Day"

**Frecuencia:** Cada viernes o cada 2 semanas

**Qué hacer:**
1. Ejecutar `/sync-docs`
2. Revisar archivos obsoletos en `docs/`
3. Archivar documentación completada
4. Actualizar guías si hay nuevos patrones
5. Limpiar TODOs antiguos

**Tiempo:** 30-60 minutos

**Beneficio:** Documentación nunca se desactualiza más de 2 semanas.

#### 3.2. Grabaciones de Decisiones Arquitectónicas (ADRs)

**Propósito:** Documentar el "por qué" de decisiones importantes.

**Formato:** `docs/architecture/adr/YYYY-MM-DD-titulo.md`

**Template:**
```markdown
# ADR-001: Uso de Route Groups en Next.js

**Fecha:** 2025-10-30
**Estado:** Aceptado
**Decisores:** [Tu nombre]

## Contexto
Necesitábamos organizar mejor las rutas del frontend...

## Decisión
Usar Route Groups pattern de Next.js 15...

## Consecuencias
Positivas:
- Layouts específicos por área
- Mejor organización

Negativas:
- Requiere Next.js 15+
```

#### 3.3. Sistema de "Living Documentation"

**Idea:** Documentación que se valida contra el código.

**Ejemplo:** Script que verifica que endpoints en CONTEXT_FOR_CLAUDE coinciden con urls.py

```python
# scripts/verify_docs.py
import re

def check_endpoints_documented():
    # Leer endpoints de urls.py
    # Leer tabla de endpoints de CONTEXT_FOR_CLAUDE.md
    # Comparar y reportar diferencias
    pass
```

---

## 📚 Comandos Disponibles

### Actuales

| Comando | Propósito | Cuándo usar |
|---------|-----------|-------------|
| `/rules` | Cargar reglas del proyecto | Inicio de sesión |
| `/context` | Cargar contexto profundo | Decisiones arquitectónicas |
| `/sync` | Verificar consistencia FE/BE | Después de cambios en backend |
| `/sync-docs` | Actualizar documentación | Después de features importantes |

### Propuestos (Implementar)

| Comando | Propósito | Prioridad |
|---------|-----------|-----------|
| `/feature [nombre]` | Template para nueva feature | 🔴 Alta |
| `/commit` | Generar mensaje de commit | 🔴 Alta |
| `/r` | Alias de /rules | 🟡 Media |
| `/c` | Alias de /context | 🟡 Media |
| `/arch` | Ver decisiones arquitectónicas | 🟢 Baja |
| `/clean` | Sugerir archivos a archivar | 🟢 Baja |

---

## 🔄 Workflow Optimizado Completo

### 🌅 Inicio del Día / Sesión

```bash
# 1. Cargar contexto
/rules

# 2. Ver estado del proyecto
git status
git log --oneline -5

# 3. Revisar TODOs pendientes
grep -r "TODO\|FIXME" backend frontend
```

### 💻 Durante Desarrollo de Feature

```bash
# 1. Iniciar feature (propuesto)
/feature "Nombre de la feature"

# 2. Desarrollar con Cursor o Claude Code
# Cursor lee .cursorrules automáticamente

# 3. Verificar consistencia regularmente
/sync
```

### ✅ Al Completar Feature

```bash
# 1. Verificar que todo está sincronizado
/sync

# 2. Actualizar documentación
/sync-docs

# 3. Commit con mensaje generado (propuesto)
/commit

# 4. Push y crear PR
git push
```

### 🔚 Fin de Sprint / Fase

```bash
# 1. Ejecutar sincronización completa
/sync-docs

# 2. Revisar y archivar docs obsoletos
# Ver docs/DOCS_ANALYSIS.md

# 3. Actualizar ROADMAP con progreso
# Marcar fases completadas

# 4. Commit de documentación
git add docs/ .cursorrules ROADMAP.md
git commit -m "docs: actualizar documentación post-Fase X"
```

---

## ⚠️ Anti-Patrones a Evitar

### ❌ NO HAGAS

1. **Actualizar código sin actualizar docs**
   ```
   ❌ Añadir endpoint nuevo → Commit
   ✅ Añadir endpoint nuevo → Actualizar CONTEXT → Commit
   ```

2. **Dejar TODOs sin contexto**
   ```
   ❌ // TODO: Fix this
   ✅ // TODO(2025-10-30): Refactorizar para usar nuevo patrón multi-vendor
   ```

3. **Documentación desincronizada**
   ```
   ❌ CONTEXT dice v2.1.0 pero ROADMAP dice Fase 2
   ✅ Ejecutar /sync-docs antes de commits importantes
   ```

4. **Commits sin contexto**
   ```
   ❌ git commit -m "fix stuff"
   ✅ git commit -m "fix(auth): resolve logout redirect to /login issue"
   ```

5. **No consultar decisiones pasadas**
   ```
   ❌ ¿Por qué usamos REST? → Googlear
   ✅ ¿Por qué usamos REST? → /context → Sección "Decisiones Arquitectónicas"
   ```

### ✅ SÍ HAGAS

1. **Usa comandos slash frecuentemente**
   - `/rules` al inicio de cada sesión
   - `/sync` después de cambios en backend
   - `/sync-docs` después de features importantes

2. **Mantén documentación viva**
   - Actualiza CONTEXT_FOR_CLAUDE.md cada fase completada
   - Archiva documentación obsoleta mensualmente
   - Revisa guías trimestralmente

3. **Documenta el "por qué", no el "qué"**
   ```typescript
   ✅ // Usamos debounce de 500ms para evitar requests excesivos durante ajuste de cantidad
   ❌ // Debounce de 500ms
   ```

4. **Usa el análisis de docs**
   - Consulta `docs/DOCS_ANALYSIS.md` antes de crear nuevos docs
   - Evita duplicar documentación existente
   - Mantén estructura consistente

---

## 📊 Métricas de Éxito

### Cómo saber si tu workflow con IA es bueno:

✅ **Documentación actualizada:**
- CONTEXT_FOR_CLAUDE.md tiene menos de 2 semanas de antigüedad
- Versión de CONTEXT coincide con estado real del proyecto
- ROADMAP refleja fases completadas correctamente

✅ **Comandos usados regularmente:**
- `/rules` al menos 1 vez por sesión
- `/sync` después del 80% de cambios en backend
- `/sync-docs` después del 100% de features importantes

✅ **Código limpio:**
- No hay archivos obsoletos en carpetas principales
- Docs archivados en `docs/archive/`
- READMEs actualizados en módulos principales

✅ **Decisiones documentadas:**
- Cambios arquitectónicos tienen explicación en CONTEXT
- Problemas resueltos documentados en troubleshooting/
- Patrones nuevos añadidos a .cursorrules

---

## 🎯 Próximos Pasos

### Esta Semana

- [ ] Probar `/sync-docs` después de completar próxima feature
- [ ] Limpiar archivos obsoletos según `docs/DOCS_ANALYSIS.md`
- [ ] Crear carpeta `docs/archive/2025-10/`

### Este Mes

- [ ] Implementar comando `/feature`
- [ ] Implementar comando `/commit`
- [ ] Crear aliases `/r` y `/c`
- [ ] Setup pre-commit hook para verificación de docs

### Este Trimestre

- [ ] Implementar GitHub Action para docs check
- [ ] Crear template de PR con checklist
- [ ] Establecer "Documentation Day" semanal
- [ ] Revisar y actualizar todas las guías

---

## 📞 Consultas Rápidas

**¿Cuándo uso cada herramienta?**
- **Planificación/Decisiones:** Claude Web
- **Desarrollo/Refactorización:** Claude Code
- **Edición rápida:** Cursor

**¿Cuándo actualizo documentación?**
- Después de cada feature importante
- Al completar cada fase
- Mantenimiento cada 2 semanas

**¿Qué comando uso?**
- Inicio sesión: `/rules`
- Decisión arquitectónica: `/context`
- Cambié backend: `/sync`
- Completé feature: `/sync-docs`

---

**🎉 Con este sistema, tu documentación siempre estará actualizada y tu trabajo con IA será mucho más eficiente.**
