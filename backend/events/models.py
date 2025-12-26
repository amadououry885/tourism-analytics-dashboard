from django.db import models
from django.conf import settings
from django.utils.timezone import now
from datetime import timedelta
from dateutil.relativedelta import relativedelta

class Event(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    start_date = models.DateTimeField()
    end_date = models.DateTimeField(null=True, blank=True)
    location_name = models.CharField(max_length=200, blank=True)
    city = models.CharField(max_length=120, blank=True, db_index=True)
    lat = models.FloatField(null=True, blank=True)
    lon = models.FloatField(null=True, blank=True)
    tags = models.JSONField(default=list, blank=True)
    is_published = models.BooleanField(default=True)
    
    # Attendance tracking
    expected_attendance = models.IntegerField(null=True, blank=True, help_text="Expected number of attendees")
    actual_attendance = models.IntegerField(null=True, blank=True, help_text="Actual number of attendees (for past events)")
    image_url = models.TextField(blank=True, default="", help_text="URL or base64 data URL for event image")
    
    # Ownership tracking
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_events',
        help_text="Admin user who created this event"
    )
    
    # ✨ NEW: Capacity Management
    max_capacity = models.IntegerField(null=True, blank=True, help_text="Maximum number of attendees (leave blank for unlimited)")
    
    # ✨ NEW: Recurring Events
    recurrence_type = models.CharField(
        max_length=20,
        choices=[
            ('none', 'Does not repeat'),
            ('daily', 'Daily'),
            ('weekly', 'Weekly'),
            ('monthly', 'Monthly'),
            ('yearly', 'Yearly'),
        ],
        default='none',
        help_text="How often this event repeats"
    )
    recurrence_end_date = models.DateField(null=True, blank=True, help_text="Stop generating recurring instances after this date")
    parent_event = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='recurring_instances',
        help_text="Reference to parent event if this is a recurring instance"
    )
    is_recurring_instance = models.BooleanField(default=False, help_text="True if this event was auto-generated from a recurring parent")

    class Meta:
        ordering = ["-start_date"]
        indexes = [
            models.Index(fields=["city"]),
            models.Index(fields=["start_date"]),
            models.Index(fields=["recurrence_type"]),
        ]

    def __str__(self):
        return self.title
    
    # ✨ NEW PROPERTY: Get attendee count
    @property
    def attendee_count(self):
        """Return count of confirmed registrations"""
        return self.registrations.filter(status='confirmed').count()
    
    # ✨ NEW PROPERTY: Get spots remaining
    @property
    def spots_remaining(self):
        """Return remaining capacity"""
        if self.max_capacity is None:
            return None
        return max(0, self.max_capacity - self.attendee_count)
    
    # ✨ NEW PROPERTY: Check if event is full
    @property
    def is_full(self):
        """Check if event has reached capacity"""
        if self.max_capacity is None:
            return False
        return self.attendee_count >= self.max_capacity
    
    # ✨ NEW PROPERTY: Check if event is happening now
    @property
    def is_happening_now(self):
        """Check if event is currently active (between start and end dates)"""
        from django.utils.timezone import now as timezone_now
        current_time = timezone_now()
        
        if self.end_date:
            return self.start_date <= current_time <= self.end_date
        else:
            # If no end date, check if it started today
            return self.start_date.date() == current_time.date() and self.start_date <= current_time
    
    # ✨ NEW PROPERTY: Days into multi-day event
    @property
    def days_into_event(self):
        """Return which day of the event we're on (for multi-day events)"""
        from django.utils.timezone import now as timezone_now
        if not self.is_happening_now or not self.end_date:
            return None
        
        current_time = timezone_now()
        days_passed = (current_time.date() - self.start_date.date()).days + 1
        return max(1, days_passed)
    
    # ✨ NEW PROPERTY: Total days of event
    @property
    def total_days(self):
        """Return total duration in days"""
        if not self.end_date:
            return 1
        return (self.end_date.date() - self.start_date.date()).days + 1
    
    # ✨ NEW PROPERTY: Days remaining in event
    @property
    def days_remaining(self):
        """Return days remaining in event (for happening events)"""
        from django.utils.timezone import now as timezone_now
        if not self.is_happening_now or not self.end_date:
            return None
        
        current_time = timezone_now()
        days_left = (self.end_date.date() - current_time.date()).days
        return max(0, days_left)
    
    # ✨ NEW METHOD: Check if user is registered
    def is_user_registered(self, user):
        """Check if user has confirmed registration"""
        if not user or not user.is_authenticated:
            return False
        return self.registrations.filter(user=user, status='confirmed').exists()
    
    # ✨ NEW METHOD: Check if user has reminder set
    def user_has_reminder(self, user):
        """Check if user has any reminders set"""
        if not user or not user.is_authenticated:
            return False
        return self.reminders.filter(user=user, is_sent=False).exists()
    
    # ✨ NEW METHOD: Register user for event
    def register_user(self, user):
        """Register a user for this event"""
        if self.is_full:
            raise ValueError("Event is at full capacity")
        
        registration, created = EventRegistration.objects.get_or_create(
            user=user,
            event=self,
            defaults={'status': 'confirmed'}
        )
        
        if not created and registration.status == 'cancelled':
            registration.status = 'confirmed'
            registration.save()
        
        return registration
    
    # ✨ NEW METHOD: Unregister user from event
    def unregister_user(self, user):
        """Cancel user's registration"""
        EventRegistration.objects.filter(
            user=user,
            event=self
        ).update(status='cancelled')
    
    # ✨ NEW METHOD: Generate recurring instances
    def generate_recurring_instances(self, count=12):
        """Generate future event instances based on recurrence rule"""
        if self.recurrence_type == 'none' or self.is_recurring_instance:
            return []
        
        instances = []
        current_date = self.start_date
        end_limit = self.recurrence_end_date or (now().date() + timedelta(days=365))
        
        for i in range(count):
            # Calculate next occurrence
            if self.recurrence_type == 'daily':
                current_date = current_date + timedelta(days=1)
            elif self.recurrence_type == 'weekly':
                current_date = current_date + timedelta(weeks=1)
            elif self.recurrence_type == 'monthly':
                current_date = current_date + relativedelta(months=1)
            elif self.recurrence_type == 'yearly':
                current_date = current_date + relativedelta(years=1)
            
            if current_date.date() > end_limit:
                break
            
            # Check if instance already exists for this date
            existing = Event.objects.filter(
                parent_event=self,
                start_date__date=current_date.date()
            ).exists()
            
            if existing:
                continue  # Skip if already exists
            
            # Create instance
            instance = Event.objects.create(
                title=self.title,
                description=self.description,
                start_date=current_date,
                end_date=self.end_date + (current_date - self.start_date) if self.end_date else None,
                location_name=self.location_name,
                city=self.city,
                lat=self.lat,
                lon=self.lon,
                tags=self.tags,
                expected_attendance=self.expected_attendance,
                is_published=self.is_published,
                image_url=self.image_url,
                created_by=self.created_by,
                max_capacity=self.max_capacity,
                parent_event=self,
                is_recurring_instance=True,
                recurrence_type='none'
            )
            instances.append(instance)
        
        return instances
    
    # ✨ NEW METHOD: Get nearby stays
    def get_nearby_stays(self, radius_km=10):
        """Get stays within radius of event location"""
        from stays.models import Stay
        from math import radians, sin, cos, sqrt, atan2
        
        if not self.lat or not self.lon:
            return Stay.objects.none()
        
        stays = []
        for stay in Stay.objects.filter(is_internal=True):
            if stay.lat and stay.lon:
                # Haversine formula
                R = 6371  # Earth radius in km
                lat1, lon1 = radians(self.lat), radians(self.lon)
                lat2, lon2 = radians(stay.lat), radians(stay.lon)
                dlat = lat2 - lat1
                dlon = lon2 - lon1
                a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
                c = 2 * atan2(sqrt(a), sqrt(1-a))
                distance = R * c
                
                if distance <= radius_km:
                    stays.append(stay)
        
        return stays[:3]  # Return top 3
    
    # ✨ NEW METHOD: Get affiliate URLs
    def get_affiliate_urls(self):
        """Generate affiliate booking URLs"""
        location = f"{self.location_name or self.title}, {self.city or 'Malaysia'}"
        checkin = self.start_date.strftime('%Y-%m-%d')
        
        return {
            'booking_com': f"https://www.booking.com/search?ss={location}&checkin={checkin}",
            'agoda': f"https://www.agoda.com/search?city={self.city}&checkIn={checkin}",
            'trip_com': f"https://www.trip.com/hotels?locale=en-US&curr=MYR&checkin={checkin}&search={location}"
        }
    
    # ✨ NEW METHOD: Get nearby restaurants
    def get_nearby_restaurants(self, radius_km=5):
        """Get vendors/restaurants within radius"""
        from vendors.models import Vendor
        from math import radians, sin, cos, sqrt, atan2
        
        if not self.lat or not self.lon:
            return Vendor.objects.none()
        
        vendors = []
        for vendor in Vendor.objects.filter(is_approved=True):
            if vendor.lat and vendor.lon:
                R = 6371
                lat1, lon1 = radians(self.lat), radians(self.lon)
                lat2, lon2 = radians(vendor.lat), radians(vendor.lon)
                dlat = lat2 - lat1
                dlon = lon2 - lon1
                a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
                c = 2 * atan2(sqrt(a), sqrt(1-a))
                distance = R * c
                
                if distance <= radius_km:
                    vendors.append(vendor)
        
        return vendors[:3]


