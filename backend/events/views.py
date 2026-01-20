# backend/events/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated, AllowAny, IsAdminUser
from rest_framework.pagination import PageNumberPagination
from django.utils.timezone import now
from django.db.models import Q
from django.db import models
from .models import Event, EventRegistration, EventReminder, EventRegistrationForm, EventRegistrationField
from .serializers import (
    EventSerializer,
    EventDetailSerializer,
    EventRegistrationSerializer,
    EventReminderSerializer,
    EventRegistrationFormSerializer,
    EventRegistrationFormWriteSerializer,
    EventRegistrationFieldSerializer,
)
from common.permissions import AdminOrReadOnly
from .emails import send_registration_confirmation, send_event_reminder


class EventPagination(PageNumberPagination):
    """Custom pagination for events - show more events by default"""
    page_size = 100  # Show up to 100 events by default
    page_size_query_param = 'page_size'
    max_page_size = 500


class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all().order_by("start_date")
    serializer_class = EventSerializer
    permission_classes = [AdminOrReadOnly]
    pagination_class = EventPagination  # Use custom pagination to show all events

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
        
        # ✨ UPDATED: By default, show all non-recurring events AND recurring instances
        if hide_instances == "1":
            # Admin view: show only parent events (templates), hide instances
            qs = qs.filter(is_recurring_instance=False)
        else:
            # Default user view: show instances OR non-recurring events
            # Also auto-generate upcoming instances for recurring events
            self._ensure_recurring_instances(qs)
            
            qs = qs.filter(
                Q(is_recurring_instance=True) |  # Show recurring instances
                Q(recurrence_type='none')         # Show one-time events
            )

        return qs
    
    def _ensure_recurring_instances(self, queryset):
        """Ensure recurring events have upcoming instances generated"""
        from datetime import timedelta
        
        # Find parent recurring events that need instances
        parent_events = Event.objects.filter(
            recurrence_type__in=['daily', 'weekly', 'monthly', 'yearly'],
            is_recurring_instance=False
        )
        
        for event in parent_events:
            # Check if there are any future instances
            future_instances = Event.objects.filter(
                parent_event=event,
                start_date__gte=now()
            ).count()
            
            # If no future instances, generate some
            if future_instances == 0:
                event.generate_recurring_instances(count=6)  # Generate next 6 occurrences
    
    # ✨ NEW: Happening Now Endpoint
    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def happening_now(self, request):
        """Return events that are currently happening (between start and end dates)"""
        from django.utils.timezone import now as timezone_now
        current_time = timezone_now()
        
        # Get events that are currently active
        happening_events = self.get_queryset().filter(
            start_date__lte=current_time
        ).filter(
            models.Q(end_date__gte=current_time) | 
            models.Q(end_date__isnull=True, start_date__date=current_time.date())
        ).order_by('start_date')
        
        serializer = self.get_serializer(happening_events, many=True)
        return Response(serializer.data)
    
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
    
    @action(detail=True, methods=['post'], permission_classes=[AllowAny])
    def cancel_registration(self, request, pk=None):
        """Cancel a registration (for authenticated users or guest with registration ID)"""
        event = self.get_object()
        
        # For authenticated users
        if request.user.is_authenticated:
            try:
                registration = EventRegistration.objects.get(
                    user=request.user,
                    event=event,
                    status='confirmed'
                )
                registration.status = 'cancelled'
                registration.save()
                
                return Response({
                    'message': 'Registration cancelled successfully',
                    'attendee_count': event.attendee_count,
                    'spots_remaining': event.spots_remaining,
                }, status=status.HTTP_200_OK)
            except EventRegistration.DoesNotExist:
                return Response({
                    'error': 'No active registration found for this event'
                }, status=status.HTTP_404_NOT_FOUND)
        
        # For guest users (with registration ID)
        registration_id = request.data.get('registration_id')
        contact_email = request.data.get('contact_email')
        
        if not registration_id or not contact_email:
            return Response({
                'error': 'registration_id and contact_email are required for guest cancellation'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            registration = EventRegistration.objects.get(
                id=registration_id,
                event=event,
                contact_email=contact_email,
                status='confirmed'
            )
            registration.status = 'cancelled'
            registration.save()
            
            return Response({
                'message': 'Registration cancelled successfully',
                'attendee_count': event.attendee_count,
                'spots_remaining': event.spots_remaining,
            }, status=status.HTTP_200_OK)
        except EventRegistration.DoesNotExist:
            return Response({
                'error': 'Registration not found or already cancelled'
            }, status=status.HTTP_404_NOT_FOUND)
    
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
    
    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def send_reminder(self, request, pk=None):
        """Send reminder email to all confirmed attendees (Admin only)"""
        event = self.get_object()
        message = request.data.get('message', '')
        
        # Get all confirmed registrations
        confirmed = event.registrations.filter(status='confirmed')
        
        if confirmed.count() == 0:
            return Response({
                'error': 'No confirmed attendees to send reminders to'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Send reminder emails using email utility
        sent_count, failed_count = send_event_reminder(confirmed, event, message)
        
        return Response({
            'message': f'Reminders sent successfully to {sent_count} attendees',
            'sent_count': sent_count,
            'failed_count': failed_count,
            'total_confirmed': confirmed.count()
        }, status=status.HTTP_200_OK)
    
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
    
    # ✨ NEW: Registration Form Management Endpoints
    
    @action(detail=True, methods=['get'])
    def registration_form(self, request, pk=None):
        """
        Get the custom registration form for this event.
        Public endpoint - anyone can view the form before registering.
        """
        event = self.get_object()
        
        try:
            form = event.registration_form
            serializer = EventRegistrationFormSerializer(form)
            return Response(serializer.data)
        except EventRegistrationForm.DoesNotExist:
            return Response({
                'has_form': False,
                'message': 'This event does not have a custom registration form'
            }, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=True, methods=['post', 'put'], permission_classes=[AdminOrReadOnly])
    def create_registration_form(self, request, pk=None):
        """
        Create or update custom registration form for this event.
        Only event organizers (admins) can do this.
        
        Example request body:
        {
            "title": "Marathon Registration",
            "description": "Please fill all fields carefully",
            "confirmation_message": "Thanks! See you at the marathon!",
            "allow_guest_registration": true,
            "fields_data": [
                {
                    "label": "Full Name",
                    "field_type": "text",
                    "is_required": true,
                    "placeholder": "Enter your full name",
                    "order": 1
                },
                {
                    "label": "Email Address",
                    "field_type": "email",
                    "is_required": true,
                    "placeholder": "you@example.com",
                    "order": 2
                },
                {
                    "label": "T-Shirt Size",
                    "field_type": "dropdown",
                    "is_required": true,
                    "options": ["XS", "S", "M", "L", "XL", "XXL"],
                    "order": 3
                },
                {
                    "label": "Dietary Requirements",
                    "field_type": "dropdown",
                    "is_required": false,
                    "options": ["None", "Vegetarian", "Vegan", "Halal"],
                    "order": 4
                }
            ]
        }
        """
        event = self.get_object()
        
        # Check if form already exists
        try:
            form = event.registration_form
            # Update existing form
            serializer = EventRegistrationFormWriteSerializer(form, data=request.data, partial=True)
        except EventRegistrationForm.DoesNotExist:
            # Create new form
            serializer = EventRegistrationFormWriteSerializer(data=request.data)
        
        if serializer.is_valid():
            if 'event' not in request.data:
                # Auto-set event if not provided
                serializer.validated_data['event'] = event
            
            form = serializer.save()
            response_serializer = EventRegistrationFormSerializer(form)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'], permission_classes=[AllowAny])
    def submit_registration(self, request, pk=None):
        """
        Submit registration with custom form data.
        Works for both authenticated users and guests (if allowed).
        
        Example request body:
        {
            "form_data": {
                "full_name": "John Doe",
                "email_address": "john@example.com",
                "t_shirt_size": "L",
                "dietary_requirements": "Halal"
            }
        }
        """
        event = self.get_object()
        
        # Check if event is full
        if event.is_full:
            return Response({
                'error': 'Event is at full capacity'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if custom form exists
        has_custom_form = hasattr(event, 'registration_form')
        
        if has_custom_form:
            form = event.registration_form
            
            # Check if guest registration is allowed
            if not form.allow_guest_registration and not request.user.is_authenticated:
                return Response({
                    'error': 'Please login to register for this event'
                }, status=status.HTTP_401_UNAUTHORIZED)
        
        # Validate and extract form data
        form_data = request.data.get('form_data', {})
        
        # Extract contact info from form data (for quick lookup)
        contact_name = form_data.get('full_name') or form_data.get('name') or ''
        contact_email = form_data.get('email_address') or form_data.get('email') or ''
        contact_phone = form_data.get('phone_number') or form_data.get('phone') or ''
        
        # Create registration
        registration_data = {
            'event': event.id,
            'form_data': form_data,
            'contact_name': contact_name,
            'contact_email': contact_email,
            'contact_phone': contact_phone,
        }
        
        # Add user if authenticated
        if request.user.is_authenticated:
            registration_data['user'] = request.user.id
            
            # Check if user already registered
            existing = EventRegistration.objects.filter(
                user=request.user,
                event=event,
                status='confirmed'
            ).first()
            
            if existing:
                return Response({
                    'error': 'You are already registered for this event'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = EventRegistrationSerializer(data=registration_data)
        
        if serializer.is_valid():
            # Determine initial status based on event's requires_approval setting
            if event.requires_approval:
                registration_data['status'] = 'pending'
            else:
                registration_data['status'] = 'confirmed'
            
            # Re-validate with status
            serializer = EventRegistrationSerializer(data=registration_data)
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            registration = serializer.save()
            
            # Send appropriate email based on status
            if registration.status == 'pending':
                # Send pending approval email
                email_sent = send_registration_confirmation(registration, event, is_pending=True)
                if email_sent:
                    print(f"✅ Pending approval email sent to {contact_email}")
                else:
                    print(f"⚠️ Failed to send pending email to {contact_email}")
                
                # Return approval message
                confirmation_msg = event.approval_message or "Your registration is pending approval. You will receive an email once reviewed."
            else:
                # Send automatic confirmation email
                email_sent = send_registration_confirmation(registration, event)
                if email_sent:
                    print(f"✅ Confirmation email sent to {contact_email}")
                else:
                    print(f"⚠️ Failed to send confirmation email to {contact_email}")
                
                # Get confirmation message
                confirmation_msg = "Thank you for registering!"
                if has_custom_form:
                    confirmation_msg = form.confirmation_message
            
            return Response({
                'message': confirmation_msg,
                'registration': EventRegistrationSerializer(registration).data,
                'event': {
                    'title': event.title,
                    'attendee_count': event.attendee_count,
                    'spots_remaining': event.spots_remaining,
                },
                'email_sent': email_sent,
                'requires_approval': event.requires_approval,
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'], permission_classes=[IsAdminUser])
    def pending_registrations(self, request, pk=None):
        """Get all pending registrations for this event (Admin only)"""
        event = self.get_object()
        pending = event.registrations.filter(status='pending').order_by('-registered_at')
        serializer = EventRegistrationSerializer(pending, many=True)
        return Response({
            'count': pending.count(),
            'registrations': serializer.data
        })
    
    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser], url_path='registrations/(?P<registration_id>[^/.]+)/approve')
    def approve_registration(self, request, pk=None, registration_id=None):
        """Approve a pending registration (Admin only)"""
        from django.utils.timezone import now as timezone_now
        from .emails import send_approval_email
        
        event = self.get_object()
        
        try:
            registration = event.registrations.get(id=registration_id, status='pending')
        except EventRegistration.DoesNotExist:
            return Response({
                'error': 'Pending registration not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Check capacity
        if event.is_full:
            return Response({
                'error': 'Event is at full capacity. Cannot approve more registrations.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Update registration
        registration.status = 'confirmed'
        registration.reviewed_by = request.user
        registration.reviewed_at = timezone_now()
        registration.admin_notes = request.data.get('admin_notes', '')
        registration.save()
        
        # Send approval email
        email_sent = send_approval_email(registration, event)
        if email_sent:
            print(f"✅ Approval email sent to {registration.contact_email}")
        else:
            print(f"⚠️ Failed to send approval email to {registration.contact_email}")
        
        return Response({
            'message': 'Registration approved successfully',
            'registration': EventRegistrationSerializer(registration).data,
            'email_sent': email_sent
        })
    
    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser], url_path='registrations/(?P<registration_id>[^/.]+)/reject')
    def reject_registration(self, request, pk=None, registration_id=None):
        """Reject a pending registration (Admin only)"""
        from django.utils.timezone import now as timezone_now
        from .emails import send_rejection_email
        
        event = self.get_object()
        
        try:
            registration = event.registrations.get(id=registration_id, status='pending')
        except EventRegistration.DoesNotExist:
            return Response({
                'error': 'Pending registration not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Update registration
        registration.status = 'rejected'
        registration.reviewed_by = request.user
        registration.reviewed_at = timezone_now()
        registration.admin_notes = request.data.get('admin_notes', '')
        registration.save()
        
        # Send rejection email
        reason = request.data.get('reason', 'Unfortunately, we cannot approve your registration at this time.')
        email_sent = send_rejection_email(registration, event, reason)
        if email_sent:
            print(f"✅ Rejection email sent to {registration.contact_email}")
        else:
            print(f"⚠️ Failed to send rejection email to {registration.contact_email}")
        
        return Response({
            'message': 'Registration rejected',
            'registration': EventRegistrationSerializer(registration).data,
            'email_sent': email_sent
        })

