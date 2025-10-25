#!/usr/bin/env python
"""
Script de testing para verificar el flujo completo de registro y login.
Ejecutar: python test_auth_flow.py
"""

import requests
import json
import sys
from datetime import datetime

# Configuración
BASE_URL = "http://localhost:8000"
API_BASE = f"{BASE_URL}/api/v1/auth"

# Colores para output
class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    RESET = '\033[0m'

def log(message, color=Colors.RESET):
    print(f"{color}{message}{Colors.RESET}")

def log_success(message):
    log(f"✅ {message}", Colors.GREEN)

def log_error(message):
    log(f"❌ {message}", Colors.RED)

def log_info(message):
    log(f"ℹ️  {message}", Colors.BLUE)

def log_warning(message):
    log(f"⚠️  {message}", Colors.YELLOW)

def test_register():
    """Prueba el registro de un nuevo usuario."""
    log_info("TEST 1: Registro de usuario")
    
    # Generar email único con timestamp
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    email = f"test_{timestamp}@test.com"
    username = f"testuser_{timestamp}"
    
    data = {
        "email": email,
        "username": username,
        "password": "Test1234",
        "password_confirm": "Test1234",
        "first_name": "Test",
        "last_name": "User"
    }
    
    log_info(f"Registrando usuario: {email}")
    
    try:
        response = requests.post(f"{API_BASE}/register/", json=data)
        
        if response.status_code == 201:
            log_success(f"Usuario registrado exitosamente: {email}")
            user_data = response.json().get('user', {})
            log_info(f"  - ID: {user_data.get('id')}")
            log_info(f"  - Email: {user_data.get('email')}")
            log_info(f"  - Username: {user_data.get('username')}")
            log_info(f"  - Role: {user_data.get('role')}")
            return email, "Test1234"
        else:
            log_error(f"Error en registro: {response.status_code}")
            log_error(f"Respuesta: {response.json()}")
            return None, None
    except Exception as e:
        log_error(f"Excepción en registro: {str(e)}")
        return None, None

def test_login(email, password):
    """Prueba el login con las credenciales proporcionadas."""
    log_info("\nTEST 2: Login de usuario")
    
    data = {
        "email": email,
        "password": password
    }
    
    log_info(f"Intentando login con: {email}")
    
    try:
        response = requests.post(f"{API_BASE}/login/", json=data)
        
        if response.status_code == 200:
            response_data = response.json()
            access_token = response_data.get('access')
            refresh_token = response_data.get('refresh')
            user = response_data.get('user', {})
            
            log_success(f"Login exitoso para: {email}")
            log_info(f"  - Email en respuesta: {user.get('email')}")
            log_info(f"  - Username: {user.get('username')}")
            log_info(f"  - ID: {user.get('id')}")
            log_info(f"  - Role: {user.get('role')}")
            log_info(f"  - Access token: {access_token[:30]}...")
            
            # VERIFICACIÓN CRÍTICA
            if user.get('email') != email:
                log_error(f"¡ERROR CRÍTICO! Email no coincide:")
                log_error(f"  - Esperado: {email}")
                log_error(f"  - Recibido: {user.get('email')}")
                return None, None
            else:
                log_success(f"✓ Email verificado correctamente")
            
            return access_token, refresh_token
        else:
            log_error(f"Error en login: {response.status_code}")
            log_error(f"Respuesta: {response.json()}")
            return None, None
    except Exception as e:
        log_error(f"Excepción en login: {str(e)}")
        return None, None

def test_profile(access_token, expected_email):
    """Prueba obtener el perfil con el token de acceso."""
    log_info("\nTEST 3: Obtener perfil del usuario")
    
    headers = {
        "Authorization": f"Bearer {access_token}"
    }
    
    try:
        response = requests.get(f"{API_BASE}/profile/", headers=headers)
        
        if response.status_code == 200:
            user = response.json()
            log_success("Perfil obtenido exitosamente")
            log_info(f"  - Email: {user.get('email')}")
            log_info(f"  - Username: {user.get('username')}")
            log_info(f"  - ID: {user.get('id')}")
            
            # VERIFICACIÓN CRÍTICA
            if user.get('email') != expected_email:
                log_error(f"¡ERROR CRÍTICO! Email del perfil no coincide:")
                log_error(f"  - Esperado: {expected_email}")
                log_error(f"  - Recibido: {user.get('email')}")
                return False
            else:
                log_success(f"✓ Email del perfil verificado correctamente")
            
            return True
        else:
            log_error(f"Error al obtener perfil: {response.status_code}")
            log_error(f"Respuesta: {response.json()}")
            return False
    except Exception as e:
        log_error(f"Excepción al obtener perfil: {str(e)}")
        return False

