from django.db.models import Q
from rest_framework import viewsets
from rest_framework.decorators import api_view, action
from rest_framework.response import Response

from .models import Place, Route
from .serializers import PlaceSerializer, RouteSerializer

@api_view(["GET"])
def ping(_request):
    return Response({
        "status": "ok",
        "app": "transport",
        "endpoints": [
            "/api/transport/places/",
            "/api/transport/routes/",
            "/api/transport/routes/lookup/?from=&to=&mode="
        ],
    })

class PlaceViewSet(viewsets.ModelViewSet):
    queryset = Place.objects.all().order_by("name")
    serializer_class = PlaceSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        q = self.request.query_params.get("q")
        district = self.request.query_params.get("district")
        city = self.request.query_params.get("city")  # if your model has `city` instead of `district`, this still works
        if q:
            qs = qs.filter(Q(name__icontains=q) | Q(district__icontains=q) | Q(city__icontains=q))
        if district:
            qs = qs.filter(district__iexact=district)
        if city:
            qs = qs.filter(city__iexact=city)
        return qs

class RouteViewSet(viewsets.ModelViewSet):
    """
    Assumes your Route model has:
      - origin (FK -> Place)
      - destination (FK -> Place)
      - mode (CharField) e.g. Train/Bus/Flight/Car/Ferry
      - distance_km (Float, optional)
      - duration_min (Integer, optional)
      - price_min / price_max (Decimal/Float, optional)
      - polyline (JSONField, optional)
      - route_type (CharField: intra_kedah / coming_to_kedah / leaving_kedah), optional
    Adjust field names if yours differ.
    """
    queryset = Route.objects.select_related("origin", "destination").all().order_by("mode", "distance_km")
    serializer_class = RouteSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        origin = self.request.query_params.get("origin")       # id or name
        destination = self.request.query_params.get("destination")  # id or name
        mode = self.request.query_params.get("mode")

        if origin:
            qs = qs.filter(Q(origin__id__iexact=origin) | Q(origin__name__iexact=origin))
        if destination:
            qs = qs.filter(Q(destination__id__iexact=destination) | Q(destination__name__iexact=destination))
        if mode:
            qs = qs.filter(mode__iexact=mode)
        return qs

    @action(detail=False, methods=["GET"])
    def lookup(self, request):
        """
        /api/transport/routes/lookup/?from=Kuala%20Lumpur&to=Alor%20Setar&mode=Train
        Name-based lookup; falls back to reverse route if needed.
        """
        from_q = (request.GET.get("from") or "").strip()
        to_q   = (request.GET.get("to") or "").strip()
        mode   = (request.GET.get("mode") or "").strip()

        if not from_q or not to_q:
            return Response({"error": "from and to are required"}, status=400)

        qs = Route.objects.select_related("origin", "destination").filter(
            origin__name__iexact=from_q, destination__name__iexact=to_q
        )
        if mode:
            qs = qs.filter(mode__iexact=mode)

        reversed_flag = False
        if not qs.exists():
            rq = Route.objects.select_related("origin", "destination").filter(
                origin__name__iexact=to_q, destination__name__iexact=from_q
            )
            if mode:
                rq = rq.filter(mode__iexact=mode)
            if rq.exists():
                qs = rq
                reversed_flag = True

        if not qs.exists():
            return Response({"from": from_q, "to": to_q, "options": [], "polyline": None})

        r = qs.first()
        data = RouteSerializer(r).data

        # If reversed, flip polyline if present
        if reversed_flag and isinstance(data.get("polyline"), list):
            data["polyline"] = list(reversed(data["polyline"]))

        # Align shape with frontend expectation
        payload = {
            "from": from_q,
            "to": to_q,
            "type": data.get("route_type"),
            "mode": data.get("mode"),
            "distanceKm": data.get("distance_km"),
            "durationMin": data.get("duration_min"),
            "priceMin": data.get("price_min"),
            "priceMax": data.get("price_max"),
            "polyline": data.get("polyline"),
        }
        return Response(payload)
