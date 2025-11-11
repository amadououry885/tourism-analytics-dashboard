# backend/events/serializers.py
from rest_framework import serializers
from .models import Event

class EventSerializer(serializers.ModelSerializer):
    created_by_username = serializers.ReadOnlyField(source='created_by.username')
    
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
            "created_by",
            "created_by_username",
        ]
        read_only_fields = ['created_by', 'created_by_username']
        

    def validate_tags(self, value):
        # Normalize None -> []
        return value or []
