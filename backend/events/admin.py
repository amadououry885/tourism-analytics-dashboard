from django.contrib import admin

# Register your models here.
from django.contrib import admin
from .models import Event

@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ("title", "start_date", "city", "is_published")
    list_filter = ("city", "is_published", "start_date")
    search_fields = ("title", "description", "city")
    date_hierarchy = "start_date"
