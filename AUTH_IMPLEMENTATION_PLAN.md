# Role-Based Authentication & Authorization Implementation Plan

## Overview
This document outlines the complete implementation of role-based auth for the Tourism Analytics Dashboard.

## Implementation Status
🔴 **NOT STARTED** - Review this plan before proceeding

---

## Phase 1: Backend - User Management & Authentication

### Step 1.1: Create Users App & Custom User Model
```bash
cd backend
python manage.py startapp users
```

**File: `backend/users/models.py`**
```python
from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('vendor', 'Vendor'),
        ('stay_owner', 'Stay Owner'),
    ]
    
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='vendor')
    is_approved = models.BooleanField(default=False, help_text="Admin must approve before access is granted")
    
    class Meta:
        db_table = 'users'
    
    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
```

**File: `backend/tourism_api/settings.py`** - Add:
```python
INSTALLED_APPS = [
    # ... existing apps
    'users',
    'rest_framework',
    'rest_framework_simplejwt',
]

AUTH_USER_MODEL = 'users.User'

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ),
}

from datetime import timedelta
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=5),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
}
```

### Step 1.2: Install JWT Package
```bash
pip install djangorestframework-simplejwt
pip freeze > requirements.txt
```

### Step 1.3: Create Permission Classes

**File: `backend/common/permissions.py`** (create `common` dir)
```python
from rest_framework.permissions import BasePermission, SAFE_METHODS

class IsAdmin(BasePermission):
    """Only admin users"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'

class IsApprovedVendor(BasePermission):
    """Approved vendor users only"""
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and 
            request.user.role == 'vendor' and 
            request.user.is_approved
        )

class IsApprovedStayOwner(BasePermission):
    """Approved stay owner users only"""
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and 
            request.user.role == 'stay_owner' and 
            request.user.is_approved
        )

class AdminOrReadOnly(BasePermission):
    """Read-only for everyone, write for admin only"""
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return request.user.is_authenticated and request.user.role == 'admin'

class IsOwnerOrReadOnly(BasePermission):
    """Owner can edit, others can only read their own"""
    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return obj.owner_id == request.user.id if request.user.is_authenticated else False
        return obj.owner_id == request.user.id
```

### Step 1.4: User Serializers & Views

**File: `backend/users/serializers.py`**
```python
from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'is_approved', 'is_active', 'date_joined']
        read_only_fields = ['id', 'is_approved', 'date_joined']

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    password2 = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'}, label="Confirm Password")
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2', 'role']
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Passwords don't match"})
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        return user
```

**File: `backend/users/views.py`**
```python
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from common.permissions import IsAdmin
from .models import User
from .serializers import UserSerializer, UserRegistrationSerializer

class UserRegistrationView(generics.CreateAPIView):
    """Public registration endpoint"""
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = []  # Public

@api_view(['POST'])
@permission_classes([IsAdmin])
def approve_user(request, user_id):
    """Admin approves a user"""
    try:
        user = User.objects.get(id=user_id)
        user.is_approved = True
        user.save()
        return Response({'message': f'User {user.username} approved'}, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([IsAdmin])
def reject_user(request, user_id):
    """Admin rejects/deactivates a user"""
    try:
        user = User.objects.get(id=user_id)
        user.is_active = False
        user.save()
        return Response({'message': f'User {user.username} rejected/deactivated'}, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@permission_classes([IsAdmin])
def pending_users(request):
    """List users pending approval"""
    users = User.objects.filter(is_approved=False, is_active=True)
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)
```

**File: `backend/users/urls.py`**
```python
from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views

urlpatterns = [
    path('register/', views.UserRegistrationView.as_view(), name='register'),
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('admin/users/<int:user_id>/approve/', views.approve_user, name='approve_user'),
    path('admin/users/<int:user_id>/reject/', views.reject_user, name='reject_user'),
    path('admin/users/pending/', views.pending_users, name='pending_users'),
]
```

---

## Phase 2: Backend - Update Core Models

### Step 2.1: Update Analytics Place Model

**File: `backend/analytics/models.py`** - Update Place model:
```python
from django.conf import settings
from django.db import models

class Place(models.Model):
    CATEGORY_CHOICES = [
        ('historical', 'Historical'),
        ('cultural', 'Cultural'),
        ('natural', 'Natural'),
        ('entertainment', 'Entertainment'),
        ('religious', 'Religious'),
        ('other', 'Other'),
    ]
    
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100, default='Kedah')
    country = models.CharField(max_length=100, default='Malaysia')
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    is_free = models.BooleanField(default=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    currency = models.CharField(max_length=3, default='MYR')
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.PROTECT, 
        null=True, 
        blank=True,
        related_name='created_places'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.name
```

### Step 2.2: Update Transport Model

**File: `backend/transport/models.py`** - Update TransportRoute:
```python
from django.conf import settings
from django.db import models

class TransportRoute(models.Model):
    MODE_CHOICES = [
        ('bus', 'Bus'),
        ('taxi', 'Taxi'),
        ('rental', 'Car Rental'),
        ('ferry', 'Ferry'),
        ('train', 'Train'),
        ('other', 'Other'),
    ]
    
    origin_city = models.CharField(max_length=100)
    destination_city = models.CharField(max_length=100)
    mode = models.CharField(max_length=20, choices=MODE_CHOICES)
    distance_km = models.DecimalField(max_digits=10, decimal_places=2)
    duration_min = models.IntegerField(help_text="Duration in minutes")
    monthly_usage = models.JSONField(default=dict, blank=True)  # {"2025-01": 120, ...}
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name='created_routes'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.origin_city} → {self.destination_city} ({self.mode})"
```

