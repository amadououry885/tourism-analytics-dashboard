"""
Custom permission classes for role-based access control.

Permission Hierarchy:
- Tourist (unauthenticated): Read-only access to public endpoints
- Vendor (approved): CRUD own vendor profiles only
- Stay Owner (approved): CRUD own stays only  
- Admin: Full CRUD access to Places, Transport, Events, and user management
"""

from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsAdmin(BasePermission):
    """
    Permission class that only allows admin users.
    Used for endpoints that require admin privileges (user management, system-wide settings).
    """
    
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'


class IsApprovedVendor(BasePermission):
    """
    Permission class for approved vendor users.
    Vendors must be approved by admin before accessing protected endpoints.
    """
    
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and 
            request.user.role == 'vendor' and 
            request.user.is_approved
        )


class IsApprovedStayOwner(BasePermission):
    """
    Permission class for approved stay owner users.
    Stay owners must be approved by admin before accessing protected endpoints.
    """
    
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and 
            request.user.role == 'stay_owner' and 
            request.user.is_approved
        )


class AdminOrReadOnly(BasePermission):
    """
    Permission class for admin-managed resources.
    - Read access (GET, HEAD, OPTIONS): Everyone (including unauthenticated)
    - Write access (POST, PUT, PATCH, DELETE): Admin only
    
    Use for: Places, Transport Routes, Events
    """
    
    def has_permission(self, request, view):
        # Read permissions are allowed to any request
        if request.method in SAFE_METHODS:
            return True
        
        # Write permissions only for admin users
        return request.user.is_authenticated and request.user.role == 'admin'


class IsOwnerOrReadOnly(BasePermission):
    """
    Permission class for owner-scoped resources.
    - Object owner: Full CRUD access
    - Others: Read-only if active
    
    Use for: VendorProfile, Stay
    Note: Additional role checking should be done in ViewSet
    """
    
    def has_permission(self, request, view):
        # Read permissions allowed for everyone
        if request.method in SAFE_METHODS:
            return True
        
        # Write permissions require authentication
        return request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        # Read permissions for safe methods
        if request.method in SAFE_METHODS:
            return True
            
        # Check if user is authenticated
        if not request.user.is_authenticated:
            return False
        
        # Object owner has full access
        return obj.owner_id == request.user.id


class IsVendorOwnerOrReadOnly(BasePermission):
    """
    Permission class specifically for Vendor resources.
    - Approved vendors: Can create/update own vendors
    - Others: Read-only access to active vendors
    """
    
    def has_permission(self, request, view):
        # Read permissions allowed for everyone
        if request.method in SAFE_METHODS:
            return True
        
        # Create/write requires approved vendor role
        if request.method == 'POST':
            return (
                request.user.is_authenticated and
                request.user.role == 'vendor' and
                request.user.is_approved
            )
        
        # Update/delete checked at object level
        return request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        # Read permissions for safe methods
        if request.method in SAFE_METHODS:
            return True
            
        # Owner check for write operations
        return (
            request.user.is_authenticated and
            request.user.role == 'vendor' and
            request.user.is_approved and
            obj.owner_id == request.user.id
        )


class IsStayOwnerOrReadOnly(BasePermission):
    """
    Permission class specifically for Stay resources.
    - Approved stay_owners: Can create/update own stays
    - Others: Read-only access to active stays
    """
    
    def has_permission(self, request, view):
        # Read permissions allowed for everyone
        if request.method in SAFE_METHODS:
            return True
        
        # Create/write requires approved stay_owner role
        if request.method == 'POST':
            return (
                request.user.is_authenticated and
                request.user.role == 'stay_owner' and
                request.user.is_approved
            )
        
        # Update/delete checked at object level
        return request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        # Read permissions for safe methods
        if request.method in SAFE_METHODS:
            return True
            
        # Owner check for write operations
        return (
            request.user.is_authenticated and
            request.user.role == 'stay_owner' and
            request.user.is_approved and
            obj.owner_id == request.user.id
        )


class IsOwner(BasePermission):
    """
    Permission class that only allows owners of an object to access it.
    Used in conjunction with queryset filtering in views.
    """
    
    def has_permission(self, request, view):
        return request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        return obj.owner_id == request.user.id
