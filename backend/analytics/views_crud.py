from django.db.models import Q
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination

from common.permissions import AdminOrReadOnly, IsPlaceOwnerOrReadOnly

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
    
    Supports both:
    - Admin: Full access to all places (council-managed)
    - Place Owner: CRUD on their own places (privately-managed)
    """
    queryset = Place.objects.all().order_by("name")
    serializer_class = PlaceSerializer
    pagination_class = StandardPagination
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ["name", "city", "state", "country"]
    permission_classes = [IsPlaceOwnerOrReadOnly]

    def perform_create(self, serializer):
        """Automatically set created_by/owner based on user role"""
        user = self.request.user
        if user.role == 'place_owner':
            # Place owner creates privately-managed place
            serializer.save(owner=user, is_council_managed=False)
        else:
            # Admin creates council-managed place
            serializer.save(created_by=user, is_council_managed=True)
    
    def perform_update(self, serializer):
        """Keep original ownership on updates"""
        serializer.save()

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        
        # If user is authenticated place_owner, show only their places
        if user.is_authenticated and user.role == 'place_owner':
            qs = qs.filter(owner=user)
        elif not (user.is_authenticated and user.role == 'admin'):
            # Public users see only active places
            qs = qs.filter(is_active=True)
        
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
    
    @action(detail=True, methods=['post'])
    def toggle_active(self, request, pk=None):
        """Toggle place active/inactive status (visibility)"""
        place = self.get_object()
        place.is_active = not place.is_active
        place.save()
        return Response({
            'is_active': place.is_active,
            'message': f"Place is now {'ACTIVE' if place.is_active else 'INACTIVE'}"
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
