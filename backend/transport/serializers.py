from rest_framework import serializers
from .models import Place, Route

class PlaceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Place
        fields = ["id", "name", "city", "lat", "lon", "created_at", "updated_at"]

class RouteSerializer(serializers.ModelSerializer):
    origin = PlaceSerializer(read_only=True)
    destination = PlaceSerializer(read_only=True)

    origin_id = serializers.PrimaryKeyRelatedField(
        queryset=Place.objects.all(), source="origin", write_only=True, required=False
    )
    destination_id = serializers.PrimaryKeyRelatedField(
        queryset=Place.objects.all(), source="destination", write_only=True, required=False
    )

    class Meta:
        model = Route
        fields = ["id", "origin", "destination", "origin_id", "destination_id",
                  "distance_km", "duration_min", "mode", "created_at", "updated_at"]
