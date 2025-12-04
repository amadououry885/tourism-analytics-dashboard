from rest_framework import serializers
from .models import Place, Route, Schedule, RouteDelay, RouteOccupancy, MaintenanceSchedule


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
    
    created_by_username = serializers.ReadOnlyField(source='created_by.username')

    class Meta:
        model = Route
        fields = [
            "id",
            "from_place", "to_place",
            "from_place_id", "to_place_id",
            "route_type",
            "polyline",
            "options",
            "created_by",
            "created_by_username",
        ]
        read_only_fields = ['created_by', 'created_by_username']

    def validate_options(self, value):
        # Normalize None -> []
        return value or []


class ScheduleSerializer(serializers.ModelSerializer):
    route = RouteSerializer(read_only=True)
    route_id = serializers.PrimaryKeyRelatedField(
        queryset=Route.objects.all(), write_only=True, source="route"
    )

    class Meta:
        model = Schedule
        fields = ['id', 'route', 'route_id', 'departure_time', 'arrival_time', 'capacity', 'price']


class ScheduleBriefSerializer(serializers.ModelSerializer):
    class Meta:
        model = Schedule
        fields = [
            'id', 'provider', 'transport_mode', 
            'departure_time', 'arrival_time', 
            'price', 'currency', 'seats_available', 'days_of_week'
        ]


class RouteDelaySerializer(serializers.ModelSerializer):
    class Meta:
        model = RouteDelay
        fields = ['id', 'route', 'delay_minutes', 'reason', 'reported_at']


class RouteOccupancySerializer(serializers.ModelSerializer):
    class Meta:
        model = RouteOccupancy
        fields = ['id', 'route', 'occupancy_percentage', 'recorded_at']


class MaintenanceScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = MaintenanceSchedule
        fields = ['id', 'route', 'start_time', 'end_time', 'maintenance_type', 'description']
