from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.core.exceptions import ValidationError
from django.contrib.auth.validators import UnicodeUsernameValidator
import re
import logging
from .models import User

logger = logging.getLogger(__name__)


def simple_password_validator(password):
    """Simple validator: password must be at least 4 characters"""
    if len(password) < 4:
        raise ValidationError("Password must be at least 4 characters long.")


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Custom JWT serializer that supports login with email OR username"""
    
    def validate(self, attrs):
        # Get the username/email field value
        username_field = attrs.get('username', '')
        logger.info(f"Login attempt with: {username_field}")
        
        # Check if user is trying to login with email
        if '@' in username_field:
            try:
                user = User.objects.get(email__iexact=username_field)
                logger.info(f"Found user by email: {user.username}, is_active={user.is_active}")
                # Replace email with actual username for authentication
                attrs['username'] = user.username
            except User.DoesNotExist:
                logger.warning(f"No user found with email: {username_field}")
        else:
            # Also try case-insensitive username lookup
            try:
                user = User.objects.get(username__iexact=username_field)
                logger.info(f"Found user by username: {user.username}, is_active={user.is_active}")
                attrs['username'] = user.username
            except User.DoesNotExist:
                logger.warning(f"No user found with username: {username_field}")
        
        try:
            result = super().validate(attrs)
            logger.info(f"Login successful for: {username_field}")
            return result
        except Exception as e:
            logger.error(f"Login failed for {username_field}: {str(e)}")
            raise
    
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        
        # Add custom claims
        token['username'] = user.username
        token['email'] = user.email
        token['role'] = user.role
        token['is_approved'] = user.is_approved
        
        return token


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model - read operations"""
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'is_approved', 'is_active', 'date_joined', 'claimed_vendor_id', 'claimed_stay_id', 'business_verification_notes', 'phone_number', 'business_registration_number', 'verification_document', 'admin_notes']
        read_only_fields = ['id', 'is_approved', 'is_active', 'date_joined']


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration with business claiming support"""
    
    # Override username field to remove strict validator
    username = serializers.CharField(
        required=True,
        min_length=2,
        max_length=150,
        help_text="Username (spaces will be replaced with underscores)"
    )
    
    password = serializers.CharField(
        write_only=True, 
        required=True, 
        validators=[simple_password_validator],
        style={'input_type': 'password'},
        min_length=4,
        help_text="Password must be at least 4 characters"
    )
    password2 = serializers.CharField(
        write_only=True, 
        required=True, 
        style={'input_type': 'password'}, 
        label="Confirm Password"
    )
    claimed_vendor_id = serializers.IntegerField(
        required=False,
        allow_null=True,
        help_text="ID of the restaurant this vendor claims to own"
    )
    claimed_stay_id = serializers.IntegerField(
        required=False,
        allow_null=True,
        help_text="ID of the hotel/stay this owner claims to own"
    )
    claimed_place_id = serializers.IntegerField(
        required=False,
        allow_null=True,
        help_text="ID of the place/attraction this owner claims to own"
    )
    phone_number = serializers.CharField(
        required=True,
        help_text="Contact phone number for verification"
    )
    business_registration_number = serializers.CharField(
        required=False,
        allow_blank=True,
        help_text="Business registration or license number (optional)"
    )
    verification_document = serializers.FileField(
        required=False,
        allow_null=True,
        help_text="Upload verification documents (ID, business license)"
    )
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2', 'role', 'first_name', 'last_name', 'claimed_vendor_id', 'claimed_stay_id', 'claimed_place_id', 'phone_number', 'business_registration_number', 'verification_document']
    
    def validate_username(self, value):
        """Clean username: replace spaces with underscores, remove special chars"""
        # Replace spaces with underscores
        cleaned = value.replace(' ', '_')
        # Remove any characters that are not letters, numbers, or @/./+/-/_
        cleaned = re.sub(r'[^a-zA-Z0-9@.+\-_]', '', cleaned)
        
        if len(cleaned) < 2:
            raise serializers.ValidationError("Username must be at least 2 characters after cleaning.")
        
        # Check if username already exists
        if User.objects.filter(username=cleaned).exists():
            raise serializers.ValidationError("A user with this username already exists.")
        
        return cleaned
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password2')
        password = validated_data.pop('password')
        
        # Create user with explicit is_active=True
        user = User(
            is_active=True,  # Explicitly set to True
            **validated_data
        )
        user.set_password(password)  # Hash the password properly
        user.save()
        
        return user


class UserApprovalSerializer(serializers.ModelSerializer):
    """Serializer for admin approval operations"""
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'is_approved', 'is_active']
        read_only_fields = ['id', 'username', 'email', 'role']
