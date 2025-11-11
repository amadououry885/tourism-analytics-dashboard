from datetime import datetime, timedelta
from django.db.models import Q, F, Count, Avg, Sum
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

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

        # Filter schedules by day of week
        schedules = schedules.filter(days_of_week__contains=[weekday])

        # Get delays for these schedules
        delays = RouteDelay.objects.filter(
            schedule__in=schedules,
            date=travel_date
        )
        delay_map = {d.schedule_id: d for d in delays}

        # Format response
        results = []
        for schedule in schedules:
            delay = delay_map.get(schedule.id)
            schedule_data = ScheduleBriefSerializer(schedule).data
            schedule_data['delay'] = RouteDelaySerializer(delay).data if delay else None
            results.append(schedule_data)

        return Response(results)

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