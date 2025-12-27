from django.contrib.auth.models import User
from django.db import models

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    phone_no = models.CharField(max_length=15, blank=True, null=True)
    business_name = models.CharField(max_length=255, blank=True, null=True)
    otp = models.CharField(max_length=6, null=True, blank=True)
    otp_created_at = models.DateTimeField(null=True, blank=True)
    is_verify = models.BooleanField(default=False)
    
    def __str__(self):
        return self.user.username
    
class Category(models.Model):
    id = models.AutoField(primary_key=True)  # Explicit primary key
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True, blank=True)

    def __str__(self):
        return self.name

class Product(models.Model):
    id = models.AutoField(primary_key=True)  # Explicit primary key
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='products')
    product_name = models.CharField(max_length=100)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='products')
    sku = models.CharField(max_length=50, unique=True, default='')
    product_Img = models.CharField(max_length=255, blank=True, null=True)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField()
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.product_name
    
class Party(models.Model):
    id=models.AutoField(primary_key=True)  # Explicit primary key
    user = models.CharField(max_length=100)
    CATEGORY_TYPE_CHOICES = [
        ('individual', 'Individual'),
        ('company', 'Company'),
    ]

    CATEGORY_LEVEL_CHOICES = [
        ('local', 'Local'),
        ('international', 'International'),
    ]
    Category_type=models.CharField(max_length=20,choices=CATEGORY_TYPE_CHOICES)
    Category_level=models.CharField(max_length=20,choices=CATEGORY_LEVEL_CHOICES)
    phone=models.CharField(max_length=20)
    
    def __str__(self):
        return self.user
    