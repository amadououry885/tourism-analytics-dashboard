from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Custom User model with role-based access control.
    Extends Django's AbstractUser to add role and approval status.
    """
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('vendor', 'Vendor'),
        ('stay_owner', 'Stay Owner'),
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
