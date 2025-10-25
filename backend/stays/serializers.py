from rest_framework import serializers
from .models import Stay

class StaySerializer(serializers.ModelSerializer):
    class Meta:
        model = Stay
        fields = ["id", "name", "city", "price_per_night", "rating",
                  "lat", "lon", "is_active", "created_at", "updated_at"]