# ✨ NEW MODEL: Event Registration
class EventRegistration(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='event_registrations',
        null=True,  # Allow guest registrations
        blank=True
    )
    event = models.ForeignKey(
        Event,
        on_delete=models.CASCADE,
        related_name='registrations'
    )
    status = models.CharField(
        max_length=20,
        choices=[
            ('confirmed', 'Confirmed'),
            ('cancelled', 'Cancelled'),
            ('waitlist', 'Waitlist'),
        ],
        default='confirmed'
    )
    
    # ✨ NEW: Store form responses as JSON
    form_data = models.JSONField(
        default=dict,
        blank=True,
        help_text="User's responses to custom registration fields"
    )
    
    # ✨ NEW: Basic contact info (extracted from form_data for quick access)
    contact_name = models.CharField(max_length=200, blank=True)
    contact_email = models.CharField(max_length=254, blank=True)  # Changed from EmailField to allow any format
    contact_phone = models.CharField(max_length=20, blank=True)
    
    registered_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-registered_at']
        indexes = [
            models.Index(fields=['event', 'status']),
            models.Index(fields=['user']),
            models.Index(fields=['contact_email']),
        ]
    
    def __str__(self):
        name = self.contact_name or (self.user.username if self.user else 'Guest')
        return f"{name} → {self.event.title} ({self.status})"


