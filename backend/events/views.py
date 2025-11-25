# backend/events/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated
from django.utils.timezone import now
from django.db.models import Q
from .models import Event, EventRegistration, EventReminder
from .serializers import (
    EventSerializer,
    EventDetailSerializer,
    EventRegistrationSerializer,
    EventReminderSerializer
)
from common.permissions import AdminOrReadOnly


class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all().order_by("start_date")
    serializer_class = EventSerializer
    permission_classes = [AdminOrReadOnly]

    def get_serializer_class(self):
        """Use detailed serializer for retrieve action"""
        if self.action == 'retrieve':
            return EventDetailSerializer
        return EventSerializer

    def perform_create(self, serializer):
        """Automatically set created_by to current user"""
        event = serializer.save(created_by=self.request.user)
        
        # Auto-generate recurring instances if recurrence is set
        if event.recurrence_type != 'none':
            event.generate_recurring_instances()
    
    def perform_update(self, serializer):
        """Keep original created_by on updates"""
        serializer.save()

    def get_queryset(self):
        qs = super().get_queryset()

        city = self.request.query_params.get("city")
        q = self.request.query_params.get("q")
        tag = self.request.query_params.get("tag")  # exact tag membership
        upcoming = self.request.query_params.get("upcoming")  # "1" to filter future
        start_after = self.request.query_params.get("start_after")  # ISO datetime
        end_before = self.request.query_params.get("end_before")    # ISO datetime
        hide_instances = self.request.query_params.get("hide_instances")  # Hide recurring instances

        if city:
            qs = qs.filter(city__iexact=city)

        if q:
            qs = qs.filter(
                Q(title__icontains=q)
                | Q(description__icontains=q)
                | Q(location_name__icontains=q)
                | Q(tags__icontains=q)
            )

        if tag:
            # JSONField subset check (works for list-of-strings)
            qs = qs.filter(tags__contains=[tag])

        if upcoming == "1":
            # include events whose end_date is in the future (or no end_date but start_date is future)
            today = now()
            qs = qs.filter(Q(end_date__gte=today) | Q(end_date__isnull=True, start_date__gte=today))

        if start_after:
            qs = qs.filter(start_date__gte=start_after)

        if end_before:
            qs = qs.filter(end_date__lte=end_before)
        
        if hide_instances == "1":
            # Only show parent events, not auto-generated instances
            qs = qs.filter(is_recurring_instance=False)

        return qs
    
    # ✨ NEW: Registration Endpoints
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def register(self, request, pk=None):
        """Register current user for this event"""
        event = self.get_object()
        
        try:
            registration = event.register_user(request.user)
            serializer = EventRegistrationSerializer(registration)
            return Response({
                'message': 'Successfully registered for event',
                'registration': serializer.data,
                'attendee_count': event.attendee_count,
                'spots_remaining': event.spots_remaining,
            }, status=status.HTTP_201_CREATED)
        except ValueError as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def unregister(self, request, pk=None):
        """Unregister current user from this event"""
        event = self.get_object()
        event.unregister_user(request.user)
        
        return Response({
            'message': 'Successfully unregistered from event',
            'attendee_count': event.attendee_count,
            'spots_remaining': event.spots_remaining,
        }, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated])
    def my_registration(self, request, pk=None):
        """Get current user's registration for this event"""
        event = self.get_object()
        
        try:
            registration = EventRegistration.objects.get(
                user=request.user,
                event=event,
                status='confirmed'
            )
            serializer = EventRegistrationSerializer(registration)
            return Response(serializer.data)
        except EventRegistration.DoesNotExist:
            return Response({
                'registered': False
            }, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=True, methods=['get'])
    def attendees(self, request, pk=None):
        """Get list of attendees (public)"""
        event = self.get_object()
        registrations = event.registrations.filter(status='confirmed')
        serializer = EventRegistrationSerializer(registrations, many=True)
        return Response({
            'count': registrations.count(),
            'attendees': serializer.data
        })
    
    # ✨ NEW: Reminder Endpoints
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def set_reminder(self, request, pk=None):
        """Set a reminder for this event"""
        event = self.get_object()
        reminder_time = request.data.get('reminder_time')
        
        if reminder_time not in ['1_week', '1_day', '1_hour']:
            return Response({
                'error': 'Invalid reminder_time. Must be: 1_week, 1_day, or 1_hour'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        reminder, created = EventReminder.objects.get_or_create(
            user=request.user,
            event=event,
            reminder_time=reminder_time
        )
        
        serializer = EventReminderSerializer(reminder)
        return Response({
            'message': 'Reminder set successfully',
            'reminder': serializer.data
        }, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)
    
    @action(detail=True, methods=['delete'], permission_classes=[IsAuthenticated])
    def remove_reminder(self, request, pk=None):
        """Remove reminder for this event"""
        event = self.get_object()
        reminder_time = request.query_params.get('reminder_time')
        
        deleted_count = EventReminder.objects.filter(
            user=request.user,
            event=event,
            reminder_time=reminder_time
        ).delete()[0]
        
        return Response({
            'message': f'Removed {deleted_count} reminder(s)'
        }, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated])
    def my_reminders(self, request, pk=None):
        """Get current user's reminders for this event"""
        event = self.get_object()
        reminders = EventReminder.objects.filter(user=request.user, event=event)
        serializer = EventReminderSerializer(reminders, many=True)
        return Response(serializer.data)
    
    # ✨ NEW: Nearby places endpoints
    
    @action(detail=True, methods=['get'])
    def nearby_stays(self, request, pk=None):
        """Get nearby accommodations"""
        event = self.get_object()
        radius = float(request.query_params.get('radius', 10))
        
        stays = event.get_nearby_stays(radius_km=radius)
        from stays.serializers import StaySerializer
        
        return Response({
            'count': len(stays),
            'stays': StaySerializer(stays, many=True).data,
            'affiliate_urls': event.get_affiliate_urls() if not stays else None
        })
    
    @action(detail=True, methods=['get'])
    def nearby_restaurants(self, request, pk=None):
        """Get nearby restaurants/vendors"""
        event = self.get_object()
        radius = float(request.query_params.get('radius', 5))
        
        vendors = event.get_nearby_restaurants(radius_km=radius)
        from vendors.serializers import VendorSerializer
        
        return Response({
            'count': len(vendors),
            'restaurants': VendorSerializer(vendors, many=True).data
        })
    
    # ✨ NEW: Recurring event management
    
    @action(detail=True, methods=['post'], permission_classes=[AdminOrReadOnly])
    def generate_instances(self, request, pk=None):
        """Manually trigger generation of recurring instances"""
        event = self.get_object()
        
        if event.is_recurring_instance:
            return Response({
                'error': 'Cannot generate instances from a recurring instance'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        count = int(request.data.get('count', 12))
        instances = event.generate_recurring_instances(count=count)
        
        return Response({
            'message': f'Generated {len(instances)} recurring instances',
            'instances': EventSerializer(instances, many=True).data
        })
