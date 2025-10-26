# backend/analytics/admin.py
from django.contrib import admin
from .models import Place, SocialPost


# -------- Place --------
@admin.register(Place)
class PlaceAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "category", "city", "country")
    search_fields = ("name", "city", "country")
    list_filter = ("category", "city", "country")
    ordering = ("name",)
    # No computed columns, no readonly fields that might not exist.


# -------- SocialPost --------
@admin.register(SocialPost)
class SocialPostAdmin(admin.ModelAdmin):
    # Keep columns strictly to fields that definitely exist on the model
    list_display = ("id", "platform", "author", "posted_at", "place")
    search_fields = ("content", "author", "external_id", "url")
    list_filter = ("platform", "place")
    ordering = ("-posted_at",)

    # If Place is large, autocomplete helps (safe even if small)
    autocomplete_fields = ("place",)

    # IMPORTANT: do not reference any field that may be missing
    # (no custom methods, no non-field attributes here)