# ✨ NEW MODEL: Custom Registration Form Configuration
class EventRegistrationForm(models.Model):
    """
    Defines the custom registration form for an event.
    Each event can have its own set of required fields.
    """
    event = models.OneToOneField(
        Event,
        on_delete=models.CASCADE,
        related_name='registration_form',
        help_text="Event this form belongs to"
    )
    
    title = models.CharField(
        max_length=200,
        default="Event Registration",
        help_text="Form title shown to users"
    )
    
    description = models.TextField(
        blank=True,
        help_text="Instructions or welcome message for form"
    )
    
    confirmation_message = models.TextField(
        default="Thank you for registering! You will receive a confirmation email shortly.",
        help_text="Message shown after successful registration"
    )
    
    # ✨ Allow guest registrations (without login)
    allow_guest_registration = models.BooleanField(
        default=True,
        help_text="Allow users to register without logging in"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Registration Form: {self.event.title}"


# ✨ NEW MODEL: Individual Form Fields
class EventRegistrationField(models.Model):
    """
    Individual fields in a registration form.
    Examples: name, email, phone, age, dietary_preferences, etc.
    """
    FIELD_TYPES = [
        ('text', 'Short Text'),
        ('textarea', 'Long Text'),
        ('email', 'Email'),
        ('phone', 'Phone Number'),
        ('number', 'Number'),
        ('date', 'Date'),
        ('dropdown', 'Dropdown Select'),
        ('checkbox', 'Checkbox'),
        ('radio', 'Radio Buttons'),
    ]
    
    form = models.ForeignKey(
        EventRegistrationForm,
        on_delete=models.CASCADE,
        related_name='fields',
        help_text="Form this field belongs to"
    )
    
    label = models.CharField(
        max_length=200,
        help_text="Field label shown to user (e.g., 'Full Name', 'Email Address')"
    )
    
    field_type = models.CharField(
        max_length=20,
        choices=FIELD_TYPES,
        default='text',
        help_text="Type of input field"
    )
    
    is_required = models.BooleanField(
        default=True,
        help_text="Is this field mandatory?"
    )
    
    placeholder = models.CharField(
        max_length=200,
        blank=True,
        help_text="Placeholder text (e.g., 'Enter your email')"
    )
    
    help_text = models.CharField(
        max_length=500,
        blank=True,
        help_text="Additional help text below field"
    )
    
    # For dropdown/radio/checkbox options
    options = models.JSONField(
        default=list,
        blank=True,
        help_text="Options for dropdown/radio/checkbox (list of strings)"
    )
    
    # Field ordering
    order = models.IntegerField(
        default=0,
        help_text="Display order (lower numbers appear first)"
    )
    
    # Validation rules
    min_length = models.IntegerField(null=True, blank=True)
    max_length = models.IntegerField(null=True, blank=True)
    pattern = models.CharField(
        max_length=500,
        blank=True,
        help_text="Regex pattern for validation"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['order', 'id']
        indexes = [
            models.Index(fields=['form', 'order']),
        ]
    
    def __str__(self):
        required = "*" if self.is_required else ""
        return f"{self.label}{required} ({self.field_type})"


# ✨ NEW MODEL: Event Reminder
class EventReminder(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='event_reminders'
    )
    event = models.ForeignKey(
        Event,
        on_delete=models.CASCADE,
        related_name='reminders'
    )
    reminder_time = models.CharField(
        max_length=20,
        choices=[
            ('1_week', '1 Week Before'),
            ('1_day', '1 Day Before'),
            ('1_hour', '1 Hour Before'),
        ]
    )
    is_sent = models.BooleanField(default=False)
    sent_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('user', 'event', 'reminder_time')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['event', 'is_sent']),
            models.Index(fields=['reminder_time', 'is_sent']),
        ]
    
    def __str__(self):
        return f"{self.user.username} → {self.event.title} ({self.reminder_time})"
