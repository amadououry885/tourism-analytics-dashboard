from django.contrib import admin
from .models import PostRaw, PostClean, POI, SentimentTopic

@admin.register(PostRaw)
class PostRawAdmin(admin.ModelAdmin):
    list_display = ("platform", "post_id", "created_at", "fetched_at")
    search_fields = ("platform", "post_id", "content")
    list_filter = ("platform",)

@admin.register(PostClean)
class PostCleanAdmin(admin.ModelAdmin):
    list_display = ("raw_post", "sentiment", "poi")
    search_fields = ("clean_content", "topics")
    list_filter = ("sentiment",)

@admin.register(POI)
class POIAdmin(admin.ModelAdmin):
    list_display = ("name", "category", "latitude", "longitude")
    search_fields = ("name", "category")
    list_filter = ("category",)

@admin.register(SentimentTopic)
class SentimentTopicAdmin(admin.ModelAdmin):
    list_display = ("topic", "sentiment", "count", "date")
    search_fields = ("topic",)
    list_filter = ("sentiment", "date")
