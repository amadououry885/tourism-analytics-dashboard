from datetime import datetime, timedelta
from django.db.models import Q, F, Count, Avg, Sum
from django.conf import settings
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
import requests

from common.permissions import AdminOrReadOnly

from .models import Place, Route, Schedule, RouteDelay, RouteOccupancy, MaintenanceSchedule
from .serializers import (
    PlaceSerializer, RouteSerializer, ScheduleSerializer, RouteDelaySerializer,
    RouteOccupancySerializer, MaintenanceScheduleSerializer, ScheduleBriefSerializer
)

class PlaceViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Place.objects.all()
    serializer_class = PlaceSerializer
    
    @action(detail=True)
    def routes(self, request, pk=None):
        """Get all routes from or to this place"""
        place = self.get_object()
        routes = Route.objects.filter(Q(from_place=place) | Q(to_place=place))
        return Response(RouteSerializer(routes, many=True).data)

class RouteViewSet(viewsets.ModelViewSet):
    queryset = Route.objects.all()
    serializer_class = RouteSerializer
    permission_classes = [AdminOrReadOnly]
    
    def perform_create(self, serializer):
        """Automatically set created_by to current user"""
        serializer.save(created_by=self.request.user)
    
    def perform_update(self, serializer):
        """Keep original created_by on updates"""
        serializer.save()
    
    @action(detail=True)
    def schedules(self, request, pk=None):
        """Get all active schedules for this route"""
        route = self.get_object()
        schedules = Schedule.objects.filter(route=route, is_active=True)
        return Response(ScheduleSerializer(schedules, many=True).data)

    @action(detail=True)
    def delays(self, request, pk=None):
        """Get current delays for this route"""
        route = self.get_object()
        today = datetime.now().date()
        delays = RouteDelay.objects.filter(
            schedule__route=route,
            date=today
        )
        return Response(RouteDelaySerializer(delays, many=True).data)

    @action(detail=True)
    def maintenance(self, request, pk=None):
        """Get maintenance schedules affecting this route"""
        route = self.get_object()
        today = datetime.now().date()
        maintenance = MaintenanceSchedule.objects.filter(
            route=route,
            end_date__gte=today
        )
        return Response(MaintenanceScheduleSerializer(maintenance, many=True).data)

class ScheduleViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Schedule.objects.filter(is_active=True)
    serializer_class = ScheduleSerializer

    @action(detail=True)
    def occupancy(self, request, pk=None):
        """Get current occupancy for this schedule"""
        schedule = self.get_object()
        today = datetime.now().date()
        try:
            occupancy = RouteOccupancy.objects.get(schedule=schedule, date=today)
            return Response(RouteOccupancySerializer(occupancy).data)
        except RouteOccupancy.DoesNotExist:
            return Response({"error": "No occupancy data available"}, status=404)

class RouteSearchView(APIView):
    """Search for routes between places"""
    def get(self, request):
        from_place = request.GET.get('from')
        to_place = request.GET.get('to')
        date = request.GET.get('date')
        transport_mode = request.GET.get('mode')

        if not all([from_place, to_place, date]):
            return Response({"error": "Missing required parameters"}, status=400)

        try:
            travel_date = datetime.strptime(date, '%Y-%m-%d').date()
            weekday = travel_date.weekday()
        except ValueError:
            return Response({"error": "Invalid date format"}, status=400)

        # Find routes between places
        routes = Route.objects.filter(
            from_place__name__iexact=from_place,
            to_place__name__iexact=to_place
        )

        if transport_mode:
            schedules = Schedule.objects.filter(
                route__in=routes,
                transport_mode=transport_mode,
                is_active=True
            )
        else:
            schedules = Schedule.objects.filter(
                route__in=routes,
                is_active=True
            )

        # Filter schedules by day of week (handle both list and JSON string)
        filtered_schedules = []
        for schedule in schedules:
            days = schedule.days_of_week
            # Handle both list and JSON string formats
            if isinstance(days, str):
                import json
                try:
                    days = json.loads(days)
                except:
                    days = []
            
            if weekday in days:
                filtered_schedules.append(schedule)

        # Get delays for these schedules
        schedule_ids = [s.id for s in filtered_schedules]
        delays = RouteDelay.objects.filter(
            schedule_id__in=schedule_ids,
            date=travel_date
        )
        delay_map = {d.schedule_id: d for d in delays}

        # Format response
        results = []
        for schedule in filtered_schedules:
            delay = delay_map.get(schedule.id)
            schedule_data = ScheduleBriefSerializer(schedule).data
            schedule_data['delay'] = RouteDelaySerializer(delay).data if delay else None
            results.append(schedule_data)

        return Response(results)

