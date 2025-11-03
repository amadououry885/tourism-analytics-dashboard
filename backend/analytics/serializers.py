# backend/analytics/serializers.py

from rest_framework import serializers

# Legacy analytics models used by the original dashboard
from .models_old import POI, PostRaw, PostClean, SentimentTopic

# New simplified models powering the new dashboard bits
from .models import Place, SocialPost


# ───────── Legacy serializers (unchanged) ─────────
class POISerializer(serializers.ModelSerializer):
    class Meta:
        model = POI
        fields = ["id", "name", "category", "latitude", "longitude"]


class PostRawSerializer(serializers.ModelSerializer):
    class Meta:
        model = PostRaw
        fields = ["id", "platform", "post_id", "content", "created_at", "fetched_at"]


class PostCleanSerializer(serializers.ModelSerializer):
    class Meta:
        model = PostClean
        fields = ["id", "raw_post", "clean_content", "sentiment", "topics", "poi"]


class SentimentTopicSerializer(serializers.ModelSerializer):
    class Meta:
        model = SentimentTopic
        fields = ["id", "topic", "sentiment", "count", "date"]


# ───────── New model serializers (for completeness) ─────────
class PlaceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Place
        fields = [
            "id",
            "name",
            "category",     # include if your Place has it; harmless if nullable
            "city",
            "state",
            "country",
            "latitude",
            "longitude",
            "is_free",      # include if present; otherwise remove
            "price",
            "currency",
        ]


class SocialPostSerializer(serializers.ModelSerializer):
    place = PlaceSerializer(read_only=True)

    class Meta:
        model = SocialPost
        fields = [
            "id",
            "platform",
            "post_id",
            "url",
            "content",
            "created_at",
            "likes",
            "comments",
            "shares",
            "is_tourism",
            "place",
        ]
