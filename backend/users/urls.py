from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .serializers import CustomTokenObtainPairSerializer
from . import views


class CustomTokenObtainPairView(TokenObtainPairView):
    """Custom login view using our custom serializer"""
    serializer_class = CustomTokenObtainPairSerializer


app_name = 'users'

urlpatterns = [
    # Authentication
    path('register/', views.UserRegistrationView.as_view(), name='register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('me/', views.current_user, name='current_user'),
    
    # Password Reset
    path('password-reset/', views.request_password_reset, name='password_reset_request'),
    path('password-reset/verify/', views.verify_reset_token, name='password_reset_verify'),
    path('password-reset/confirm/', views.confirm_password_reset, name='password_reset_confirm'),
    
    # Business Claiming
    path('available-businesses/', views.available_businesses, name='available_businesses'),
    
    # Admin - User Management
    path('admin/users/pending/', views.pending_users, name='pending_users'),
    path('admin/users/<int:user_id>/approve/', views.approve_user, name='approve_user'),
    path('admin/users/<int:user_id>/reject/', views.reject_user, name='reject_user'),
]
