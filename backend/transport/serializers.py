from rest_framework import serializers
from .models import Place, Route

class PlaceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Place
        fields = ["id", "name", "city", "lat", "lon"]

class RouteSerializer(serializers.ModelSerializer):
    from_place = PlaceSerializer(read_only=True)
    to_place = PlaceSerializer(read_only=True)

    class Meta:
        model = Route
        fields = ["id", "from_place", "to_place", "route_type", "polyline", "options"]
