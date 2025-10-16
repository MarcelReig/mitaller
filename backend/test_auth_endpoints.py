"""
Script de prueba para endpoints de autenticación JWT.
Ejecutar con: python test_auth_endpoints.py

Asegúrate de que el servidor esté corriendo:
python manage.py runserver
"""
import requests
import json
from typing import Dict, Any

BASE_URL = "http://localhost:8000/api/v1/auth"

def print_response(title: str, response: requests.Response):
    """Helper para imprimir respuestas formateadas."""
    print(f"\n{'='*60}")
    print(f"{title}")
    print(f"{'='*60}")
    print(f"Status: {response.status_code}")
    try:
        print(f"Response: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
    except:
        print(f"Response: {response.text}")

def test_register():
    """Prueba el endpoint de registro."""
    url = f"{BASE_URL}/register/"
    data = {
        "email": "test-artesano@example.com",
        "username": "test-artesano",
        "password": "password123",
        "password_confirm": "password123",
        "first_name": "Test",
        "last_name": "Artesano"
    }
    
    response = requests.post(url, json=data)
    print_response("1. REGISTRO DE ARTESANO", response)
    return response

def test_register_validations():
    """Prueba validaciones del registro."""
    url = f"{BASE_URL}/register/"
    
    # Test: Contraseña débil
    data = {
        "email": "test2@example.com",
        "username": "test2",
        "password": "123",  # Muy corta
        "password_confirm": "123",
        "first_name": "Test",
        "last_name": "User"
    }
    response = requests.post(url, json=data)
    print_response("2. VALIDACIÓN: Contraseña débil", response)
    
    # Test: Contraseñas no coinciden
    data = {
        "email": "test3@example.com",
        "username": "test3",
        "password": "password123",
        "password_confirm": "different123",
        "first_name": "Test",
        "last_name": "User"
    }
    response = requests.post(url, json=data)
    print_response("3. VALIDACIÓN: Contraseñas no coinciden", response)
    
    # Test: Username con caracteres inválidos
    data = {
        "email": "test4@example.com",
        "username": "test user!",  # Espacios y caracteres especiales
        "password": "password123",
        "password_confirm": "password123",
        "first_name": "Test",
        "last_name": "User"
    }
    response = requests.post(url, json=data)
    print_response("4. VALIDACIÓN: Username inválido", response)

def test_login(email: str = "test-artesano@example.com", password: str = "password123") -> Dict[str, Any]:
    """Prueba el endpoint de login."""
    url = f"{BASE_URL}/login/"
    data = {
        "email": email,
        "password": password
    }
    
    response = requests.post(url, json=data)
    print_response("5. LOGIN", response)
    
    if response.status_code == 200:
        return response.json()
    return {}

def test_profile(access_token: str):
    """Prueba el endpoint de perfil."""
    url = f"{BASE_URL}/profile/"
    headers = {
        "Authorization": f"Bearer {access_token}"
    }
    
    response = requests.get(url, headers=headers)
    print_response("6. VER PERFIL", response)

def test_update_profile(access_token: str):
    """Prueba actualización de perfil."""
    url = f"{BASE_URL}/profile/"
    headers = {
        "Authorization": f"Bearer {access_token}"
    }
    data = {
        "first_name": "Test Updated",
        "last_name": "Artesano Modified"
    }
    
    response = requests.patch(url, json=data, headers=headers)
    print_response("7. ACTUALIZAR PERFIL", response)

def test_refresh_token(refresh_token: str):
    """Prueba el refresh de token."""
    url = f"{BASE_URL}/token/refresh/"
    data = {
        "refresh": refresh_token
    }
    
    response = requests.post(url, json=data)
    print_response("8. REFRESH TOKEN", response)
    
    if response.status_code == 200:
        return response.json()
    return {}

def test_verify_token(access_token: str):
    """Prueba verificación de token."""
    url = f"{BASE_URL}/token/verify/"
    data = {
        "token": access_token
    }
    
    response = requests.post(url, json=data)
    print_response("9. VERIFICAR TOKEN", response)

def test_logout(access_token: str, refresh_token: str):
    """Prueba el logout."""
    url = f"{BASE_URL}/logout/"
    headers = {
        "Authorization": f"Bearer {access_token}"
    }
    data = {
        "refresh": refresh_token
    }
    
    response = requests.post(url, json=data, headers=headers)
    print_response("10. LOGOUT", response)

def test_access_after_logout(access_token: str):
    """Intenta acceder después del logout."""
    url = f"{BASE_URL}/profile/"
    headers = {
        "Authorization": f"Bearer {access_token}"
    }
    
    response = requests.get(url, headers=headers)
    print_response("11. ACCESO DESPUÉS DE LOGOUT", response)

def main():
    """Ejecuta todos los tests."""
    print("\n" + "="*60)
    print("PRUEBAS DE AUTENTICACIÓN JWT - MITALLER")
    print("="*60)
    
    try:
        # 1. Registro
        test_register()
        
        # 2. Validaciones
        test_register_validations()
        
        # 3. Login
        login_data = test_login()
        
        if not login_data:
            print("\n❌ Login falló. Asegúrate de que el usuario existe.")
            print("   Crea un usuario con: python manage.py createsuperuser")
            print("   O el usuario de prueba necesita aprobación (is_approved=True)")
            return
        
        access_token = login_data.get('access', '')
        refresh_token = login_data.get('refresh', '')
        
        # 4. Ver perfil
        test_profile(access_token)
        
        # 5. Actualizar perfil
        test_update_profile(access_token)
        
        # 6. Verificar token
        test_verify_token(access_token)
        
        # 7. Refresh token
        new_tokens = test_refresh_token(refresh_token)
        new_access = new_tokens.get('access', access_token)
        new_refresh = new_tokens.get('refresh', refresh_token)
        
        # 8. Logout
        test_logout(new_access, new_refresh)
        
        # 9. Intentar acceso después de logout
        # Nota: El access token aún es válido pero el refresh está blacklisted
        test_access_after_logout(new_access)
        
        print("\n" + "="*60)
        print("✅ PRUEBAS COMPLETADAS")
        print("="*60)
        print("\nNotas:")
        print("- El access token sigue válido después de logout")
        print("- El refresh token está en blacklist y no se puede usar")
        print("- Cuando el access expira, no se puede renovar")
        
    except requests.exceptions.ConnectionError:
        print("\n❌ Error: No se puede conectar al servidor")
        print("   Asegúrate de que el servidor esté corriendo:")
        print("   python manage.py runserver")
    except Exception as e:
        print(f"\n❌ Error inesperado: {e}")

if __name__ == "__main__":
    main()

