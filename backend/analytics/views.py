from rest_framework import viewsets
from .models import POI, PostRaw, PostClean, SentimentTopic
from .serializers import (
    POISerializer,
    PostRawSerializer,
    PostCleanSerializer,
    SentimentTopicSerializer,
)

class POIViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Read-only endpoints for Points of Interest.
    """
    queryset = POI.objects.all().order_by("name")
    serializer_class = POISerializer

class PostRawViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Read-only endpoints for raw social posts.
    """
    queryset = PostRaw.objects.all().order_by("-created_at")
    serializer_class = PostRawSerializer

class PostCleanViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Read-only endpoints for cleaned social posts.
    """
    queryset = PostClean.objects.all().order_by("-id")
    serializer_class = PostCleanSerializer

class SentimentTopicViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Read-only endpoints for sentiment/topic daily counts.
    Filters: ?topic=&sentiment=&date_from=&date_to=
    """
    queryset = SentimentTopic.objects.all().order_by("-date", "-count")  # REQUIRED
    serializer_class = SentimentTopicSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        params = self.request.query_params
        t = params.get("topic")
        s = params.get("sentiment")
        dfrom = params.get("date_from")
        dto = params.get("date_to")
        if t:
            qs = qs.filter(topic__iexact=t)
        if s:
            qs = qs.filter(sentiment__iexact=s)
        if dfrom:
            qs = qs.filter(date__gte=dfrom)
        if dto:
            qs = qs.filter(date__lte=dto)
        return qs
