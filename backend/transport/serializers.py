from rest_framework import serializers
from .models import Place, Route


class PlaceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Place
        fields = ["id", "name", "lat", "lon", "is_in_kedah"]


class RouteSerializer(serializers.ModelSerializer):
    # Read-only nested places for display
    from_place = PlaceSerializer(read_only=True)
    to_place = PlaceSerializer(read_only=True)

    # Write-only IDs so admin/clients can POST easily
    from_place_id = serializers.PrimaryKeyRelatedField(
        queryset=Place.objects.all(), write_only=True, source="from_place"
    )
    to_place_id = serializers.PrimaryKeyRelatedField(
        queryset=Place.objects.all(), write_only=True, source="to_place"
    )

    class Meta:
        model = Route
        fields = [
            "id",
            "from_place", "to_place",
            "from_place_id", "to_place_id",
            "route_type",
            "polyline",
            "options",
        ]

    def validate_options(self, value):
        # Normalize None -> []
        return value or []
