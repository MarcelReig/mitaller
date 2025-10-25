#!/usr/bin/env python
"""
Script para crear datos de prueba del sistema Orders.

Crea:
- 1 Artesano con ArtistProfile
- 2 Productos disponibles
- Muestra IDs para usar en la API
"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from decimal import Decimal
from accounts.models import User, UserRole
from artists.models import ArtistProfile, CraftType, MenorcaLocation
from shop.models import Product, ProductCategory


def create_test_data():
    """Crear datos de prueba para Orders."""
    
    print("🔨 Creando datos de prueba para Orders...\n")
    
    # 1. Crear artesano
    print("1️⃣ Creando artesano...")
    artist_user, created = User.objects.get_or_create(
        email='artesano@test.com',
        defaults={
            'username': 'artesano_test',
            'role': UserRole.ARTISAN
        }
    )
    
    if created:
        artist_user.set_password('testpass123')
        artist_user.save()
        print(f"   ✅ Usuario creado: {artist_user.email}")
    else:
        print(f"   ℹ️  Usuario ya existe: {artist_user.email}")
    
    # El signal crea automáticamente el ArtistProfile
    artist_profile = artist_user.artist_profile
    artist_profile.display_name = 'Taller de Prueba'
    artist_profile.craft_type = CraftType.CERAMICS
    artist_profile.location = MenorcaLocation.MAO
    artist_profile.save()
    print(f"   ✅ Perfil: {artist_profile.display_name}\n")
    
    # 2. Crear productos
    print("2️⃣ Creando productos...")
    
    product1, created = Product.objects.get_or_create(
        artist=artist_profile,
        name='Cerámica Azul Mediterráneo',
        defaults={
            'description': 'Plato de cerámica artesanal color azul',
            'price': Decimal('45.00'),
            'stock': 10,
            'category': ProductCategory.CERAMICS,
            'thumbnail_url': 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
            'is_active': True
        }
    )
    
    if created:
        print(f"   ✅ Producto 1: {product1.name} (ID: {product1.id})")
        print(f"      Precio: {product1.price} EUR | Stock: {product1.stock}")
    else:
        print(f"   ℹ️  Producto 1 ya existe (ID: {product1.id})")
    
    product2, created = Product.objects.get_or_create(
        artist=artist_profile,
        name='Cerámica Verde Menorquina',
        defaults={
            'description': 'Taza de cerámica artesanal color verde',
            'price': Decimal('28.00'),
            'stock': 15,
            'category': ProductCategory.CERAMICS,
            'thumbnail_url': 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
            'is_active': True
        }
    )
    
    if created:
        print(f"   ✅ Producto 2: {product2.name} (ID: {product2.id})")
        print(f"      Precio: {product2.price} EUR | Stock: {product2.stock}\n")
    else:
        print(f"   ℹ️  Producto 2 ya existe (ID: {product2.id})\n")
    
    # 3. Mostrar ejemplo de uso
    print("=" * 60)
    print("📦 DATOS DE PRUEBA LISTOS")
    print("=" * 60)
    print(f"\n🎨 Artesano: {artist_profile.display_name}")
    print(f"   Email: {artist_user.email}")
    print(f"   Password: testpass123")
    print(f"\n🛍️  Productos disponibles:")
    print(f"   • ID {product1.id}: {product1.name} - {product1.price} EUR (Stock: {product1.stock})")
    print(f"   • ID {product2.id}: {product2.name} - {product2.price} EUR (Stock: {product2.stock})")
    
    print(f"\n\n🚀 EJEMPLO DE USO:")
    print("\n1️⃣  Crear pedido como invitado:")
    print(f"""
curl -X POST http://localhost:8000/api/v1/orders/ \\
  -H "Content-Type: application/json" \\
  -d '{{
    "customer_email": "comprador@test.com",
    "customer_name": "María García",
    "customer_phone": "+34600123456",
    "shipping_address": "Calle Test 123, 1º A",
    "shipping_city": "Maó",
    "shipping_postal_code": "07701",
    "shipping_country": "España",
    "items": [
      {{"product": {product1.id}, "quantity": 2}},
      {{"product": {product2.id}, "quantity": 1}}
    ],
    "notes": "Por favor tocar el timbre"
  }}'
""")
    
    print("\n2️⃣  Ver mis ventas (artesano autenticado):")
    print("""
# Primero obtener token JWT:
curl -X POST http://localhost:8000/api/v1/auth/login/ \\
  -H "Content-Type: application/json" \\
  -d '{"email": "artesano@test.com", "password": "testpass123"}'

# Luego ver ventas:
curl http://localhost:8000/api/v1/orders/my-sales/ \\
  -H "Authorization: Bearer {ACCESS_TOKEN}"
""")
    
    print("\n3️⃣  Listar todos los productos:")
    print("curl http://localhost:8000/api/v1/shop/")
    
    print("\n✅ Todo listo para probar el sistema de Orders!\n")


if __name__ == '__main__':
    create_test_data()

