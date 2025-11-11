# backend/events/serializers.py
from rest_framework import serializers
from .models import Event

class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = [
            "id",
            "title",
            "description",
            "start_date",
            "end_date",
            "location_name",
            "city",
            "lat",
            "lon",
            "tags",
            "is_published",
            "expected_attendance",
            "actual_attendance",
        ]
        

    def validate_tags(self, value):
        # Normalize None -> []
        return value or []
