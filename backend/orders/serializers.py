"""
Serializers para Orders API.

Define serializers para lectura (con datos completos) y escritura
(con validaciones de stock y disponibilidad) de pedidos.
"""

from rest_framework import serializers
from django.db import transaction
from decimal import Decimal
from .models import Order, OrderItem, OrderStatus
from shop.models import Product
from artists.serializers import ArtistProfileBasicSerializer


class OrderItemSerializer(serializers.ModelSerializer):
    """
    Serializer para lectura de OrderItem.
    
    Incluye datos del artesano y producto más el snapshot
    de nombre/precio del momento de compra.
    """
    
    # Nested serializer para mostrar info básica del artesano
    artist = ArtistProfileBasicSerializer(read_only=True)
    
    # Info mínima del producto (FK)
    product = serializers.SerializerMethodField()
    
    class Meta:
        model = OrderItem
        fields = [
            'id',
            'product',
            'artist',
            'product_name',
            'product_price',
            'quantity',
            'subtotal',
            'formatted_subtotal',
            'created_at'
        ]
        read_only_fields = [
            'id',
            'subtotal',
            'formatted_subtotal',
            'created_at'
        ]
    
    def get_product(self, obj: OrderItem) -> dict:
        """Retorna info básica del producto."""
        return {
            'id': obj.product.id,
            'name': obj.product.name,
            'is_available': obj.product.is_available
        }


class OrderItemCreateSerializer(serializers.Serializer):
    """
    Serializer para creación de OrderItem (input del cliente).
    
    Solo requiere product ID y quantity. Los datos de snapshot
    se capturan automáticamente del producto actual.
    
    Validaciones:
    - Producto debe existir y estar disponible
    - Quantity > 0 y <= stock disponible
    """
    
    product = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.filter(is_active=True, stock__gt=0),
        help_text='ID del producto a comprar'
    )
    quantity = serializers.IntegerField(
        min_value=1,
        help_text='Cantidad a comprar (debe ser <= stock)'
    )
    
    def validate_product(self, product: Product) -> Product:
        """
        Validar que el producto esté disponible para venta.
        
        Args:
            product: Instancia del producto
            
        Returns:
            Product validado
            
        Raises:
            ValidationError: Si producto no disponible
        """
        if not product.is_available:
            raise serializers.ValidationError(
                f'El producto "{product.name}" no está disponible para compra'
            )
        return product
    
    def validate_quantity(self, quantity: int) -> int:
        """
        Validar que quantity sea positivo.
        
        La validación de stock se hace en validate() donde tenemos
        acceso tanto a product como quantity.
        
        Args:
            quantity: Cantidad solicitada
            
        Returns:
            Quantity validada
            
        Raises:
            ValidationError: Si quantity <= 0
        """
        if quantity <= 0:
            raise serializers.ValidationError(
                'La cantidad debe ser mayor a 0'
            )
        return quantity
    
    def validate(self, data: dict) -> dict:
        """
        Validación a nivel de objeto para verificar stock disponible.
        
        Args:
            data: Datos validados a nivel de campo
            
        Returns:
            Datos validados
            
        Raises:
            ValidationError: Si quantity > stock
        """
        product = data['product']
        quantity = data['quantity']
        
        if quantity > product.stock:
            raise serializers.ValidationError({
                'quantity': f'Stock insuficiente. Disponible: {product.stock} unidades'
            })
        
        return data


class OrderSerializer(serializers.ModelSerializer):
    """
    Serializer para lectura de Order completo.
    
    Incluye todos los datos del pedido más los items nested
    con sus productos y artesanos.
    """
    
    items = OrderItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = Order
        fields = [
            'id',
            'order_number',
            'customer_email',
            'customer_name',
            'customer_phone',
            'shipping_address',
            'shipping_city',
            'shipping_postal_code',
            'shipping_country',
            'status',
            'total_amount',
            'formatted_total',
            'items',
            'notes',
            'created_at',
            'updated_at'
        ]
        read_only_fields = [
            'id',
            'order_number',
            'total_amount',
            'formatted_total',
            'created_at',
            'updated_at'
        ]


