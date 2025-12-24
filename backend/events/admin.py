# backend/events/admin.py
from django.contrib import admin
from django.contrib import messages
from django.utils.html import format_html
from .models import Event, EventRegistration, EventRegistrationForm, EventRegistrationField, EventReminder
from .emails import send_registration_confirmation, send_event_reminder


# ✨ Inline for Registration Form Fields
class EventRegistrationFieldInline(admin.TabularInline):
    model = EventRegistrationField
    extra = 1
    fields = ('label', 'field_type', 'is_required', 'placeholder', 'options', 'order')
    ordering = ('order',)


# ✨ Inline for Event Registrations (view from Event)
class EventRegistrationInline(admin.TabularInline):
    model = EventRegistration
    extra = 0
    readonly_fields = ('contact_name', 'contact_email', 'contact_phone', 'status', 'registered_at')
    fields = ('contact_name', 'contact_email', 'contact_phone', 'status', 'registered_at')
    can_delete = False
    max_num = 0  # Don't allow adding from inline
    
    def has_add_permission(self, request, obj=None):
        return False


@admin.register(EventRegistrationForm)
class EventRegistrationFormAdmin(admin.ModelAdmin):
    list_display = ('event', 'title', 'allow_guest_registration', 'field_count', 'created_at')
    search_fields = ('event__title', 'title', 'description')
    inlines = [EventRegistrationFieldInline]
    
    def field_count(self, obj):
        return obj.fields.count()
    field_count.short_description = 'Fields'


@admin.register(EventRegistration)
class EventRegistrationAdmin(admin.ModelAdmin):
    list_display = ('contact_name', 'event', 'status', 'contact_email', 'contact_phone', 'registered_at', 'email_actions')
    list_filter = ('status', 'registered_at', 'event')
    search_fields = ('contact_name', 'contact_email', 'contact_phone', 'event__title')
    date_hierarchy = 'registered_at'
    readonly_fields = ('registered_at', 'updated_at', 'form_data_display')
    actions = ['send_confirmation_email', 'send_reminder_email', 'mark_as_confirmed', 'mark_as_cancelled']
    
    fieldsets = (
        ('Contact Information', {
            'fields': ('contact_name', 'contact_email', 'contact_phone')
        }),
        ('Registration Details', {
            'fields': ('event', 'user', 'status', 'registered_at', 'updated_at')
        }),
        ('Form Data', {
            'fields': ('form_data_display',),
            'classes': ('collapse',)
        }),
    )
    
    def email_actions(self, obj):
        """Display email action buttons"""
        return format_html(
            '<a class="button" href="/admin/events/eventregistration/{}/send_confirmation/" '
            'style="padding: 2px 8px; background: #417690; color: white; text-decoration: none; border-radius: 3px; margin-right: 5px;">'
            '📧 Confirmation</a>',
            obj.id
        )
    email_actions.short_description = 'Actions'
    email_actions.allow_tags = True
    
    def form_data_display(self, obj):
        """Format form data for display"""
        if not obj.form_data:
            return "No form data"
        
        html = '<table style="border-collapse: collapse; width: 100%;">'
        for key, value in obj.form_data.items():
            html += f'<tr><td style="padding: 5px; border: 1px solid #ddd; font-weight: bold;">{key}</td>'
            html += f'<td style="padding: 5px; border: 1px solid #ddd;">{value}</td></tr>'
        html += '</table>'
        return format_html(html)
    form_data_display.short_description = 'Submitted Form Data'
    
    @admin.action(description='📧 Send confirmation email to selected')
    def send_confirmation_email(self, request, queryset):
        """Send confirmation emails to selected registrations"""
        sent = 0
        failed = 0
        for registration in queryset:
            if registration.contact_email:
                success = send_registration_confirmation(registration, registration.event)
                if success:
                    sent += 1
                else:
                    failed += 1
        
        if sent:
            self.message_user(request, f"✅ Sent {sent} confirmation email(s)", messages.SUCCESS)
        if failed:
            self.message_user(request, f"⚠️ Failed to send {failed} email(s)", messages.WARNING)
    
    @admin.action(description='🔔 Send reminder email to selected')
    def send_reminder_email(self, request, queryset):
        """Send reminder emails to selected registrations"""
        # Group by event
        events = {}
        for registration in queryset:
            event_id = registration.event_id
            if event_id not in events:
                events[event_id] = {'event': registration.event, 'registrations': []}
            events[event_id]['registrations'].append(registration)
        
        total_sent = 0
        total_failed = 0
        for event_id, data in events.items():
            sent, failed = send_event_reminder(data['registrations'], data['event'])
            total_sent += sent
            total_failed += failed
        
        if total_sent:
            self.message_user(request, f"✅ Sent {total_sent} reminder email(s)", messages.SUCCESS)
        if total_failed:
            self.message_user(request, f"⚠️ Failed to send {total_failed} email(s)", messages.WARNING)
    
    @admin.action(description='✅ Mark as confirmed')
    def mark_as_confirmed(self, request, queryset):
        updated = queryset.update(status='confirmed')
        self.message_user(request, f"✅ Marked {updated} registration(s) as confirmed", messages.SUCCESS)
    
    @admin.action(description='❌ Mark as cancelled')
    def mark_as_cancelled(self, request, queryset):
        updated = queryset.update(status='cancelled')
        self.message_user(request, f"❌ Marked {updated} registration(s) as cancelled", messages.SUCCESS)


