from django.db.models import Count, Sum, Avg, F
from django.db.models.functions import ExtractMonth
from rest_framework.decorators import api_view
from rest_framework.response import Response
from datetime import datetime, timedelta

from .models import Schedule, RouteOccupancy, Route

@api_view(['GET'])
def transport_modes_summary(request):
    """
    Returns summary statistics for each transport mode:
    {
        name: str, 
        value: int,
        percentage: float,
        color: str,
        growth: str
    }
    """
    # Get base data from schedules and occupancy
    current_month = datetime.now().month
    last_month = (datetime.now() - timedelta(days=30)).month
    
    current_stats = RouteOccupancy.objects.filter(
        date__month=current_month
    ).values(
        'schedule__transport_mode'
    ).annotate(
        total_passengers=Sum('seats_taken')
    )
    
    last_month_stats = RouteOccupancy.objects.filter(
        date__month=last_month
    ).values(
        'schedule__transport_mode'
    ).annotate(
        total_passengers=Sum('seats_taken')
    )

    # Calculate growth percentages
    mode_stats = {}
    total_passengers = sum(stat['total_passengers'] for stat in current_stats)
    
    for stat in current_stats:
        mode = stat['schedule__transport_mode']
        current_value = stat['total_passengers']
        last_month_value = next(
            (s['total_passengers'] for s in last_month_stats 
             if s['schedule__transport_mode'] == mode), 
            0
        )
        
        if last_month_value > 0:
            growth = ((current_value - last_month_value) / last_month_value) * 100
        else:
            growth = 0

        mode_stats[mode] = {
            'name': mode.title(),
            'value': current_value,
            'percentage': (current_value / total_passengers) * 100,
            'growth': f"+{growth:.1f}%" if growth >= 0 else f"{growth:.1f}%",
            'color': {
                'Flight': '#3b82f6',
                'Car': '#10b981', 
                'Bus': '#f59e0b',
                'Ferry': '#8b5cf6',
                'Train': '#ec4899',
                'Motorcycle': '#06b6d4'
            }.get(mode.title(), '#666666')
        }

    return Response(list(mode_stats.values()))

@api_view(['GET'])
def monthly_transport_usage(request):
    """
    Returns monthly passenger counts by transport mode:
    {
        month: str,
        flight: int,
        car: int,
        bus: int,
        ferry: int
    }
    """
    current_year = datetime.now().year
    
    monthly_stats = RouteOccupancy.objects.filter(
        date__year=current_year
    ).annotate(
        month=ExtractMonth('date')
    ).values(
        'month',
        'schedule__transport_mode'
    ).annotate(
        passengers=Sum('seats_taken')
    ).order_by('month')

    # Transform into required format
    months = {}
    for stat in monthly_stats:
        month = datetime(2000, stat['month'], 1).strftime('%b')
        mode = stat['schedule__transport_mode'].lower()
        if month not in months:
            months[month] = {'month': month}
        months[month][mode] = stat['passengers']

    return Response(list(months.values()))

@api_view(['GET'])
def route_popularity(request):
    """
    Returns most popular routes with statistics:
    {
        route: str,
        trips: int,
        avgDuration: str,
        mode: str
    }
    """
    popular_routes = RouteOccupancy.objects.values(
        'schedule__route__from_place__name',
        'schedule__route__to_place__name',
        'schedule__transport_mode'
    ).annotate(
        total_trips=Count('id'),
        avg_duration=Avg(
            F('schedule__arrival_time') - F('schedule__departure_time')
        )
    ).order_by('-total_trips')[:5]

    results = []
    for route in popular_routes:
        # Format duration from minutes to "Xh Ym"
        duration_mins = int(route['avg_duration'].total_seconds() / 60)
        hours = duration_mins // 60
        mins = duration_mins % 60
        formatted_duration = f"{hours}h {mins}m" if mins else f"{hours}h"

        results.append({
            'route': f"{route['schedule__route__from_place__name']} → {route['schedule__route__to_place__name']}",
            'trips': route['total_trips'],
            'avgDuration': formatted_duration,
            'mode': route['schedule__transport_mode'].title()
        })

    return Response(results)