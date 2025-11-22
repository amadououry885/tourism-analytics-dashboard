from django.contrib import admin
from .models import Stay, StayImage

class StayImageInline(admin.TabularInline):
    model = StayImage
    extra = 1
    fields = ('image', 'caption', 'is_primary', 'order')

@admin.register(Stay)
class StayAdmin(admin.ModelAdmin):
    list_display = ("name", "type", "district", "priceNight", "rating", "is_active", "is_internal")
    list_filter = ("district", "type", "is_active", "is_internal")
    search_fields = ("name", "district", "landmark")
    inlines = [StayImageInline]

@admin.register(StayImage)
class StayImageAdmin(admin.ModelAdmin):
    list_display = ("stay", "is_primary", "order", "uploaded_at")
    list_filter = ("is_primary", "uploaded_at")
    search_fields = ("stay__name", "caption")
