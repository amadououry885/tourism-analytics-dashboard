from rest_framework import viewsets
from django.db.models import Q
from .models import Stay
from .serializers import StaySerializer

class StayViewSet(viewsets.ModelViewSet):
    queryset = Stay.objects.all().order_by("priceNight")  # <- was price_per_night
    serializer_class = StaySerializer

    def get_queryset(self):
        qs = super().get_queryset()
        city = self.request.query_params.get("city")
        typ = self.request.query_params.get("type")
        q = self.request.query_params.get("q")

        # price/rating filters (params are numeric strings)
        min_price = self.request.query_params.get("min_price")
        max_price = self.request.query_params.get("max_price")
        min_rating = self.request.query_params.get("min_rating")

        # amenities comma list, e.g. ?amenities=WiFi,Pool
        amenities = self.request.query_params.get("amenities")

        if city:
            qs = qs.filter(district__iexact=city)
        if typ:
            qs = qs.filter(type__iexact=typ)
        if q:
            qs = qs.filter(Q(name__icontains=q) | Q(landmark__icontains=q))

        if min_price:
            qs = qs.filter(priceNight__gte=min_price)
        if max_price:
            qs = qs.filter(priceNight__lte=max_price)
        if min_rating:
            qs = qs.filter(rating__gte=min_rating)

        if amenities:
            wanted = [a.strip() for a in amenities.split(",") if a.strip()]
            # JSONField “contains” works for subset checks like [{"WiFi",...}]
            for a in wanted:
                qs = qs.filter(amenities__contains=[a])

        return qs
