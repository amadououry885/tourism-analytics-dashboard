# backend/events/admin.py
from django.contrib import admin
from .models import Event

@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ("title", "start_date", "city", "is_published")
    list_filter = ("city", "is_published", "start_date")
    search_fields = ("title", "description", "city", "location_name", "tags")
    date_hierarchy = "start_date"
