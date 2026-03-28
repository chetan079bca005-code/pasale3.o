from django.urls import path
from .views import SignupView, VerifySignupOtpView, VerifyLoginOtpView, ApiProductView, LoginView, ApiPartyView, ApiExpenseView, ApiBillingView, SettingsView, ProfileSettingsView
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('signup/', SignupView.as_view(), name='user-register'),
    path('login/', LoginView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('verify-signup-otp/', VerifySignupOtpView.as_view(), name='verify-signup-otp'),
    path('verify-login-otp/', VerifyLoginOtpView.as_view(), name='verify-login-otp'),
    path('settings/', SettingsView.as_view(), name='user-settings'),
    path('settings/profile/', ProfileSettingsView.as_view(), name='user-settings-profile'),

    path('products/', ApiProductView.as_view(), name='ApiProductView'),
    path('products/<int:product_id>', ApiProductView.as_view(), name='ApiProductView'),

    path('parties/', ApiPartyView.as_view(), name='ApiPartyView'),
    path('parties/<int:party_id>', ApiPartyView.as_view(), name='ApiPartyView'),

    path('expenses/', ApiExpenseView.as_view(), name='ApiExpenseView'),
    path('expenses/<int:expense_id>', ApiExpenseView.as_view(), name='ApiExpenseView'),

    path('billing/', ApiBillingView.as_view(), name='ApiBillingView'),
    path('billing/<int:billing_id>', ApiBillingView.as_view(), name='ApiBillingView'),
]