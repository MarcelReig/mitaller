# 🔐 Guía de Permissions de Claude Code

> **Fecha:** 2025-10-28
> **Archivo de configuración:** `.claude/settings.local.json`

---

## 📋 Índice

1. [¿Qué son las Permissions?](#-qué-son-las-permissions)
2. [Cómo Funcionan](#-cómo-funcionan)
3. [Configuración Actual](#-configuración-actual)
4. [Ejemplos de Uso](#-ejemplos-de-uso)
5. [Cómo Modificar](#-cómo-modificar)
6. [Troubleshooting](#-troubleshooting)

---

## 🎯 ¿Qué son las Permissions?

Las permissions de Claude Code controlan **qué comandos bash puede ejecutar automáticamente** sin pedirte confirmación.

### ¿Por qué existen?

**Seguridad:** Evitar que Claude Code ejecute comandos peligrosos accidentalmente.

**Ejemplo de comando peligroso:**
```bash
rm -rf /  # ❌ Borra todo tu sistema
```

**Ejemplo de comando seguro:**
```bash
git status  # ✅ Solo lee información
```

---

## 🔄 Cómo Funcionan

Claude Code tiene **3 niveles** de permissions:

### 1. ✅ `allow` - Ejecuta automáticamente

**Cuándo usar:** Comandos seguros que ejecutas frecuentemente

```json
"allow": [
  "Bash(git status)",           // ✅ Lee estado git
  "Bash(python manage.py test:*)" // ✅ Ejecuta tests
]
```

**Comportamiento:**
- Claude Code ejecuta SIN preguntar
- Ves el comando en la salida
- Ves el resultado inmediatamente

---

### 2. ❓ `ask` - Pide confirmación

**Cuándo usar:** Comandos que modifican cosas pero necesitas ejecutar

```json
"ask": [
  "Bash(git commit:*)",     // ❓ Commits (modifica git history)
  "Bash(npm install:*)"     // ❓ Instala packages
]
```

**Comportamiento:**
- Claude Code te pregunta: "¿Ejecuto este comando?"
- Tú respondes: sí/no
- Si dices sí, se ejecuta

**Ejemplo en uso:**
```
Claude Code: "Quiero ejecutar: npm install axios
             ¿Lo ejecuto? (yes/no)"

Tú: "yes"

Claude Code: [Ejecuta npm install axios]
```

---

### 3. ❌ `deny` - Bloquea completamente

**Cuándo usar:** Comandos peligrosos que NUNCA quieres ejecutar

```json
"deny": [
  "Bash(rm -rf:*)",           // ❌ Borra archivos recursivamente
  "Bash(git push --force:*)"  // ❌ Force push (peligroso)
]
```

**Comportamiento:**
- Claude Code NO ejecuta
- Ni siquiera pregunta
- Te avisa que está bloqueado

---

## 📊 Configuración Actual

Tu archivo `.claude/settings.local.json` tiene:

### ✅ Allow (48 comandos seguros)

#### Lectura de Archivos
```bash
ls, cat, head, tail, wc, grep, find, pwd, which, tree
```

**Por qué:** Solo leen información, no modifican nada

#### Git - Solo Lectura
```bash
git status
git diff
git log
git show
git branch
```

**Por qué:** Ver estado del repo sin modificar nada

#### Backend Django - Desarrollo
```bash
python manage.py runserver    # ✅ Inicia servidor desarrollo
python manage.py test          # ✅ Ejecuta tests
python manage.py shell         # ✅ Shell interactivo
python manage.py check         # ✅ Verifica configuración
python manage.py showmigrations # ✅ Ve migraciones
```

**Por qué:** Comandos de desarrollo diarios, no modifican base de datos

#### Frontend Next.js - Desarrollo
```bash
npm run dev        # ✅ Inicia servidor desarrollo
npm run build      # ✅ Build de producción
npm run type-check # ✅ Verifica tipos TypeScript
npm run lint       # ✅ Linter
npm test           # ✅ Tests
```

**Por qué:** Comandos de desarrollo, no modifican código

#### Docker - Lectura
```bash
docker ps          # ✅ Ver containers
docker logs        # ✅ Ver logs
docker-compose ps  # ✅ Ver servicios
```

**Por qué:** Solo consultan estado

---

### ❓ Ask (21 comandos que piden confirmación)

#### Git - Modificación
```bash
git add
git commit
git push
git pull
git checkout
git merge
git stash
git reset
```

**Por qué:** Modifican el repositorio, mejor confirmar primero

#### Backend Django - Base de Datos
```bash
python manage.py migrate        # ❓ Aplica migraciones a DB
python manage.py makemigrations # ❓ Crea nuevas migraciones
python manage.py createsuperuser # ❓ Crea admin
python manage.py flush          # ❓ Limpia DB
```

**Por qué:** Modifican la base de datos, quieres revisar antes

#### Package Managers
```bash
pip install
npm install
npm uninstall
```

**Por qué:** Modifican dependencias del proyecto

#### File Operations
```bash
mkdir   # Crear directorio
touch   # Crear archivo
cp      # Copiar
mv      # Mover/Renombrar
```

**Por qué:** Modifican filesystem

#### Docker - Modificación
```bash
docker-compose up
docker-compose down
docker-compose restart
```

**Por qué:** Inician/detienen servicios

---

### ❌ Deny (11 comandos bloqueados)

#### Comandos Destructivos
```bash
rm -rf         # ❌ Borra archivos recursivamente
sudo rm        # ❌ Borra con permisos root
```

**Por qué:** Pueden borrar TODO tu proyecto o sistema

#### Git Peligrosos
```bash
git push --force  # ❌ Sobrescribe historia remota
git push -f
git reset --hard  # ❌ Descarta cambios permanentemente
```

**Por qué:** Pueden perder código de otros desarrolladores

#### Database Destructivos
```bash
python manage.py flush --no-input  # ❌ Borra DB sin confirmar
dropdb                             # ❌ Borra base de datos
DROP DATABASE                      # ❌ SQL directo
```

**Por qué:** Pierdes todos los datos

#### Sistema
```bash
sudo           # ❌ Comandos con privilegios root
chmod 777      # ❌ Permisos inseguros
chown          # ❌ Cambiar dueño de archivos
```

**Por qué:** Pueden comprometer seguridad del sistema

#### Package Managers Global
```bash
npm install -g     # ❌ Instala globalmente
pip install --user # ❌ Instala en usuario
```

**Por qué:** Modifican sistema fuera del proyecto

---

## 💡 Ejemplos de Uso

### Ejemplo 1: Comando Allow (ejecuta automático)

```
Tú: "Ejecuta los tests del backend"

Claude Code: [Ejecuta python manage.py test]
Output:
Running tests...
.................................
Ran 35 tests in 2.3s
OK

Claude Code: "Tests ejecutados ✅ - 35 tests pasaron"
```

**No pregunta** porque `python manage.py test:*` está en `allow`

---

### Ejemplo 2: Comando Ask (pide confirmación)

```
Tú: "Crea una migración para el nuevo campo"

Claude Code: "Voy a ejecutar:
python manage.py makemigrations

¿Ejecuto este comando? (yes/no)"

Tú: "yes"

Claude Code: [Ejecuta]
Migrations for 'accounts':
  accounts/migrations/0003_user_phone.py
    - Add field phone to user

Claude Code: "Migración creada ✅"
```

**Pregunta** porque `makemigrations` está en `ask`

---

### Ejemplo 3: Comando Deny (bloqueado)

```
Tú: "Borra todos los archivos .pyc recursivamente con rm -rf"

Claude Code: "❌ El comando 'rm -rf' está bloqueado
por razones de seguridad.

Alternativa segura:
find . -name '*.pyc' -delete

¿Quieres que ejecute esto en su lugar?"
```

**No ejecuta** porque `rm -rf` está en `deny`

---

### Ejemplo 4: Comando No Configurado

Si Claude Code intenta ejecutar un comando que **no está en ninguna lista**, te pregunta:

```
Claude Code: "Quiero ejecutar: pytest tests/
pero no está en la configuración de permissions.

¿Lo añado a 'allow', 'ask', o lo ejecuto solo esta vez?"
```

**Puedes:**
- Ejecutar solo esta vez (no lo guarda)
- Añadirlo a `allow` (ejecuta siempre)
- Añadirlo a `ask` (pregunta siempre)
- No ejecutar

---

## 🔧 Cómo Modificar

### Añadir Comando a Allow

**Escenario:** Ejecutas `pytest` frecuentemente y quieres que sea automático

**Editar:** `.claude/settings.local.json`

```json
"allow": [
  // ... comandos existentes ...
  "Bash(pytest:*)",  // ← AÑADIR esto
  "Bash(cd backend && pytest:*)"  // ← Y esto
]
```

**Guardar y reiniciar** Claude Code

---

### Mover de Ask a Allow

**Escenario:** `git add` siempre lo apruebas, mejor hacerlo automático

**Antes:**
```json
"ask": [
  "Bash(git add:*)",  // ← Quitar de aquí
  // ...
]
```

**Después:**
```json
"allow": [
  // ... comandos existentes ...
  "Bash(git add:*)"  // ← Mover a allow
]

"ask": [
  // git add ya no está aquí
  // ...
]
```

---

### Bloquear Comando Nuevo

**Escenario:** Quieres bloquear `git rebase` porque prefieres no usarlo

**Añadir a deny:**
```json
"deny": [
  // ... comandos existentes ...
  "Bash(git rebase:*)"  // ← AÑADIR
]
```

---

### Sintaxis de Patterns

#### Wildcards

```json
// ✅ Permite TODOS los comandos git
"Bash(git *)"

// ✅ Permite git status, git log, git show, etc.
// Pero NO git add, git commit (están en ask)
```

#### Argumentos específicos

```json
// ✅ Solo python manage.py test
"Bash(python manage.py test)"

// ✅ python manage.py test CON cualquier argumento
"Bash(python manage.py test:*)"
```

#### Con cd

```json
// Si ejecutas desde root del proyecto:
"Bash(cd backend && python manage.py test:*)"

// Si ejecutas desde backend/:
"Bash(python manage.py test:*)"
```

**Recomendación:** Incluye ambas versiones para máxima flexibilidad

---

## 🐛 Troubleshooting

### Problema 1: Claude Code pide confirmación para comando que está en allow

**Síntoma:**
```
Claude Code: "¿Ejecuto 'python manage.py test'?"
```

Pero `python manage.py test:*` está en `allow`

**Causa:** Pattern no coincide exactamente

**Solución:**

**Opción A:** Añadir versión exacta
```json
"allow": [
  "Bash(python manage.py test:*)",  // Ya existe
  "Bash(python manage.py test)"     // ← Añadir SIN :*
]
```

**Opción B:** Usar wildcard más amplio
```json
"allow": [
  "Bash(python manage.py *)"  // Permite TODOS los manage.py
]
```

---

### Problema 2: Comando bloqueado que necesito ejecutar

**Síntoma:**
```
Claude Code: "❌ Comando bloqueado: git reset"
```

**Solución temporal:**

```
Tú: "Muéstrame el comando sin ejecutarlo"

Claude Code: "El comando sería: git reset HEAD~1"

Tú: [Ejecutas manualmente en terminal]
```

**Solución permanente:** Si realmente necesitas ese comando frecuentemente, muévelo de `deny` a `ask`

---

### Problema 3: Demasiadas confirmaciones

**Síntoma:** Claude Code te pregunta por TODO

**Causa:** Muchos comandos en `ask`, pocos en `allow`

**Solución:** Revisa tu workflow diario y mueve comandos frecuentes a `allow`

**Ejemplo:**

Si ejecutas `npm install` 10 veces al día:

```json
// Mover de:
"ask": ["Bash(npm install:*)"]

// A:
"allow": ["Bash(npm install:*)"]
```

---

### Problema 4: Comando no funciona con cd

**Síntoma:**
```
"Bash(cd backend && python manage.py test)" ✅ Funciona

"Bash(python manage.py test)" ❌ No funciona
```

**Causa:** Estás en root del proyecto, comando espera estar en `backend/`

**Solución:** Incluir ambas variantes

```json
"allow": [
  "Bash(cd backend && python manage.py test:*)",  // Desde root
  "Bash(python manage.py test:*)"                 // Desde backend/
]
```

---

## 📝 Configuración Recomendada por Rol

### Para Desarrollo Solo (tú ahora)

**Allow:** Todo lo seguro (lectura + comandos dev)
**Ask:** Git commits, migrations, npm install
**Deny:** rm -rf, force push, DROP database

✅ **Tu configuración actual es perfecta para desarrollo solo**

---

### Para Trabajo en Equipo

```json
"ask": [
  "Bash(git push:*)",    // Siempre confirmar antes de push
  "Bash(git merge:*)",   // Confirmar antes de merge
  "Bash(git pull:*)"     // Confirmar antes de pull
]
```

---

### Para Producción / Deploy

```json
"deny": [
  "Bash(python manage.py migrate:*)",  // No migrations directas
  "Bash(npm run build:*)",              // Build manual solo
  "Bash(git push:*)"                    // No push directo a prod
]
```

Todo debe ser manual en producción.

---

## 🎯 Mejores Prácticas

### 1. Empieza Conservador

**Regla:** Cuando tengas dudas, usa `ask` en lugar de `allow`

**Por qué:** Siempre puedes mover a `allow` después si te cansas de confirmar

---

### 2. Revisa Cada 2 Semanas

**Pregúntate:**
- ¿Hay comandos en `ask` que apruebo el 100% de las veces?
  → Mover a `allow`

- ¿Hay comandos en `allow` que me dan miedo?
  → Mover a `ask`

---

### 3. Documenta Comandos Raros

Si añades un comando muy específico, añade comentario:

```json
"allow": [
  // Comando para limpiar cache de Cloudinary
  "Bash(python manage.py clear_cloudinary_cache)"
]
```

---

### 4. Nunca Pongas Estos en Allow

```json
// ❌ NUNCA en allow
"Bash(rm:*)"
"Bash(sudo:*)"
"Bash(git push --force:*)"
"Bash(DROP:*)"
```

Estos SIEMPRE en `deny` o máximo en `ask` (pero mejor deny)

---

## 📊 Resumen

Tu configuración actual:

| Categoría | Cantidad | Nivel |
|-----------|----------|-------|
| **Allow** | 48 comandos | ✅ Ejecuta automático |
| **Ask** | 21 comandos | ❓ Pide confirmación |
| **Deny** | 11 comandos | ❌ Bloqueado |

**Balance:** ✅ Seguro y productivo

**Modificaciones futuras:** Mueve comandos entre categorías según tu experiencia

---

## 🔗 Referencias

- **Archivo de config:** `.claude/settings.local.json`
- **Docs oficiales:** https://docs.claude.com/claude-code/permissions
- **Este proyecto:** `docs/ai-assistants/SETUP_GUIDE.md`

---

**Última actualización:** 2025-10-28
