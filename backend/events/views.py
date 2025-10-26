from rest_framework import viewsets
from django.db.models import Q
from django.utils.timezone import now
from .models import Event
from .serializers import EventSerializer

class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all().order_by("start_date")
    serializer_class = EventSerializer

    def get_queryset(self):
        qs = super().get_queryset()

        city        = self.request.query_params.get("city")
        q           = self.request.query_params.get("q")
        upcoming    = self.request.query_params.get("upcoming")   # "1" => future events
        start_after = self.request.query_params.get("start_after") # ISO datetime
        end_before  = self.request.query_params.get("end_before")  # ISO datetime
        tag         = self.request.query_params.get("tag")         # single tag filter

        if city:
            qs = qs.filter(city__iexact=city)

        if q:
            qs = qs.filter(
                Q(title__icontains=q) |
                Q(description__icontains=q) |
                Q(location_name__icontains=q) |
                Q(city__icontains=q)
            )

        # Tag filter (checks membership in JSON array)
        if tag:
            qs = qs.filter(tags__contains=[tag])

        # Upcoming: end_date >= now OR (no end_date and start_date >= now)
        if upcoming == "1":
            ref = now()
            qs = qs.filter(
                Q(end_date__isnull=True, start_date__gte=ref) |
                Q(end_date__gte=ref)
            )

        if start_after:
            qs = qs.filter(start_date__gte=start_after)

        if end_before:
            qs = qs.filter(end_date__lte=end_before)

        return qs
