# backend/events/serializers.py
from rest_framework import serializers
from .models import Event, EventRegistration, EventReminder


class EventSerializer(serializers.ModelSerializer):
    created_by_username = serializers.ReadOnlyField(source='created_by.username')
    
    # ✨ NEW: Computed fields for capacity management
    attendee_count = serializers.SerializerMethodField()
    spots_remaining = serializers.SerializerMethodField()
    is_full = serializers.SerializerMethodField()
    user_registered = serializers.SerializerMethodField()
    user_has_reminder = serializers.SerializerMethodField()
    
    class Meta:
        model = Event
        fields = [
            "id",
            "title",
            "description",
            "start_date",
            "end_date",
            "location_name",
            "city",
            "lat",
            "lon",
            "tags",
            "image_url",
            "is_published",
            "expected_attendance",
            "actual_attendance",
            "created_by",
            "created_by_username",
            # ✨ NEW FIELDS:
            "max_capacity",
            "attendee_count",
            "spots_remaining",
            "is_full",
            "user_registered",
            "user_has_reminder",
            "recurrence_type",
            "recurrence_end_date",
            "parent_event",
            "is_recurring_instance",
        ]
        read_only_fields = [
            'created_by', 
            'created_by_username', 
            'attendee_count', 
            'spots_remaining', 
            'is_full', 
            'user_registered', 
            'user_has_reminder', 
            'is_recurring_instance'
        ]
    
    def get_attendee_count(self, obj):
        """Return count of confirmed registrations"""
        return obj.attendee_count  # Access @property (no parentheses!)
    
    def get_spots_remaining(self, obj):
        """Return remaining capacity"""
        return obj.spots_remaining  # Access @property
    
    def get_is_full(self, obj):
        """Check if event is at capacity"""
        return obj.is_full  # Access @property
    
    def get_user_registered(self, obj):
        """Check if current user is registered"""
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        return obj.is_user_registered(request.user)
    
    def get_user_has_reminder(self, obj):
        """Check if current user has reminders set"""
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        return obj.user_has_reminder(request.user)

    def validate_tags(self, value):
        # Normalize None -> []
        return value or []


# ✨ NEW: Detailed serializer for single event view
class EventDetailSerializer(EventSerializer):
    """Extended serializer with additional details for single event view"""
    
    class Meta(EventSerializer.Meta):
        fields = EventSerializer.Meta.fields
        read_only_fields = EventSerializer.Meta.read_only_fields


# ✨ NEW: Event Registration serializer
class EventRegistrationSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True)
    event_title = serializers.CharField(source='event.title', read_only=True)
    
    class Meta:
        model = EventRegistration
        fields = ['id', 'user', 'user_username', 'event', 'event_title', 'registered_at', 'status']
        read_only_fields = ['registered_at']


# ✨ NEW: Event Reminder serializer
class EventReminderSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True)
    event_title = serializers.CharField(source='event.title', read_only=True)
    
    class Meta:
        model = EventReminder
        fields = ['id', 'user', 'user_username', 'event', 'event_title', 'reminder_time', 
                  'is_sent', 'sent_at', 'created_at']
        read_only_fields = ['is_sent', 'sent_at', 'created_at']
