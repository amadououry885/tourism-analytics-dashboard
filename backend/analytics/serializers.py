from rest_framework import serializers
from .models import POI, PostRaw, PostClean, SentimentTopic

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
