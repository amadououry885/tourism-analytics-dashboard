from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import User, PasswordResetToken
from .serializers import UserSerializer, UserRegistrationSerializer, UserApprovalSerializer
from .emails import send_approval_email, send_rejection_email, send_password_reset_email
import logging

logger = logging.getLogger(__name__)


class UserRegistrationView(generics.CreateAPIView):
    """
    Public endpoint for user registration.
    Only vendor and stay_owner roles require admin approval.
    Admin users are auto-approved in the model's save() method.
    Tourists don't need accounts - they access public endpoints anonymously.
    """
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Different messages based on role
        if user.role in ('vendor', 'stay_owner'):
            message = 'Registration successful. Please wait for admin approval.'
        elif user.role == 'admin':
            message = 'Registration successful. Admin account activated.'
        else:
            message = 'Registration successful.'
        
        return Response({
            'message': message,
            'user': UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user(request):
    """Get current authenticated user info"""
    serializer = UserSerializer(request.user)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def pending_users(request):
    """
    List users pending approval (admin only).
    Only returns vendor and stay_owner roles that require approval.
    Tourists are anonymous/unauthenticated and never appear here.
    """
    # Check if user is admin
    if request.user.role != 'admin':
        return Response(
            {'error': 'Only admins can view pending users'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Only vendor and stay_owner roles require approval
    users = User.objects.filter(
        role__in=['vendor', 'stay_owner'],
        is_approved=False
    ).order_by('-date_joined')
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def approve_user(request, user_id):
    """
    Admin approves a user (admin only).
    Only vendor and stay_owner accounts can be approved.
    Admin accounts and tourists are not subject to approval.
    """
    # Check if user is admin
    if request.user.role != 'admin':
        return Response(
            {'error': 'Only admins can approve users'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        user = User.objects.get(id=user_id)
        
        # Only vendor and stay_owner can be approved
        if user.role not in ('vendor', 'stay_owner'):
            return Response(
                {'detail': f'Only vendor or stay_owner accounts can be approved. User has role: {user.role}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user.is_approved = True
        user.is_active = True
        user.save(update_fields=['is_approved', 'is_active'])
        
        # Send approval email notification
        email_sent = send_approval_email(user)
        if email_sent:
            logger.info(f"Approval email sent to {user.email}")
        else:
            logger.warning(f"Failed to send approval email to {user.email}, but user was approved")
        
        return Response({
            'message': f'User {user.username} approved successfully',
            'user': UserSerializer(user).data,
            'email_sent': email_sent
        }, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        return Response(
            {'error': 'User not found'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reject_user(request, user_id):
    """
    Admin rejects/deactivates a user (admin only).
    Only vendor and stay_owner accounts can be rejected.
    Admin accounts and tourists are not subject to rejection.
    
    Request body (optional):
        {
            "reason": "Optional explanation for rejection"
        }
    """
    # Check if user is admin
    if request.user.role != 'admin':
        return Response(
            {'error': 'Only admins can reject users'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        user = User.objects.get(id=user_id)
        
        # Only vendor and stay_owner can be rejected
        if user.role not in ('vendor', 'stay_owner'):
            return Response(
                {'detail': f'Only vendor or stay_owner accounts can be rejected. User has role: {user.role}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get optional rejection reason from request body
        reason = request.data.get('reason', None) if request.data else None
        
        user.is_active = False
        user.is_approved = False
        user.save(update_fields=['is_active', 'is_approved'])
        
        # Send rejection email notification with reason
        email_sent = send_rejection_email(user, reason=reason)
        if email_sent:
            logger.info(f"Rejection email sent to {user.email}")
        else:
            logger.warning(f"Failed to send rejection email to {user.email}, but user was rejected")
        
        return Response({
            'message': f'User {user.username} rejected/deactivated successfully',
            'email_sent': email_sent
        }, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        return Response(
            {'error': 'User not found'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def request_password_reset(request):
    """
    Request a password reset email.
    User provides their email, and if it exists, they receive a reset link.
    
    Request body:
        {
            "email": "user@example.com"
        }
    """
    email = request.data.get('email', '').strip().lower()
    
    if not email:
        return Response(
            {'error': 'Email is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Always return success to prevent email enumeration attacks
    success_message = 'If an account with this email exists, you will receive a password reset link shortly.'
    
    try:
        user = User.objects.get(email__iexact=email)
        
        # Create reset token
        reset_token = PasswordResetToken.create_token(user)
        
        # Determine frontend URL
        frontend_url = request.data.get('frontend_url') or request.headers.get('Origin') or 'https://tourism-kedah.vercel.app'
        
        # Send reset email
        email_sent = send_password_reset_email(user, reset_token.token, frontend_url)
        
        if email_sent:
            logger.info(f"Password reset email sent to {email}")
        else:
            logger.warning(f"Failed to send password reset email to {email}")
            
    except User.DoesNotExist:
        # Don't reveal that email doesn't exist
        logger.info(f"Password reset requested for non-existent email: {email}")
    
    return Response({'message': success_message}, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def verify_reset_token(request):
    """
    Verify if a password reset token is valid.
    
    Request body:
        {
            "token": "reset_token_here"
        }
    """
    token = request.data.get('token', '')
    
    if not token:
        return Response(
            {'error': 'Token is required', 'valid': False},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        reset_token = PasswordResetToken.objects.get(token=token)
        
        if reset_token.is_valid():
            return Response({
                'valid': True,
                'message': 'Token is valid',
                'email': reset_token.user.email
            })
        else:
            return Response({
                'valid': False,
                'error': 'Token has expired or already been used'
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except PasswordResetToken.DoesNotExist:
        return Response({
            'valid': False,
            'error': 'Invalid token'
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def confirm_password_reset(request):
    """
    Reset password using a valid token.
    
    Request body:
        {
            "token": "reset_token_here",
            "password": "new_password",
            "password_confirm": "new_password"
        }
    """
    token = request.data.get('token', '')
    password = request.data.get('password', '')
    password_confirm = request.data.get('password_confirm', '')
    
    # Validate input
    if not token:
        return Response(
            {'error': 'Token is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if not password:
        return Response(
            {'error': 'Password is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if password != password_confirm:
        return Response(
            {'error': 'Passwords do not match'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if len(password) < 8:
        return Response(
            {'error': 'Password must be at least 8 characters'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        reset_token = PasswordResetToken.objects.get(token=token)
        
        if not reset_token.is_valid():
            return Response(
                {'error': 'Token has expired or already been used'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update password
        user = reset_token.user
        user.set_password(password)
        user.save()
        
        # Mark token as used
        reset_token.used = True
        reset_token.save()
        
        logger.info(f"Password reset successful for user {user.username}")
        
        return Response({
            'message': 'Password reset successful. You can now login with your new password.'
        }, status=status.HTTP_200_OK)
        
    except PasswordResetToken.DoesNotExist:
        return Response(
            {'error': 'Invalid token'},
            status=status.HTTP_400_BAD_REQUEST
        )
