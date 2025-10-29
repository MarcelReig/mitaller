# 🤖 AI Assistants Documentation

Esta carpeta contiene documentación y configuración para trabajar con asistentes de IA en el proyecto.

## 📁 Archivos

### `CONTEXT_FOR_CLAUDE.md`
**Propósito:** Contexto completo del proyecto para Claude Web

Contiene:
- Arquitectura del monorepo (árbol completo)
- Diagrama de flujo JWT con refresh token
- Tabla de endpoints (mapeo FE ↔ BE)
- Decisiones arquitectónicas detalladas
- Modelo de datos completo
- Flujos críticos

**Cuándo usar:** Comparte este archivo con Claude Web cuando necesites explicar el contexto completo del proyecto para tareas complejas.

---

### `SETUP_GUIDE.md`
**Propósito:** Guía completa de configuración y uso de asistentes de IA

Contiene:
- Setup de Cursor (auto-carga `.cursorrules`)
- Setup de Claude Code (slash commands + permissions)
- Setup de Claude Web (compartir contexto)
- Workflows recomendados
- Troubleshooting

**Cuándo usar:** Primera vez configurando asistentes de IA o cuando necesites recordar cómo usar cada herramienta.

---

## ⚙️ Configuración del Proyecto

Los archivos de configuración están en la raíz del proyecto:

- **`.cursorrules`** - Reglas para Cursor IDE (auto-carga)
- **`.claude/`** - Configuración para Claude Code:
  - `settings.local.json` - Permissions (allow/ask/deny)
  - `commands/` - Slash commands personalizados:
    - `/rules` - Carga `.cursorrules`
    - `/context` - Carga `CONTEXT_FOR_CLAUDE.md`
    - `/sync` - Verifica consistencia FE/BE

---

## 🚀 Quick Start

### Para Cursor
1. Abre el proyecto en Cursor
2. `.cursorrules` se carga automáticamente
3. Empieza a trabajar ✅

### Para Claude Code
1. Usa `/rules` para cargar reglas del proyecto
2. Usa `/context` para cargar contexto completo
3. Usa `/sync` para verificar FE/BE están sincronizados

### Para Claude Web
1. Comparte `CONTEXT_FOR_CLAUDE.md` al inicio de la conversación
2. Claude Web entiende todo el proyecto
3. Haz preguntas o pide cambios complejos

---

## 📖 Más Información

Ver `SETUP_GUIDE.md` para instrucciones completas y ejemplos detallados.
