from rest_framework import serializers
from .models import Event

class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = ["id", "title", "date", "location", "description",
                  "category", "lat", "lon", "is_active", "created_at", "updated_at"]
