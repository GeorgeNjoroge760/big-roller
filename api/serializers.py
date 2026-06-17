from rest_framework import serializers
from django.contrib.auth.models import User
from users.models import UserProfile
from products.models import Category, Product
from orders.models import Order, OrderItem
from payments.models import Payment
from notifications.models import Notification


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['role', 'phone', 'employee_id']


class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'profile']


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'


class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    stock_status = serializers.CharField(read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'description', 'price', 'stock',
            'min_stock_level', 'image', 'is_available',
            'category', 'category_name', 'stock_status',
            'created_at', 'updated_at',
        ]


class ProductMinSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['id', 'name', 'price']


class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_price = serializers.DecimalField(source='product.price', max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'product_price', 'quantity', 'unit_price', 'subtotal']
        read_only_fields = ['subtotal']


class OrderItemWriteSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1)


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    waiter_name = serializers.SerializerMethodField()
    counter_name = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'customer_name', 'status',
            'total_amount', 'notes', 'waiter', 'waiter_name',
            'counter_attendant', 'counter_name',
            'items', 'created_at', 'updated_at',
            'claimed_at', 'preparing_at', 'ready_at',
            'picked_up_at', 'delivered_at',
        ]
        read_only_fields = ['order_number', 'status', 'total_amount', 'created_at', 'updated_at']

    def get_waiter_name(self, obj):
        return obj.waiter.username if obj.waiter else None

    def get_counter_name(self, obj):
        return obj.counter_attendant.username if obj.counter_attendant else None


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ['id', 'order', 'amount', 'method', 'status', 'transaction_ref', 'paid_at']
        read_only_fields = ['paid_at']


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'title', 'message', 'notification_type', 'is_read', 'link', 'created_at']


class PlaceOrderSerializer(serializers.Serializer):
    customer_name = serializers.CharField(default='Walk-in Customer')
    notes = serializers.CharField(default='', allow_blank=True)
    items = OrderItemWriteSerializer(many=True)
