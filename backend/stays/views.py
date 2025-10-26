from rest_framework import viewsets
from django.db.models import Q
from .models import Stay
from .serializers import StaySerializer

class StayViewSet(viewsets.ModelViewSet):
    queryset = Stay.objects.all().order_by("priceNight")
    serializer_class = StaySerializer

    def get_queryset(self):
        qs = super().get_queryset()
        district = self.request.query_params.get("district")
        typ = self.request.query_params.get("type")
        q = self.request.query_params.get("q")

        min_price = self.request.query_params.get("min_price")
        max_price = self.request.query_params.get("max_price")
        min_rating = self.request.query_params.get("min_rating")
        amenities = self.request.query_params.get("amenities")  # comma-separated

        if district:
            qs = qs.filter(district__iexact=district)
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
            for a in [x.strip() for x in amenities.split(",") if x.strip()]:
                qs = qs.filter(amenities__contains=[a])

        return qs
