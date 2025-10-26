from django.contrib import admin
from .models import Place, SocialPost

@admin.register(Place)
class PlaceAdmin(admin.ModelAdmin):
    list_display = ("name", "city", "category", "price_display", "is_free", "created_at")
    search_fields = ("name", "city", "category")
    list_filter = ("is_free", "category")

@admin.register(SocialPost)
class SocialPostAdmin(admin.ModelAdmin):
    list_display = ("platform", "external_id", "place", "likes", "comments", "shares", "created_at")
    search_fields = ("external_id", "text")
    list_filter = ("platform", "is_tourism_related", "sentiment")
