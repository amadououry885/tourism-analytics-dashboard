from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.core.exceptions import ValidationError
from .models import User


def simple_password_validator(password):
    """Simple validator: password must be at least 4 characters"""
    if len(password) < 4:
        raise ValidationError("Password must be at least 4 characters long.")


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Custom JWT serializer to include user data in the token"""
    
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
        fields = ['username', 'email', 'password', 'password2', 'role', 'first_name', 'last_name', 'claimed_vendor_id', 'claimed_stay_id', 'phone_number', 'business_registration_number', 'verification_document']
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        return user


class UserApprovalSerializer(serializers.ModelSerializer):
    """Serializer for admin approval operations"""
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'is_approved', 'is_active']
        read_only_fields = ['id', 'username', 'email', 'role']
