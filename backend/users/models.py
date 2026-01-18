from django.contrib.auth.models import AbstractUser
from django.db import models
import secrets
from datetime import timedelta
from django.utils import timezone


class User(AbstractUser):
    """
    Custom User model with role-based access control.
    Extends Django's AbstractUser to add role and approval status.
    """
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('vendor', 'Vendor'),
        ('stay_owner', 'Stay Owner'),
        ('place_owner', 'Place Owner'),
    ]
    
    role = models.CharField(
        max_length=20, 
        choices=ROLE_CHOICES, 
        default='vendor',
        help_text="User role determines access permissions"
    )
    is_approved = models.BooleanField(
        default=False,
        help_text="Admin must approve vendors and stay owners before they can access protected endpoints"
    )
    
    # Business claiming fields (for future owner registration)
    claimed_vendor_id = models.IntegerField(
        null=True,
        blank=True,
        help_text="ID of the restaurant/vendor this user claims to own (pending approval)"
    )
    claimed_stay_id = models.IntegerField(
        null=True,
        blank=True,
        help_text="ID of the hotel/stay this user claims to own (pending approval)"
    )
    claimed_place_id = models.IntegerField(
        null=True,
        blank=True,
        help_text="ID of the place/attraction this user claims to own (pending approval)"
    )
    business_verification_notes = models.TextField(
        blank=True,
        default='',
        help_text="Admin notes about business ownership verification"
    )
    
    # Verification fields
    phone_number = models.CharField(
        max_length=20,
        blank=True,
        default='',
        help_text="Contact phone number for verification"
    )
    business_registration_number = models.CharField(
        max_length=100,
        blank=True,
        default='',
        help_text="Official business registration/license number (optional)"
    )
    verification_document = models.FileField(
        upload_to='verification_documents/',
        null=True,
        blank=True,
        help_text="Upload business verification documents (ID, business license, etc.)"
    )
    admin_notes = models.TextField(
        blank=True,
        default='',
        help_text="Admin's private notes about this user/business"
    )
    
    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'
    
    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
    
    def save(self, *args, **kwargs):
        # Auto-approve admin users
        if self.role == 'admin':
            self.is_approved = True
            self.is_staff = True
            self.is_superuser = True
        super().save(*args, **kwargs)


class PasswordResetToken(models.Model):
    """
    Stores password reset tokens for users.
    Tokens expire after 1 hour for security.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reset_tokens')
    token = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    used = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'password_reset_tokens'
    
    @classmethod
    def create_token(cls, user):
        """Create a new password reset token for a user"""
        # Invalidate any existing tokens for this user
        cls.objects.filter(user=user, used=False).update(used=True)
        
        # Generate secure token
        token = secrets.token_urlsafe(32)
        return cls.objects.create(user=user, token=token)
    
    def is_valid(self):
        """Check if token is valid (not used and not expired)"""
        if self.used:
            return False
        # Token expires after 1 hour
        expiry_time = self.created_at + timedelta(hours=1)
        return timezone.now() < expiry_time
    
    def __str__(self):
        return f"Reset token for {self.user.username}"
