from rest_framework import serializers
from .models import Stay

class StaySerializer(serializers.ModelSerializer):
    owner_username = serializers.ReadOnlyField(source='owner.username')
    
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
            "booking_com_url",
            "agoda_url",
            "booking_provider",
            "owner",
            "owner_username",
        ]
        read_only_fields = ['owner', 'owner_username']
