from django.db.models import Q
from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination

from common.permissions import AdminOrReadOnly

from .models import Place, SocialPost
from .serializers import PlaceSerializer, SocialPostSerializer


class StandardPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 200


class PlaceViewSet(viewsets.ModelViewSet):
    """
    /api/analytics/places/
      GET (list), POST (create), GET /:id, PUT/PATCH /:id, DELETE /:id
    Query params (optional): q, city, state, country, category, is_free
    """
    queryset = Place.objects.all().order_by("name")
    serializer_class = PlaceSerializer
    pagination_class = StandardPagination
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ["name", "city", "state", "country"]
    permission_classes = [AdminOrReadOnly]

    def perform_create(self, serializer):
        """Automatically set created_by to current user"""
        serializer.save(created_by=self.request.user)
    
    def perform_update(self, serializer):
        """Keep original created_by on updates"""
        serializer.save()

    def get_queryset(self):
        qs = super().get_queryset()
        p = self.request.query_params
        q = (p.get("q") or "").strip()
        if q:
            qs = qs.filter(
                Q(name__icontains=q) |
                Q(city__icontains=q) |
                Q(state__icontains=q) |
                Q(country__icontains=q) |
                Q(category__icontains=q)
            )
        for field in ["city", "state", "country", "category"]:
            if p.get(field):
                qs = qs.filter(**{f"{field}__iexact": p[field]})
        if p.get("is_free") in {"1", "true", "yes", "0", "false", "no"}:
            val = p["is_free"].lower() in {"1", "true", "yes"}
            qs = qs.filter(is_free=val)
        return qs

    @action(detail=True, methods=['post'])
    def toggle_status(self, request, pk=None):
        """Toggle place open/close status"""
        place = self.get_object()
        place.is_open = not place.is_open
        place.save()
        return Response({
            'is_open': place.is_open,
            'message': f"Place is now {'OPEN' if place.is_open else 'CLOSED'}"
        })


class SocialPostViewSet(viewsets.ModelViewSet):
    """
    /api/analytics/posts/
      GET (list), POST (create), GET /:id, PUT/PATCH /:id, DELETE /:id
    Query params (optional): q, platform, place_id, date_from, date_to
    """
    queryset = SocialPost.objects.select_related("place").all().order_by("-created_at", "-id")
    serializer_class = SocialPostSerializer
    pagination_class = StandardPagination
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ["created_at", "likes", "comments", "shares", "id"]

    def get_queryset(self):
        qs = super().get_queryset()
        p = self.request.query_params

        if p.get("q"):
            qs = qs.filter(Q(content__icontains=p["q"]) | Q(post_id__icontains=p["q"]))

        if p.get("platform"):
            qs = qs.filter(platform__iexact=p["platform"])

        if p.get("place_id"):
            qs = qs.filter(place_id=p.get("place_id"))

        # optional date range filtering (YYYY-MM-DD)
        df = p.get("date_from")
        dt = p.get("date_to")
        if df:
            qs = qs.filter(created_at__date__gte=df)
        if dt:
            qs = qs.filter(created_at__date__lte=dt)
        return qs
