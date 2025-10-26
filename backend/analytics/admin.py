from django.contrib import admin
from .models import Place, SocialPost

@admin.register(Place)
class PlaceAdmin(admin.ModelAdmin):
    list_display = ("id", "name")
    ordering = ("id",)

@admin.register(SocialPost)
class SocialPostAdmin(admin.ModelAdmin):
    list_display = ("id", "platform", "post_id")
    ordering = ("-id",)