### Step 2.3: Update Events Model

**File: `backend/events/models.py`** - Update Event:
```python
from django.conf import settings
from django.db import models

class Event(models.Model):
    CATEGORY_CHOICES = [
        ('culture', 'Culture'),
        ('food', 'Food'),
        ('sports', 'Sports'),
        ('music', 'Music'),
        ('festival', 'Festival'),
        ('other', 'Other'),
    ]
    
    title = models.CharField(max_length=200)
    city = models.CharField(max_length=120)
    venue = models.CharField(max_length=200, blank=True)
    starts_at = models.DateTimeField()
    ends_at = models.DateTimeField(null=True, blank=True)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='other')
    expected_attendance = models.IntegerField(null=True, blank=True)
    actual_attendance = models.IntegerField(null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name='created_events'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ["-starts_at"]
    
    def __str__(self):
        return self.title
```

### Step 2.4: Update Vendor Model

**File: `backend/vendors/models.py`** - Rename/Update to VendorProfile:
```python
from django.conf import settings
from django.db import models

class VendorProfile(models.Model):
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='vendor_profiles'
    )
    name = models.CharField(max_length=200)
    city = models.CharField(max_length=100)
    cuisines = models.JSONField(default=list, blank=True)  # ["Malaysian", "Chinese"]
    price_level = models.IntegerField(null=True, blank=True, help_text="1-4 scale")
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.name
```

### Step 2.5: Update Stay Model

**File: `backend/stays/models.py`** - Update Stay:
```python
from django.conf import settings
from django.db import models

class Stay(models.Model):
    TYPE_CHOICES = [
        ('hotel', 'Hotel'),
        ('resort', 'Resort'),
        ('guesthouse', 'Guesthouse'),
        ('apartment', 'Apartment'),
        ('homestay', 'Homestay'),
    ]
    
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='stays'
    )
    title = models.CharField(max_length=200)
    city = models.CharField(max_length=100)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    price_per_night = models.DecimalField(max_digits=10, decimal_places=2)
    amenities = models.JSONField(default=list, blank=True)  # ["WiFi", "Pool", "Parking"]
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.title
```

---

## Phase 3: Backend - Serializers & ViewSets

### Step 3.1: Update All Serializers

Add `read_only_fields` for `owner` and `created_by` in respective serializers.

### Step 3.2: Create ViewSets with Permissions

**File: `backend/analytics/views.py`** - PlaceViewSet:
```python
from rest_framework import viewsets
from common.permissions import AdminOrReadOnly
from .models import Place
from .serializers import PlaceSerializer

class PlaceViewSet(viewsets.ModelViewSet):
    queryset = Place.objects.all().order_by('-created_at')
    serializer_class = PlaceSerializer
    permission_classes = [AdminOrReadOnly]
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    def perform_update(self, serializer):
        serializer.save(created_by=self.request.user)
```

Similar pattern for Transport, Events, Vendors, Stays with appropriate permissions.

---

## Phase 4: Frontend - Auth & Route Guards

### Step 4.1: Auth Context

**File: `frontend/src/contexts/AuthContext.tsx`**
```typescript
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'vendor' | 'stay_owner';
  is_approved: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isVendor: boolean;
  isStayOwner: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('access_token'));

  const login = async (username: string, password: string) => {
    const response = await axios.post('http://localhost:8001/api/auth/login/', { username, password });
    const { access, refresh } = response.data;
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    setToken(access);
    // Decode token or fetch user info
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!token, isAdmin: user?.role === 'admin', isVendor: user?.role === 'vendor', isStayOwner: user?.role === 'stay_owner' }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
```

### Step 4.2: Protected Routes

**File: `frontend/src/components/ProtectedRoute.tsx`**
```typescript
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface Props {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'vendor' | 'stay_owner';
  requireApproval?: boolean;
}

export const ProtectedRoute: React.FC<Props> = ({ children, requiredRole, requireApproval = true }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/forbidden" />;
  }

  if (requireApproval && !user?.is_approved) {
    return <Navigate to="/pending-approval" />;
  }

  return <>{children}</>;
};
```

---

## Migration Commands

```bash
# After updating all models
python manage.py makemigrations
python manage.py migrate

# Create admin superuser
python manage.py createsuperuser
```

---

## Testing Checklist

- [ ] Tourist can GET /api/places/ but cannot POST
- [ ] Admin can POST/PUT/DELETE places
- [ ] Vendor cannot access /api/stays/* (403)
- [ ] Vendor CRUD only own VendorProfile
- [ ] Stay owner CRUD only own Stay
- [ ] Unapproved user gets 403
- [ ] Admin approval unlocks access

---

## Next Steps

1. **Review this plan with your team**
2. **Stop running servers** before making changes
3. **Backup database** (copy db.sqlite3)
4. **Implement in phases** - one section at a time
5. **Test after each phase**

Would you like me to start implementing a specific phase?
