# backend/analytics/admin.py
from django.contrib import admin
from .models import Place, SocialPost


@admin.register(Place)
class PlaceAdmin(admin.ModelAdmin):
    # Keep it trivial so system checks can't fail
    list_display = ("id",)
    search_fields = ()
    list_filter = ()
    ordering = ("id",)


@admin.register(SocialPost)
class SocialPostAdmin(admin.ModelAdmin):
    # Also trivial/safe — we'll add columns back after it’s stable
    list_display = ("id",)
    search_fields = ()
    list_filter = ()
    ordering = ("-id",)
