# backend/events/views_health.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from events.models import Event
from django.contrib.auth import get_user_model

User = get_user_model()


@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """Health check endpoint with database stats"""
    try:
        event_count = Event.objects.count()
        user_count = User.objects.count()
        events_with_creator = Event.objects.filter(created_by__isnull=False).count()
        
        return Response({
            'status': 'healthy',
            'database': 'connected',
            'events_total': event_count,
            'events_with_creator': events_with_creator,
            'users': user_count,
            'version': 'v2.0-fix-creators'
        })
    except Exception as e:
        return Response({
            'status': 'error',
            'error': str(e)
        }, status=500)
