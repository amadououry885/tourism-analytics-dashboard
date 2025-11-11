# backend/events/views.py
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from django.utils.timezone import now
from django.db.models import Q
from .models import Event
from .serializers import EventSerializer
from common.permissions import AdminOrReadOnly

class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all().order_by("start_date")
    serializer_class = EventSerializer
    permission_classes = [AdminOrReadOnly]

    def perform_create(self, serializer):
        """Automatically set created_by to current user"""
        serializer.save(created_by=self.request.user)
    
    def perform_update(self, serializer):
        """Keep original created_by on updates"""
        serializer.save()

    def get_queryset(self):
        qs = super().get_queryset()

        city = self.request.query_params.get("city")
        q = self.request.query_params.get("q")
        tag = self.request.query_params.get("tag")  # exact tag membership
        upcoming = self.request.query_params.get("upcoming")  # “1” to filter future
        start_after = self.request.query_params.get("start_after")  # ISO datetime
        end_before = self.request.query_params.get("end_before")    # ISO datetime

        if city:
            qs = qs.filter(city__iexact=city)

        if q:
            qs = qs.filter(
                Q(title__icontains=q)
                | Q(description__icontains=q)
                | Q(location_name__icontains=q)
                | Q(tags__icontains=q)
            )

        if tag:
            # JSONField subset check (works for list-of-strings)
            qs = qs.filter(tags__contains=[tag])

        if upcoming == "1":
            # include events whose end_date is in the future (or no end_date but start_date is future)
            today = now()
            qs = qs.filter(Q(end_date__gte=today) | Q(end_date__isnull=True, start_date__gte=today))

        if start_after:
            qs = qs.filter(start_date__gte=start_after)

        if end_before:
            qs = qs.filter(end_date__lte=end_before)

        return qs
