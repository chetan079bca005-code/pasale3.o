from django.contrib.auth.models import User
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.core.mail import send_mail
import random
from .models import Product, UserProfile
from .serializers import ProductSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils import timezone
from datetime import timedelta
from rest_framework.pagination import PageNumberPagination

# OTP Expiry Time (5 minutes)
OTP_EXPIRY_TIME = timedelta(minutes=5)

# -----------------------------
# Signup View
# -----------------------------
class SignupView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')
        phone_no = request.data.get('phone_no')
        business_name = request.data.get('business_name')

        # Create the user
        user = User.objects.create_user(username=username, email=email, password=password)
        user.save()

        # Generate OTP
        otp = str(random.randint(100000, 999999))

        # Create the user profile with OTP and timestamp
        user_profile = UserProfile.objects.create(
            user=user,
            phone_no=phone_no,
            business_name=business_name,
            otp=otp,
            otp_created_at=timezone.now(),
            is_verify=False
        )

        # Send OTP to the user's email
        send_mail(
            'Signup OTP Verification',
            f'Your OTP for signup is {otp}',
            'sushil@fronbase.com.np',
            [email],
            fail_silently=False,
        )

        return Response({'message': 'User created successfully. Please verify the OTP sent to your email.'},
                        status=status.HTTP_201_CREATED)


# -----------------------------
# Verify Signup OTP View
# -----------------------------
class VerifySignupOtpView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        email = request.data.get('email')
        otp_provided = request.data.get('otp', '').strip()

        try:
            user = User.objects.get(email=email.lower())
            user_profile = user.profile
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        except UserProfile.DoesNotExist:
            return Response({'error': 'User profile not found'}, status=status.HTTP_404_NOT_FOUND)

        # Check OTP expiry
        if not user_profile.otp or not user_profile.otp_created_at:
            return Response({'error': 'No OTP found'}, status=status.HTTP_400_BAD_REQUEST)

        if timezone.now() > user_profile.otp_created_at + OTP_EXPIRY_TIME:
            return Response({'error': 'OTP expired'}, status=status.HTTP_400_BAD_REQUEST)

        # Verify OTP
        if str(user_profile.otp) == str(otp_provided):
            user_profile.is_verify = True
            user_profile.otp = None
            user_profile.otp_created_at = None
            user_profile.save()
            return Response({'message': 'Signup OTP verified successfully!'}, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Invalid OTP'}, status=status.HTTP_400_BAD_REQUEST)


# -----------------------------
# Login View
# -----------------------------
class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        email = request.data.get('email')
        password = request.data.get('password')

        try:
            user = User.objects.get(email=email)
            if not user.check_password(password):
                return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        # Generate OTP
        otp = str(random.randint(100000, 999999))

        # Save OTP in user profile with timestamp
        user_profile = user.profile
        user_profile.otp = otp
        user_profile.otp_created_at = timezone.now()
        user_profile.save()

        # Send OTP to the user's email
        send_mail(
            'Login OTP Verification',
            f'Your OTP for login is {otp}',
            'sushil@frontbase.com.np',
            [user.email],
            fail_silently=False,
        )

        return Response({'message': 'OTP sent to your email. Please verify to proceed.'},
                        status=status.HTTP_200_OK)


# -----------------------------
# Verify Login OTP View
# -----------------------------
class VerifyLoginOtpView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        email = request.data.get('email')
        otp_provided = request.data.get('otp', '').strip()

        try:
            user = User.objects.get(email=email)
            user_profile = user.profile
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        except UserProfile.DoesNotExist:
            return Response({'error': 'User profile not found'}, status=status.HTTP_404_NOT_FOUND)

        # Check OTP expiry
        if not user_profile.otp or not user_profile.otp_created_at:
            return Response({'error': 'No OTP found'}, status=status.HTTP_400_BAD_REQUEST)

        if timezone.now() > user_profile.otp_created_at + OTP_EXPIRY_TIME:
            return Response({'error': 'OTP expired'}, status=status.HTTP_400_BAD_REQUEST)

        # Verify OTP
        if str(user_profile.otp) == str(otp_provided):
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)

            # Clear OTP after successful verification
            user_profile.otp = None
            user_profile.otp_created_at = None
            user_profile.save()

            return Response({
                'message': 'Login OTP verified successfully!',
                'refresh': str(refresh),
                'access': access_token
            }, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Invalid OTP'}, status=status.HTTP_400_BAD_REQUEST)


# -----------------------------
# Product API View
# -----------------------------
class ApiProductView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        paginator = PageNumberPagination()
        paginator.page_size = 10
        products = Product.objects.filter(user=request.user)
        result_page = paginator.paginate_queryset(products, request)
        serializer = ProductSerializer(result_page, many=True)
        return paginator.get_paginated_response(serializer.data)

    def post(self, request, *args, **kwargs):
        product_data = request.data.copy()
        product_data['user'] = request.user.id

        if Product.objects.filter(user=request.user, product_name=product_data['product_name']).exists():
            return Response({'error': 'You already have a product with this name.'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = ProductSerializer(data=product_data)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Product created successfully!',
                             'product': serializer.data}, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, *args, **kwargs):
        # Get the product ID from the query parameters
        product_id = request.query_params.get('id')
        if not product_id:
            return Response({'error': 'Product ID is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Convert product_id to an integer
            product_id = int(product_id)

            # Ensure the product exists and belongs to the authenticated user
            product = Product.objects.get(id=product_id, user=request.user)
        except ValueError:
            return Response({'error': 'Invalid Product ID'}, status=status.HTTP_400_BAD_REQUEST)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found or you do not have permission to edit it.'}, status=status.HTTP_404_NOT_FOUND)

        # Update the product with the provided data
        serializer = ProductSerializer(product, data=request.data, partial=True)  # Use partial=True for partial updates
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Product updated successfully!',
                             'product': serializer.data}, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, *args, **kwargs):
        product_id = request.query_params.get('id')  # Get the product ID from the query parameters
        if not product_id:
            return Response({'error': 'Product ID is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            product = Product.objects.get(id=product_id, user=request.user)  # Ensure the product belongs to the user
        except Product.DoesNotExist:
            return Response({'error': 'Product not found or you do not have permission to delete it.'}, status=status.HTTP_404_NOT_FOUND)

        product.delete()
        return Response({'message': 'Product deleted successfully!'}, status=status.HTTP_200_OK)

# class ApiPartyView(APIView):
#     permission_classes = [IsAuthenticated]

#     def post