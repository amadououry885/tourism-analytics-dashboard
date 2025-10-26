# backend/analytics/admin.py
from django.contrib import admin
from .models import Place, SocialPost


@admin.register(Place)
class PlaceAdmin(admin.ModelAdmin):
    # Keep it simple and only reference real model fields
    list_display = ("name", "category", "is_free", "price", "latitude", "longitude")
    list_filter = ("category", "is_free")
    search_fields = ("name", "category")
    ordering = ("name",)

    # Explicit form layout for the add/change pages
    fields = (
        "name",
        "category",
        "description",
        "is_free",
        "price",
        "latitude",
        "longitude",
        "website",
    )

    # If your model has auto/readonly fields like created_at, DO NOT include them in `fields`
    # readonly_fields = ("created_at",)  # uncomment only if Place has this AND you want to show it


@admin.register(SocialPost)
class SocialPostAdmin(admin.ModelAdmin):
    # Only safe, actual model fields here
    list_display = ("platform", "place", "created_at")
    list_filter = ("platform",)  # must reference real Field names
    search_fields = ("content",)
    date_hierarchy = "created_at"
    ordering = ("-created_at",)

    # Keep the form explicit to avoid Django guessing problematic fields
    fields = (
        "platform",
        "content",
        "place",
        "url",
        "likes",
        "comments",
        "shares",
    )

    # Do NOT include auto/non-editable fields in `fields`
    # readonly_fields = ("created_at",)  # only if you want it visible and the model has it

    # Start simple—no custom forms, no autocomplete, no custom widgets.
    # Add them back gradually once the page loads without 500s.

    # Example (later): enable autocomplete if Place has search fields configured
    # autocomplete_fields = ("place",)

    # Example (later): show more columns after it’s stable
    # list_display = ("platform", "external_id", "place", "created_at", "likes", "comments", "shares")
    # ^ Only if your model truly has `external_id` etc.
