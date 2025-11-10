# backend/# backend/analytics/serializers.py
from rest_framework import serializers
from .models import (
    Place,
    SocialPost,
    PostRaw,
    PostClean,
    SentimentTopic,
)

class PlaceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Place
        fields = "__all__"

class SocialPostSerializer(serializers.ModelSerializer):
    class Meta:
        model = SocialPost
        fields = "__all__"

class PostRawSerializer(serializers.ModelSerializer):
    class Meta:
        model = PostRaw
        fields = "__all__"

class PostCleanSerializer(serializers.ModelSerializer):
    class Meta:
        model = PostClean
        fields = "__all__"

class SentimentTopicSerializer(serializers.ModelSerializer):
    class Meta:
        model = SentimentTopic
        fields = "__all__"

__all__ = [
    "PlaceSerializer",
    "SocialPostSerializer",
    "PostRawSerializer",
    "PostCleanSerializer",
    "SentimentTopicSerializer",
]
