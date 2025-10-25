# backend/transport/views.py
from rest_framework import viewsets
from django.db.models import Q
from .models import Place, Route
from .serializers import PlaceSerializer, RouteSerializer

class PlaceViewSet(viewsets.ModelViewSet):
    queryset = Place.objects.all().order_by("name")
    serializer_class = PlaceSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        q = self.request.query_params.get("q")
        city = self.request.query_params.get("city")
        if q:
            qs = qs.filter(Q(name__icontains=q) | Q(city__icontains=q))
        if city:
            qs = qs.filter(city__iexact=city)
        return qs


class RouteViewSet(viewsets.ModelViewSet):
    queryset = (
        Route.objects
        .select_related("from_place", "to_place")
        .all()
        .order_by("route_type", "id")
    )
    serializer_class = RouteSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        origin = self.request.query_params.get("origin")
        destination = self.request.query_params.get("destination")
        # accept mode as an alias for route_type
        route_type = self.request.query_params.get("route_type") or self.request.query_params.get("mode")

        if origin:
            qs = qs.filter(Q(from_place__id__iexact=origin) | Q(from_place__name__iexact=origin))
        if destination:
            qs = qs.filter(Q(to_place__id__iexact=destination) | Q(to_place__name__iexact=destination))
        if route_type:
            qs = qs.filter(route_type__iexact=route_type)

        return qs