class GoogleDirectionsView(APIView):
    """Fetch real-time transport options from Google Maps Directions API"""
    
    def get(self, request):
        from_place = request.GET.get('from')
        to_place = request.GET.get('to')
        date = request.GET.get('date')
        
        if not all([from_place, to_place]):
            return Response({"error": "Missing required parameters"}, status=400)
        
        # Check if API key is configured
        api_key = settings.GOOGLE_MAPS_API_KEY
        if not api_key:
            return Response({
                "error": "Google Maps API key not configured",
                "message": "Please add GOOGLE_MAPS_API_KEY to your .env file"
            }, status=500)
        
        try:
            # Parse date for departure time
            if date:
                travel_date = datetime.strptime(date, '%Y-%m-%d')
                # Set departure time to 9 AM on that date
                departure_timestamp = int(travel_date.replace(hour=9).timestamp())
            else:
                departure_timestamp = int(datetime.now().timestamp())
            
            # Call Google Maps Directions API
            url = "https://maps.googleapis.com/maps/api/directions/json"
            params = {
                'origin': from_place,
                'destination': to_place,
                'mode': 'transit',  # Public transport only
                'departure_time': departure_timestamp,
                'alternatives': True,  # Get multiple route options
                'key': api_key,
                'region': 'my',  # Malaysia
            }
            
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            if data.get('status') != 'OK':
                return Response({
                    "error": "Google Maps API error",
                    "status": data.get('status'),
                    "message": data.get('error_message', 'No routes found')
                }, status=400)
            
            # Parse and format routes
            routes = []
            for route in data.get('routes', [])[:5]:  # Limit to 5 alternatives
                leg = route['legs'][0]
                
                # Extract transit details
                for step in leg.get('steps', []):
                    if step.get('travel_mode') == 'TRANSIT':
                        transit = step.get('transit_details', {})
                        line = transit.get('line', {})
                        
                        routes.append({
                            'provider': line.get('agencies', [{}])[0].get('name', 'Unknown'),
                            'transport_mode': line.get('vehicle', {}).get('type', 'BUS').lower(),
                            'departure_time': transit.get('departure_time', {}).get('text', ''),
                            'arrival_time': transit.get('arrival_time', {}).get('text', ''),
                            'duration': step.get('duration', {}).get('text', ''),
                            'distance': step.get('distance', {}).get('text', ''),
                            'from_stop': transit.get('departure_stop', {}).get('name', from_place),
                            'to_stop': transit.get('arrival_stop', {}).get('name', to_place),
                            'line_name': line.get('short_name') or line.get('name', ''),
                            'num_stops': transit.get('num_stops', 0),
                            'source': 'google_maps'
                        })
            
            if not routes:
                # No transit found, return summary
                return Response({
                    "routes": [],
                    "summary": {
                        "from": from_place,
                        "to": to_place,
                        "distance": data['routes'][0]['legs'][0].get('distance', {}).get('text', ''),
                        "duration": data['routes'][0]['legs'][0].get('duration', {}).get('text', ''),
                        "message": "No public transit available. Consider driving or other transport."
                    }
                })
            
            return Response(routes)
            
        except requests.RequestException as e:
            return Response({
                "error": "Failed to fetch from Google Maps",
                "details": str(e)
            }, status=500)
        except Exception as e:
            return Response({
                "error": "Internal server error",
                "details": str(e)
            }, status=500)

class RouteAnalyticsView(APIView):
    """Get analytics for routes"""
    def get(self, request):
        days = int(request.GET.get('days', 7))
        end_date = datetime.now().date()
        start_date = end_date - timedelta(days=days)

        # Get popular routes
        popular_routes = (
            Schedule.objects
            .filter(
                occupancy__date__range=[start_date, end_date]
            )
            .annotate(
                total_passengers=Sum('occupancy__seats_taken'),
                avg_occupancy=Avg(
                    F('occupancy__seats_taken') * 100.0 / F('occupancy__seats_total')
                )
            )
            .order_by('-total_passengers')[:10]
        )

        # Get routes with most delays
        delayed_routes = (
            Schedule.objects
            .filter(
                delays__date__range=[start_date, end_date],
                delays__status='delayed'
            )
            .annotate(
                delay_count=Count('delays'),
                avg_delay=Avg('delays__delay_minutes')
            )
            .order_by('-delay_count')[:10]
        )

        return Response({
            'popular_routes': ScheduleSerializer(popular_routes, many=True).data,
            'delayed_routes': ScheduleSerializer(delayed_routes, many=True).data
        })