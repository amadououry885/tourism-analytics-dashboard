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
        in_kedah = self.request.query_params.get("in_kedah")
        if q:
            qs = qs.filter(name__icontains=q)
        if in_kedah is not None:
            val = in_kedah.lower()
            if val in ("1", "true", "yes"):
                qs = qs.filter(is_in_kedah=True)
            elif val in ("0", "false", "no"):
                qs = qs.filter(is_in_kedah=False)
        return qs

def _match_place_filter(field_prefix: str, value: str) -> Q:
    if not value:
        return Q()
    value = value.strip()
    if value.isdigit():
        return Q(**{f"{field_prefix}__id": int(value)})
    return Q(**{f"{field_prefix}__name__iexact": value})

class RouteViewSet(viewsets.ModelViewSet):
    queryset = Route.objects.select_related("from_place", "to_place").all().order_by("route_type", "id")
    serializer_class = RouteSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        origin = self.request.query_params.get("origin") or self.request.query_params.get("from")
        destination = self.request.query_params.get("destination") or self.request.query_params.get("to")
        route_type = self.request.query_params.get("route_type") or self.request.query_params.get("mode")
        if origin:
            qs = qs.filter(_match_place_filter("from_place", origin))
        if destination:
            qs = qs.filter(_match_place_filter("to_place", destination))
        if route_type:
            qs = qs.filter(route_type__iexact=route_type)
        return qs
