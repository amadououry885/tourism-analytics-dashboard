from rest_framework import viewsets
from django.db.models import Q
from django.utils.dateparse import parse_date
from .models import Event
from .serializers import EventSerializer

class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all().order_by("date")
    serializer_class = EventSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        q = self.request.query_params.get("q")
        cat = self.request.query_params.get("category")
        date_from = self.request.query_params.get("date_from")
        date_to = self.request.query_params.get("date_to")
        active = self.request.query_params.get("active")

        if q:
            qs = qs.filter(Q(title__icontains=q) | Q(location__icontains=q) | Q(description__icontains=q))
        if cat:
            qs = qs.filter(category__iexact=cat)

        if date_from:
            d = parse_date(date_from)
            if d: qs = qs.filter(date__gte=d)
        if date_to:
            d = parse_date(date_to)
            if d: qs = qs.filter(date__lte=d)

        if active in {"0", "false", "False"}:
            qs = qs.filter(is_active=False)
        elif active in {"1", "true", "True"}:
            qs = qs.filter(is_active=True)

        return qs