def test_debug_auth(access_token, expected_email):
    """Prueba el endpoint de debugging."""
    log_info("\nTEST 4: Debug de autenticación")
    
    headers = {
        "Authorization": f"Bearer {access_token}"
    }
    
    try:
        response = requests.get(f"{API_BASE}/debug/", headers=headers)
        
        if response.status_code == 200:
            debug_data = response.json()
            user = debug_data.get('user', {})
            
            log_success("Debug obtenido exitosamente")
            log_info(f"  - Email: {user.get('email')}")
            log_info(f"  - Username: {user.get('username')}")
            log_info(f"  - ID: {user.get('id')}")
            log_info(f"  - Role: {user.get('role')}")
            
            # VERIFICACIÓN CRÍTICA
            if user.get('email') != expected_email:
                log_error(f"¡ERROR CRÍTICO! Email del debug no coincide:")
                log_error(f"  - Esperado: {expected_email}")
                log_error(f"  - Recibido: {user.get('email')}")
                return False
            else:
                log_success(f"✓ Email en debug verificado correctamente")
            
            return True
        else:
            log_warning(f"Endpoint de debug no disponible (esto es normal en producción): {response.status_code}")
            return True  # No es un error crítico
    except Exception as e:
        log_warning(f"Endpoint de debug no accesible: {str(e)}")
        return True  # No es un error crítico

def test_logout(access_token, refresh_token):
    """Prueba el logout."""
    log_info("\nTEST 5: Logout")
    
    headers = {
        "Authorization": f"Bearer {access_token}"
    }
    
    data = {
        "refresh": refresh_token
    }
    
    try:
        response = requests.post(f"{API_BASE}/logout/", json=data, headers=headers)
        
        if response.status_code == 205:
            log_success("Logout exitoso")
            return True
        else:
            log_error(f"Error en logout: {response.status_code}")
            log_error(f"Respuesta: {response.json()}")
            return False
    except Exception as e:
        log_error(f"Excepción en logout: {str(e)}")
        return False

def main():
    """Ejecuta todos los tests."""
    log("\n" + "="*60, Colors.BLUE)
    log("  TEST DE FLUJO DE AUTENTICACIÓN", Colors.BLUE)
    log("="*60 + "\n", Colors.BLUE)
    
    # Verificar que el servidor esté corriendo
    try:
        response = requests.get(BASE_URL, timeout=2)
    except:
        log_error("No se puede conectar al servidor. ¿Está corriendo Django en http://localhost:8000?")
        sys.exit(1)
    
    # Ejecutar tests
    email, password = test_register()
    if not email:
        log_error("\n❌ Test de registro falló")
        sys.exit(1)
    
    access_token, refresh_token = test_login(email, password)
    if not access_token:
        log_error("\n❌ Test de login falló")
        sys.exit(1)
    
    if not test_profile(access_token, email):
        log_error("\n❌ Test de perfil falló")
        sys.exit(1)
    
    test_debug_auth(access_token, email)
    
    if not test_logout(access_token, refresh_token):
        log_error("\n❌ Test de logout falló")
        sys.exit(1)
    
    # Resumen
    log("\n" + "="*60, Colors.GREEN)
    log("  ✅ TODOS LOS TESTS PASARON", Colors.GREEN)
    log("="*60 + "\n", Colors.GREEN)
    
    log_success(f"Usuario de prueba creado: {email}")
    log_info("Puedes usar estas credenciales para testing manual:")
    log_info(f"  Email: {email}")
    log_info(f"  Password: {password}")

if __name__ == "__main__":
    main()

