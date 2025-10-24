from django.contrib import admin
from .models import Stay

@admin.register(Stay)
class StayAdmin(admin.ModelAdmin):
    list_display = ("name", "type", "district", "priceNight", "rating", "is_active")
    list_filter = ("district", "type", "is_active")
    search_fields = ("name", "district", "landmark")