@admin.register(EventReminder)
class EventReminderAdmin(admin.ModelAdmin):
    list_display = ('user', 'event', 'reminder_time', 'is_sent', 'sent_at')
    list_filter = ('is_sent', 'reminder_time', 'event')
    search_fields = ('user__username', 'event__title')
    actions = ['mark_as_sent', 'send_reminder_now']
    
    @admin.action(description='✅ Mark as sent')
    def mark_as_sent(self, request, queryset):
        from django.utils.timezone import now
        updated = queryset.update(is_sent=True, sent_at=now())
        self.message_user(request, f"Marked {updated} reminder(s) as sent", messages.SUCCESS)
    
    @admin.action(description='🔔 Send reminder now')
    def send_reminder_now(self, request, queryset):
        """Actually send reminder emails for selected reminders"""
        from django.utils.timezone import now
        sent = 0
        for reminder in queryset.filter(is_sent=False):
            # Get user's registration for this event
            registration = EventRegistration.objects.filter(
                user=reminder.user,
                event=reminder.event,
                status='confirmed'
            ).first()
            
            if registration and registration.contact_email:
                success_count, _ = send_event_reminder([registration], reminder.event)
                if success_count > 0:
                    reminder.is_sent = True
                    reminder.sent_at = now()
                    reminder.save()
                    sent += 1
        
        self.message_user(request, f"✅ Sent {sent} reminder(s)", messages.SUCCESS)


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ("title", "start_date", "city", "attendee_count", "max_capacity", "spots_display", "is_published", "has_form", "send_reminder_link")
    list_filter = ("city", "is_published", "start_date")
    search_fields = ("title", "description", "city", "location_name", "tags")
    date_hierarchy = "start_date"
    inlines = [EventRegistrationInline]
    actions = ['send_reminder_to_all', 'duplicate_event']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'description', 'image_url', 'tags', 'is_published')
        }),
        ('Date & Location', {
            'fields': ('start_date', 'end_date', 'location_name', 'city', 'lat', 'lon')
        }),
        ('Capacity & Attendance', {
            'fields': ('max_capacity', 'expected_attendance', 'actual_attendance'),
            'description': 'Max capacity for registrations, expected attendance for planning, actual attendance for completed events'
        }),
        ('Recurrence', {
            'fields': ('recurrence_type', 'recurrence_end_date', 'parent_event', 'is_recurring_instance'),
            'classes': ('collapse',),
        }),
        ('Ownership', {
            'fields': ('created_by',),
            'classes': ('collapse',),
        }),
    )
    
    def spots_display(self, obj):
        """Show spots remaining with color coding"""
        if obj.max_capacity is None:
            return "Unlimited"
        remaining = obj.spots_remaining
        if remaining == 0:
            return format_html('<span style="color: red; font-weight: bold;">FULL</span>')
        elif remaining < 10:
            return format_html('<span style="color: orange;">{} left</span>', remaining)
        return f"{remaining} left"
    spots_display.short_description = 'Spots'
    
    def has_form(self, obj):
        return hasattr(obj, 'registration_form')
    has_form.boolean = True
    has_form.short_description = 'Form'
    
    def attendee_count(self, obj):
        return obj.attendee_count
    attendee_count.short_description = 'Registered'
    
    def send_reminder_link(self, obj):
        """Link to send reminders to all attendees"""
        count = obj.registrations.filter(status='confirmed').count()
        if count > 0:
            return format_html(
                '<a href="/admin/events/eventregistration/?event__id__exact={}" '
                'style="padding: 3px 10px; background: #28a745; color: white; text-decoration: none; border-radius: 3px;">'
                '📧 {} attendees</a>',
                obj.id, count
            )
        return "-"
    send_reminder_link.short_description = 'Send Emails'
    
    @admin.action(description='🔔 Send reminder to ALL confirmed attendees')
    def send_reminder_to_all(self, request, queryset):
        """Send reminder emails to all confirmed attendees of selected events"""
        total_sent = 0
        total_failed = 0
        
        for event in queryset:
            registrations = event.registrations.filter(status='confirmed')
            if registrations.exists():
                sent, failed = send_event_reminder(registrations, event)
                total_sent += sent
                total_failed += failed
        
        if total_sent:
            self.message_user(request, f"✅ Sent {total_sent} reminder email(s)", messages.SUCCESS)
        if total_failed:
            self.message_user(request, f"⚠️ Failed to send {total_failed} email(s)", messages.WARNING)
        if total_sent == 0 and total_failed == 0:
            self.message_user(request, "No confirmed attendees to send reminders to", messages.INFO)
    
    @admin.action(description='📋 Duplicate event')
    def duplicate_event(self, request, queryset):
        """Create a copy of selected events"""
        for event in queryset:
            event.pk = None
            event.title = f"Copy of {event.title}"
            event.is_recurring_instance = False
            event.parent_event = None
            event.actual_attendance = None
            event.save()
        
        self.message_user(request, f"✅ Duplicated {queryset.count()} event(s)", messages.SUCCESS)
