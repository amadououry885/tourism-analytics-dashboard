from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import User
from .serializers import UserSerializer, UserRegistrationSerializer, UserApprovalSerializer


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
        
        return Response({
            'message': f'User {user.username} approved successfully',
            'user': UserSerializer(user).data
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
        
        user.is_active = False
        user.is_approved = False
        user.save(update_fields=['is_active', 'is_approved'])
        
        return Response({
            'message': f'User {user.username} rejected/deactivated successfully'
        }, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        return Response(
            {'error': 'User not found'},
            status=status.HTTP_404_NOT_FOUND
        )
