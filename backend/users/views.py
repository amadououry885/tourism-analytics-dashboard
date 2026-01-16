from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import User, PasswordResetToken
from .serializers import UserSerializer, UserRegistrationSerializer, UserApprovalSerializer
from .emails import send_approval_email, send_rejection_email, send_password_reset_email, send_registration_pending_email
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
        
        # Send registration confirmation email (non-blocking)
        try:
            send_registration_pending_email(user)
            logger.info(f"Registration email sent to {user.email}")
        except Exception as e:
            # Log error but don't block registration response
            logger.error(f"Failed to send registration email to {user.email}: {str(e)}")
        
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
    Admin approves a user and assigns them to their claimed business (admin only).
    Accepts optional vendor_id or stay_id to assign business ownership.
    Accepts optional admin_notes to save admin's verification notes.
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
        
        # Get business assignment from request (optional)
        vendor_id = request.data.get('vendor_id', user.claimed_vendor_id)
        stay_id = request.data.get('stay_id', user.claimed_stay_id)
        admin_notes = request.data.get('admin_notes', '')
        
        # Assign business ownership if provided
        assigned_business = None
        if user.role == 'vendor' and vendor_id:
            try:
                from vendors.models import Vendor
                vendor = Vendor.objects.get(id=vendor_id)
                
                # Check if vendor already has an owner
                if vendor.owner and vendor.owner != user:
                    return Response(
                        {'error': f'This restaurant already has an owner: {vendor.owner.username}'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                vendor.owner = user
                vendor.save()
                assigned_business = vendor.name
                logger.info(f"Assigned vendor {vendor.name} (ID: {vendor_id}) to user {user.username}")
            except Vendor.DoesNotExist:
                return Response(
                    {'error': f'Vendor with ID {vendor_id} not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
        
        elif user.role == 'stay_owner' and stay_id:
            try:
                from stays.models import Stay
                stay = Stay.objects.get(id=stay_id)
                
                # Check if stay already has an owner
                if stay.owner and stay.owner != user:
                    return Response(
                        {'error': f'This hotel already has an owner: {stay.owner.username}'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                stay.owner = user
                stay.save()
                assigned_business = stay.name
                logger.info(f"Assigned stay {stay.name} (ID: {stay_id}) to user {user.username}")
            except Stay.DoesNotExist:
                return Response(
                    {'error': f'Stay with ID {stay_id} not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
        
        # Approve user and save admin notes
        user.is_approved = True
        user.is_active = True
        if admin_notes:
            user.admin_notes = admin_notes
        user.save(update_fields=['is_approved', 'is_active', 'admin_notes'])
        
        # Send approval email notification
        email_sent = send_approval_email(user, assigned_business)
        if email_sent:
            logger.info(f"Approval email sent to {user.email}")
        else:
            logger.warning(f"Failed to send approval email to {user.email}, but user was approved")
        
        response_data = {
            'message': f'User {user.username} approved successfully',
            'user': UserSerializer(user).data,
            'email_sent': email_sent
        }
        
        if assigned_business:
            response_data['assigned_business'] = assigned_business
        
        return Response(response_data, status=status.HTTP_200_OK)
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
    If multiple accounts share the same email, send reset links for ALL of them.
    
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
    
    # Find ALL users with this email (handles duplicates)
    users = User.objects.filter(email__iexact=email)
    
    if users.exists():
        # Determine frontend URL
        frontend_url = request.data.get('frontend_url') or request.headers.get('Origin') or 'https://tourism-analytics-dashboard.vercel.app'
        
        # Send reset email for EACH user with this email
        for user in users:
            try:
                # Create reset token
                reset_token = PasswordResetToken.create_token(user)
                
                # Send reset email
                email_sent = send_password_reset_email(user, reset_token.token, frontend_url)
                
                if email_sent:
                    logger.info(f"Password reset email sent to {email} for user {user.username}")
                else:
                    logger.warning(f"Failed to send password reset email to {email} for user {user.username}")
            except Exception as e:
                logger.error(f"Error sending reset email for {user.username}: {str(e)}")
    else:
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


@api_view(['GET'])
@permission_classes([AllowAny])
def available_businesses(request):
    """
    List available businesses (restaurants and hotels) for claiming.
    Returns businesses that don't have an owner yet.
    Public endpoint for registration process.
    """
    business_type = request.query_params.get('type', 'all')  # 'vendor', 'stay', or 'all'
    search = request.query_params.get('search', '')
    
    result = {}
    
    if business_type in ['vendor', 'all']:
        from vendors.models import Vendor
        vendors = Vendor.objects.filter(owner__isnull=True)
        
        if search:
            vendors = vendors.filter(name__icontains=search)
        
        result['vendors'] = [
            {
                'id': v.id,
                'name': v.name,
                'city': v.city,
                'cuisines': v.cuisines,
                'address': v.address
            }
            for v in vendors[:50]  # Limit to 50 results
        ]
    
    if business_type in ['stay', 'all']:
        from stays.models import Stay
        stays = Stay.objects.filter(owner__isnull=True)
        
        if search:
            stays = stays.filter(name__icontains=search)
        
        result['stays'] = [
            {
                'id': s.id,
                'name': s.name,
                'city': s.city,
                'type': s.type,
                'address': s.address
            }
            for s in stays[:50]  # Limit to 50 results
        ]
    
    return Response(result)
