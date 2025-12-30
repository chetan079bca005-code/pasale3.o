from django.urls import path
from .views import SignupView, VerifySignupOtpView, VerifyLoginOtpView, ApiProductView, LoginView, ApiPartyView
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('signup/', SignupView.as_view(), name='user-register'),
    path('login/', LoginView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('verify-signup-otp/', VerifySignupOtpView.as_view(), name='verify-signup-otp'),
    path('verify-login-otp/', VerifyLoginOtpView.as_view(), name='verify-login-otp'),

    path('products/', ApiProductView.as_view(), name='ApiProductView'),
    path('products/<int:product_id>', ApiProductView.as_view(), name='ApiProductView'),

     path('parties/', ApiPartyView.as_view(), name='ApiPartyView'),
    
]