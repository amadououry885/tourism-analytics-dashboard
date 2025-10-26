from rest_framework import serializers
from .models import Stay

class StaySerializer(serializers.ModelSerializer):
    class Meta:
        model = Stay
        fields = [
            "id",
            "name",
            "type",
            "district",
            "rating",
            "priceNight",
            "amenities",
            "lat",
            "lon",
            "images",
            "landmark",
            "distanceKm",
            "is_active",
        ]
