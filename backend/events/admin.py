# backend/events/admin.py
from django.contrib import admin
from .models import Event, EventRegistration, EventRegistrationForm, EventRegistrationField, EventReminder


# ✨ Inline for Registration Form Fields
class EventRegistrationFieldInline(admin.TabularInline):
    model = EventRegistrationField
    extra = 1
    fields = ('label', 'field_type', 'is_required', 'placeholder', 'options', 'order')
    ordering = ('order',)


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
    list_display = ('contact_name', 'event', 'status', 'contact_email', 'registered_at')
    list_filter = ('status', 'registered_at', 'event')
    search_fields = ('contact_name', 'contact_email', 'contact_phone', 'event__title')
    date_hierarchy = 'registered_at'
    readonly_fields = ('registered_at', 'updated_at', 'form_data')


@admin.register(EventReminder)
class EventReminderAdmin(admin.ModelAdmin):
    list_display = ('user', 'event', 'reminder_time', 'is_sent', 'sent_at')
    list_filter = ('is_sent', 'reminder_time')
    search_fields = ('user__username', 'event__title')


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ("title", "start_date", "city", "attendee_count", "max_capacity", "expected_attendance", "actual_attendance", "is_published", "has_form")
    list_filter = ("city", "is_published", "start_date")
    search_fields = ("title", "description", "city", "location_name", "tags")
    date_hierarchy = "start_date"
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'description', 'tags', 'is_published')
        }),
        ('Date & Location', {
            'fields': ('start_date', 'end_date', 'location_name', 'city', 'lat', 'lon')
        }),
        ('Capacity', {
            'fields': ('max_capacity', 'expected_attendance', 'actual_attendance'),
            'description': 'Max capacity for registrations, expected attendance for planning, actual attendance for completed events'
        }),
        ('Recurrence', {
            'fields': ('recurrence_type', 'recurrence_end_date', 'parent_event', 'is_recurring_instance'),
            'classes': ('collapse',),
        }),
    )
    
    def has_form(self, obj):
        return hasattr(obj, 'registration_form')
    has_form.boolean = True
    has_form.short_description = 'Has Custom Form'
    
    def attendee_count(self, obj):
        return obj.attendee_count
    attendee_count.short_description = 'Registered'
