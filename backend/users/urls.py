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
    
    # Admin - User Management
    path('admin/users/pending/', views.pending_users, name='pending_users'),
    path('admin/users/<int:user_id>/approve/', views.approve_user, name='approve_user'),
    path('admin/users/<int:user_id>/reject/', views.reject_user, name='reject_user'),
]
