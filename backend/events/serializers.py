# backend/events/serializers.py
from rest_framework import serializers
from .models import Event, EventRegistration, EventReminder, EventRegistrationForm, EventRegistrationField


# ✨ PART 1: Registration Form Serializers (must be first since EventDetailSerializer uses them)

# ✨ NEW: Registration Form Field Serializer
class EventRegistrationFieldSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventRegistrationField
        fields = [
            'id', 'label', 'field_type', 'is_required', 'placeholder', 
            'help_text', 'options', 'order', 'min_length', 'max_length', 'pattern'
        ]


# ✨ NEW: Registration Form Serializer
class EventRegistrationFormSerializer(serializers.ModelSerializer):
    fields = EventRegistrationFieldSerializer(many=True, read_only=True)
    event_title = serializers.CharField(source='event.title', read_only=True)
    
    class Meta:
        model = EventRegistrationForm
        fields = [
            'id', 'event', 'event_title', 'title', 'description', 
            'confirmation_message', 'allow_guest_registration', 
            'fields', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


# ✨ NEW: Writable Registration Form Serializer (for organizers)
class EventRegistrationFormWriteSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating registration forms with fields"""
    
    fields_data = serializers.ListField(
        child=serializers.DictField(),
        write_only=True,
        required=False,
        help_text="List of field configurations"
    )
    
    class Meta:
        model = EventRegistrationForm
        fields = [
            'event', 'title', 'description', 'confirmation_message', 
            'allow_guest_registration', 'fields_data'
        ]
    
    def create(self, validated_data):
        fields_data = validated_data.pop('fields_data', [])
        form = EventRegistrationForm.objects.create(**validated_data)
        
        # Create fields
        for field_data in fields_data:
            EventRegistrationField.objects.create(form=form, **field_data)
        
        return form
    
    def update(self, instance, validated_data):
        fields_data = validated_data.pop('fields_data', None)
        
        # Update form
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update fields if provided
        if fields_data is not None:
            # Delete existing fields
            instance.fields.all().delete()
            # Create new fields
            for field_data in fields_data:
                EventRegistrationField.objects.create(form=instance, **field_data)
        
        return instance


# ✨ PART 2: Event Serializers (now that form serializers are defined)

class EventSerializer(serializers.ModelSerializer):
    created_by_username = serializers.ReadOnlyField(source='created_by.username')
    
    # ✨ NEW: Computed fields for capacity management
    attendee_count = serializers.SerializerMethodField()
    spots_remaining = serializers.SerializerMethodField()
    is_full = serializers.SerializerMethodField()
    user_registered = serializers.SerializerMethodField()
    user_has_reminder = serializers.SerializerMethodField()
    
    # ✨ NEW: Live event status fields
    is_happening_now = serializers.SerializerMethodField()
    days_into_event = serializers.SerializerMethodField()
    total_days = serializers.SerializerMethodField()
    days_remaining = serializers.SerializerMethodField()
    
    # ✨ NEW: Include registration form if exists
    has_custom_form = serializers.SerializerMethodField()
    
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
            # ✨ CAPACITY FIELDS:
            "max_capacity",
            "attendee_count",
            "spots_remaining",
            "is_full",
            "user_registered",
            "user_has_reminder",
            # ✨ RECURRING FIELDS:
            "recurrence_type",
            "recurrence_end_date",
            "parent_event",
            "is_recurring_instance",
            # ✨ LIVE STATUS FIELDS:
            "is_happening_now",
            "days_into_event",
            "total_days",
            "days_remaining",
            # ✨ FORM FIELDS:
            "has_custom_form",
            # ✨ APPROVAL WORKFLOW FIELDS:
            "requires_approval",
            "registration_form_config",
            "approval_message",
        ]
        read_only_fields = [
            'created_by', 
            'created_by_username', 
            'attendee_count', 
            'spots_remaining', 
            'is_full', 
            'user_registered', 
            'user_has_reminder', 
            'is_recurring_instance',
            'is_happening_now',
            'days_into_event',
            'total_days',
            'days_remaining',
            'has_custom_form',
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
    
    def get_is_happening_now(self, obj):
        """Check if event is currently happening"""
        return obj.is_happening_now  # Access @property
    
    def get_days_into_event(self, obj):
        """Return which day of multi-day event we're on"""
        return obj.days_into_event  # Access @property
    
    def get_total_days(self, obj):
        """Return total duration in days"""
        return obj.total_days  # Access @property
    
    def get_days_remaining(self, obj):
        """Return days remaining in event"""
        return obj.days_remaining  # Access @property
    
    def get_has_custom_form(self, obj):
        """Check if event has custom registration form"""
        return hasattr(obj, 'registration_form')

    def validate_tags(self, value):
        # Normalize None -> []
        return value or []


# ✨ NEW: Detailed serializer for single event view
class EventDetailSerializer(EventSerializer):
    """Extended serializer with additional details for single event view"""
    registration_form = EventRegistrationFormSerializer(read_only=True)
    
    class Meta(EventSerializer.Meta):
        fields = EventSerializer.Meta.fields + ['registration_form']
        read_only_fields = EventSerializer.Meta.read_only_fields


# ✨ PART 3: Registration & Reminder Serializers

# ✨ NEW: Event Registration serializer
class EventRegistrationSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True, allow_null=True)
    event_title = serializers.CharField(source='event.title', read_only=True)
    reviewed_by_username = serializers.CharField(source='reviewed_by.username', read_only=True, allow_null=True)
    
    class Meta:
        model = EventRegistration
        fields = [
            'id', 'user', 'user_username', 'event', 'event_title', 
            'status', 'form_data', 'contact_name', 'contact_email', 'contact_phone',
            'admin_notes', 'reviewed_by', 'reviewed_by_username', 'reviewed_at',
            'registered_at', 'updated_at'
        ]
        read_only_fields = ['registered_at', 'updated_at', 'reviewed_by', 'reviewed_at']
    
    def validate_form_data(self, value):
        """Validate that form_data matches the event's registration form schema"""
        event = self.initial_data.get('event')
        if not event:
            return value
        
        # Get the event's registration form (if it exists)
        try:
            event_obj = Event.objects.get(id=event)
            if hasattr(event_obj, 'registration_form'):
                form = event_obj.registration_form
                required_fields = form.fields.filter(is_required=True)
                
                # Check all required fields are present
                for field in required_fields:
                    field_key = field.label.lower().replace(' ', '_').replace('?', '')
                    
                    # Field must exist in form data
                    if field_key not in value:
                        raise serializers.ValidationError(
                            f"Required field '{field.label}' is missing"
                        )
                    
                    # For checkbox fields, empty arrays are valid (user chose nothing)
                    # For other fields, check if value is empty
                    if field.field_type == 'checkbox':
                        # Checkbox is valid even if empty array
                        continue
                    
                    # For non-checkbox fields, value must not be empty
                    if not value[field_key]:
                        raise serializers.ValidationError(
                            f"Required field '{field.label}' cannot be empty"
                        )
        except Event.DoesNotExist:
            pass
        
        return value


# ✨ NEW: Event Reminder serializer
class EventReminderSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True)
    event_title = serializers.CharField(source='event.title', read_only=True)
    
    class Meta:
        model = EventReminder
        fields = ['id', 'user', 'user_username', 'event', 'event_title', 'reminder_time', 
                  'is_sent', 'sent_at', 'created_at']
        read_only_fields = ['is_sent', 'sent_at', 'created_at']
