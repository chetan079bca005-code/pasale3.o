from django.contrib.auth.models import User
from rest_framework import serializers
from .models import UserProfile, Product, Party, Customer, Supplier, SupplierInfo

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['phone_no', 'name']

class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'profile']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        profile_data = validated_data.pop('profile')
        user = User.objects.create_user(**validated_data)
        UserProfile.objects.create(user=user, **profile_data)
        return user

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['id', 'user', 'product_name', 'category', 'product_Img', 'unit_price', 'quantity', 'description']

class PartySerializer(serializers.ModelSerializer):
    class Meta:
        model = Party
        fields = "__all__"

class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = "__all__"

class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = "__all__"

class SupplierInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = SupplierInfo
        fields = ['id', 'name', 'email', 'phone_no', 'address', 'company_name',  'pan_number', 'open_balance']