class OrderCreateSerializer(serializers.Serializer):
    """
    Serializer para creación de Order (checkout).
    
    Maneja creación transaccional de Order + OrderItems con:
    1. Validación de items y stock
    2. Creación atómica de orden e items
    3. Snapshot automático de producto (nombre/precio)
    4. Reducción automática de stock
    5. Cálculo de total_amount
    
    IMPORTANTE: Usa transacción atómica para garantizar consistencia.
    Si falla algo (ej: stock insuficiente), se hace rollback completo.
    """
    
    # Datos del comprador invitado
    customer_email = serializers.EmailField(
        help_text='Email del comprador para confirmación'
    )
    customer_name = serializers.CharField(
        max_length=200,
        help_text='Nombre completo del comprador'
    )
    customer_phone = serializers.CharField(
        max_length=20,
        required=False,
        allow_blank=True,
        help_text='Teléfono opcional de contacto'
    )
    
    # Dirección de envío
    shipping_address = serializers.CharField(
        help_text='Dirección completa de envío'
    )
    shipping_city = serializers.CharField(
        max_length=100,
        help_text='Ciudad o población'
    )
    shipping_postal_code = serializers.CharField(
        max_length=20,
        help_text='Código postal'
    )
    shipping_country = serializers.CharField(
        max_length=100,
        default='España',
        help_text='País de envío'
    )
    
    # Items del carrito
    items = OrderItemCreateSerializer(
        many=True,
        help_text='Lista de productos y cantidades'
    )
    
    # Notas opcionales
    notes = serializers.CharField(
        required=False,
        allow_blank=True,
        help_text='Notas adicionales para el pedido'
    )
    
    def validate_items(self, items: list) -> list:
        """
        Validar que la lista de items no esté vacía.
        
        Args:
            items: Lista de items validados
            
        Returns:
            Items validados
            
        Raises:
            ValidationError: Si lista vacía
        """
        if not items:
            raise serializers.ValidationError(
                'El pedido debe contener al menos un producto'
            )
        return items
    
    @transaction.atomic
    def create(self, validated_data: dict) -> Order:
        """
        Crear Order con OrderItems en transacción atómica.
        
        Proceso:
        1. Extraer items del payload
        2. Crear Order con datos del comprador
        3. Para cada item:
           - Capturar snapshot del producto (nombre, precio, artesano)
           - Crear OrderItem
           - Reducir stock del producto
           - Acumular subtotal
        4. Actualizar total_amount del Order
        5. Commit transacción (o rollback si falla algo)
        
        La transacción atómica garantiza que:
        - O se crea todo correctamente
        - O no se crea nada (rollback)
        - No puede haber inconsistencia en stock
        
        Args:
            validated_data: Datos validados del serializer
            
        Returns:
            Order creado con items
            
        Raises:
            ValidationError: Si falla alguna validación
            IntegrityError: Si falla DB constraint
        """
        # Extraer items (no van en Order.create())
        items_data = validated_data.pop('items')
        
        # Crear Order con datos del comprador
        order = Order.objects.create(**validated_data)
        
        # Variable para acumular total
        total_amount = Decimal('0.00')
        
        # Crear OrderItems
        for item_data in items_data:
            product = item_data['product']
            quantity = item_data['quantity']
            
            # Capturar snapshot del producto en este momento
            product_name = product.name
            product_price = product.price
            artist = product.artist
            
            # Crear OrderItem con snapshot
            order_item = OrderItem.objects.create(
                order=order,
                product=product,
                artist=artist,
                product_name=product_name,
                product_price=product_price,
                quantity=quantity
                # subtotal se calcula automáticamente en save()
            )
            
            # Reducir stock del producto
            product.stock -= quantity
            product.save(update_fields=['stock'])
            
            # Acumular total
            total_amount += order_item.subtotal
        
        # Actualizar total del pedido
        order.total_amount = total_amount
        order.save(update_fields=['total_amount'])
        
        return order

