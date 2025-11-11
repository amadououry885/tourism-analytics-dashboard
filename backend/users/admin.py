from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Custom User Admin with role and approval fields"""
    
    list_display = ['username', 'email', 'role', 'is_approved', 'is_active', 'date_joined']
    list_filter = ['role', 'is_approved', 'is_active', 'is_staff']
    search_fields = ['username', 'email', 'first_name', 'last_name']
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Role & Approval', {'fields': ('role', 'is_approved')}),
    )
    
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('Role & Approval', {'fields': ('role', 'is_approved')}),
    )
    
    actions = ['approve_users', 'reject_users']
    
    def approve_users(self, request, queryset):
        updated = queryset.update(is_approved=True)
        self.message_user(request, f'{updated} user(s) approved successfully.')
    approve_users.short_description = 'Approve selected users'
    
    def reject_users(self, request, queryset):
        updated = queryset.update(is_active=False, is_approved=False)
        self.message_user(request, f'{updated} user(s) rejected successfully.')
    reject_users.short_description = 'Reject selected users'
