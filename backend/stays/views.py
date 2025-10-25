from rest_framework import viewsets
from django.db.models import Q
from .models import Stay
from .serializers import StaySerializer

class StayViewSet(viewsets.ModelViewSet):
    queryset = Stay.objects.all().order_by("price_per_night")
    serializer_class = StaySerializer

    def get_queryset(self):
        qs = super().get_queryset()
        q = self.request.query_params.get("q")
        city = self.request.query_params.get("city")
        min_price = self.request.query_params.get("min_price")
        max_price = self.request.query_params.get("max_price")
        min_rating = self.request.query_params.get("min_rating")
        active = self.request.query_params.get("active")

        if q:
            qs = qs.filter(Q(name__icontains=q) | Q(city__icontains=q))

        if city:
            qs = qs.filter(city__iexact=city)

        if min_price:
            qs = qs.filter(price_per_night__gte=min_price)
        if max_price:
            qs = qs.filter(price_per_night__lte=max_price)
        if min_rating:
            qs = qs.filter(rating__gte=min_rating)

        if active in {"0", "false", "False"}:
            qs = qs.filter(is_active=False)
        elif active in {"1", "true", "True"}:
            qs = qs.filter(is_active=True)

        return qs
