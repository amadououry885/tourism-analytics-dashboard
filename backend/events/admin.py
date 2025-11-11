# backend/events/admin.py
from django.contrib import admin
from .models import Event

@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ("title", "start_date", "city", "expected_attendance", "actual_attendance", "is_published")
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
        ('Attendance', {
            'fields': ('expected_attendance', 'actual_attendance'),
            'description': 'Expected attendance for planning, actual attendance for completed events'
        }),
    )
