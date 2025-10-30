---
description: Sincronizar y actualizar documentación crítica del proyecto
---

Eres un asistente especializado en mantener la documentación del proyecto MiTaller.art actualizada.

## 🎯 TU MISIÓN

Analizar el estado actual del proyecto y actualizar la documentación crítica para mantenerla sincronizada con el código.

## 📋 PROCESO DE SINCRONIZACIÓN

### PASO 1: Análisis del Estado Actual

**Ejecuta estos comandos para entender los cambios recientes:**

```bash
# 1. Ver commits recientes (última semana)
git log --oneline --since="1 week ago" --all

# 2. Ver archivos modificados recientemente
git diff --name-status HEAD~10 HEAD

# 3. Verificar versión actual de documentación
head -5 docs/ai-assistants/CONTEXT_FOR_CLAUDE.md | grep "Versión"

# 4. Ver estado de fases en ROADMAP
grep -A 20 "## ✅ TODO LIST" ROADMAP.md
```

### PASO 2: Identificar Cambios Significativos

**Busca evidencia de cambios en:**

#### A. Nuevos módulos Django
```bash
ls backend/ | grep -v "__pycache__" | grep -v "\.py"
```

#### B. Nuevos componentes React
```bash
find frontend/src/components -maxdepth 1 -type d | sort
```

#### C. Nuevos endpoints API
```bash
find backend/*/urls.py -type f -exec grep -l "router.register\|path(" {} \;
```

#### D. Nuevos tipos TypeScript
```bash
ls -la frontend/src/types/*.ts
```

#### E. Cambios en modelos
```bash
find backend/*/models.py -type f -newer docs/ai-assistants/CONTEXT_FOR_CLAUDE.md
```

### PASO 3: Determinar Qué Actualizar

**Según el análisis, identifica:**

| Si encuentras... | Entonces actualiza... |
|-----------------|----------------------|
| Nuevos módulos Django o apps | `CONTEXT_FOR_CLAUDE.md` → Sección "Arquitectura" |
| Nuevos endpoints | `CONTEXT_FOR_CLAUDE.md` → Tabla de Endpoints |
| Nuevos componentes principales | `CONTEXT_FOR_CLAUDE.md` → Catálogo de Archivos |
| Cambios en modelos | `CONTEXT_FOR_CLAUDE.md` → Modelo de Datos |
| Nuevos patrones de código | `.cursorrules` → Sección correspondiente |
| Fase completada | `ROADMAP.md` → Marcar fase como completada |
| Nueva decisión arquitectónica | `CONTEXT_FOR_CLAUDE.md` → Decisiones Arquitectónicas |

### PASO 4: Actualizar Archivos Críticos

#### 🔴 Archivos CRÍTICOS (actualizar siempre):

**1. `docs/ai-assistants/CONTEXT_FOR_CLAUDE.md`**

Actualiza estas secciones si hay cambios:

- **Versión y fecha** (incrementar versión)
- **Changelog** (añadir nueva versión con cambios)
- **Stack Tecnológico** (si hay nuevas librerías)
- **Arquitectura del Monorepo** (si hay nuevas carpetas/módulos)
- **Tabla de Endpoints** (si hay nuevos endpoints)
- **Modelo de Datos** (si hay nuevos campos/relaciones)
- **Catálogo de Archivos Representativos** (si hay archivos nuevos importantes)
- **Próximos Pasos** (actualizar progreso de fases)

**2. `.cursorrules`**

Actualiza si hay:

- Nuevos patrones arquitectónicos
- Nuevas convenciones de código
- Cambios en nomenclatura

**3. `ROADMAP.md`**

Actualiza:

- Estado de fases (marcar completadas)
- Timeline con progreso actual
- Modelo de datos si cambió

**4. `docs/ai-assistants/SETUP_GUIDE.md`**

Actualiza si hay:

- Nuevos comandos slash
- Cambios en workflow
- Nuevas versiones de CONTEXT_FOR_CLAUDE.md (actualizar referencias)

### PASO 5: Verificar Consistencia

**Después de actualizar, verifica:**

```bash
# 1. Versión incrementada
grep "Versión del snapshot:" docs/ai-assistants/CONTEXT_FOR_CLAUDE.md

# 2. Fecha actualizada
grep "Última actualización:" docs/ai-assistants/CONTEXT_FOR_CLAUDE.md

# 3. Changelog tiene nueva entrada
grep -A 10 "## 📝 Changelog" docs/ai-assistants/CONTEXT_FOR_CLAUDE.md
```

## 📊 REPORTE FINAL

**Al finalizar, proporciona un resumen:**

### Cambios detectados desde última actualización:

```
- ✅ [X] nuevos componentes React
- ✅ [X] nuevos endpoints API
- ✅ [X] cambios en modelos
- ✅ [X] fase completada
```

### Archivos actualizados:

```
- ✅ CONTEXT_FOR_CLAUDE.md → v[X.X.X]
- ✅ .cursorrules → [cambios específicos]
- ✅ ROADMAP.md → Fase [X] marcada como completada
- ✅ SETUP_GUIDE.md → Referencias actualizadas
```

### Próxima sincronización recomendada:

```
Ejecutar /sync-docs cuando:
- Completes Fase X
- Añadas módulo Django nuevo
- Implementes feature importante
- O en 2 semanas (mantenimiento regular)
```

## 🎓 PRINCIPIOS DE ACTUALIZACIÓN

### Cuándo INCREMENTAR versión:

- **v[X].0.0** - Fase completa nueva (0→1, 1→2, etc.)
- **v[X].[Y].0** - Features importantes, nuevos módulos
- **v[X].[Y].[Z]** - Correcciones, actualizaciones menores

### Qué incluir en CHANGELOG:

```markdown
### vX.X.X (YYYY-MM-DD) - Título descriptivo

**Features implementadas:**
- ✅ Feature 1 con descripción breve
- ✅ Feature 2 con descripción breve

**Archivos nuevos/actualizados:**
- Backend: lista de archivos
- Frontend: lista de archivos

**Cambios arquitectónicos:**
- Cambio 1
- Cambio 2
```

## 🚀 EJECUCIÓN

**Comienza ahora el proceso de sincronización:**

1. Ejecuta PASO 1 (Análisis)
2. Presenta hallazgos al usuario
3. Pregunta si proceder con actualizaciones
4. Actualiza archivos correspondientes
5. Proporciona reporte final

**¿Comenzamos con el análisis del estado actual?**
