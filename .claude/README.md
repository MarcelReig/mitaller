# 🤖 Claude Code Configuration

Esta carpeta contiene la configuración para **Claude Code** (CLI oficial de Anthropic).

## 📁 Estructura

```
.claude/
├── README.md                   # Este archivo
├── settings.local.json         # Tu configuración personal (NO en git)
├── settings.example.json       # Plantilla de configuración (en git)
├── PERMISSIONS_GUIDE.md        # Guía detallada de permissions
└── commands/                   # Slash commands personalizados
    ├── rules.md                # /rules - Carga .cursorrules
    ├── context.md              # /context - Carga contexto completo
    └── sync.md                 # /sync - Verifica FE/BE
```

## 🚀 Setup Inicial

### 1. Crear tu configuración personal

```bash
# Copia el archivo de ejemplo
cp .claude/settings.example.json .claude/settings.local.json

# Edita si necesitas personalizar algo (opcional)
# vim .claude/settings.local.json
```

### 2. Reinicia Claude Code

```bash
# Cierra y vuelve a abrir Claude Code
# o ejecuta desde el directorio del proyecto
```

### 3. Prueba los slash commands

```bash
# En Claude Code:
/rules      # Carga reglas del proyecto
/context    # Carga contexto completo
/sync       # Verifica consistencia FE/BE
```

## ⚙️ settings.local.json

Configura qué comandos bash puede ejecutar Claude Code:

- **`allow`** (48 comandos) - Ejecuta automáticamente sin preguntar
- **`ask`** (21 comandos) - Pide confirmación antes de ejecutar
- **`deny`** (11 comandos) - Bloqueados completamente

Ver guía completa: `PERMISSIONS_GUIDE.md`

## 🎮 Slash Commands

### `/rules`
Carga las reglas del proyecto (`.cursorrules`)

**Cuándo usar:** Al inicio de cada sesión o cuando necesites recordar las convenciones

### `/context`
Carga el contexto completo del proyecto (`docs/ai-assistants/CONTEXT_FOR_CLAUDE.md`)

**Cuándo usar:** Para tareas arquitectónicas complejas o cuando necesites entender el panorama completo

### `/sync`
Verifica que Frontend y Backend estén sincronizados

**Cuándo usar:** Después de cambios en modelos, serializers o endpoints

## 📖 Más Información

- **Setup completo:** `docs/ai-assistants/SETUP_GUIDE.md`
- **Guía de permissions:** `.claude/PERMISSIONS_GUIDE.md`
- **Reglas del proyecto:** `.cursorrules` (raíz)
- **Contexto completo:** `docs/ai-assistants/CONTEXT_FOR_CLAUDE.md`

## ⚠️ Importante

- `settings.local.json` está en `.gitignore` (configuración personal)
- `settings.example.json` está en git (plantilla para el equipo)
- Si trabajas en equipo, cada desarrollador debe copiar `settings.example.json` → `settings.local.json`
