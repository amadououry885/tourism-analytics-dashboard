# backend/vendors/views.py
from rest_framework import viewsets
from django.db.models import Q
from .models import Vendor
from .serializers import VendorSerializer

class VendorViewSet(viewsets.ModelViewSet):
    queryset = Vendor.objects.all().order_by("city", "name")
    serializer_class = VendorSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        city = self.request.query_params.get("city")
        q = self.request.query_params.get("q")
        cuisine = self.request.query_params.get("cuisine")
        active = self.request.query_params.get("active")

        if city:
            qs = qs.filter(city__iexact=city)
        if q:
            qs = qs.filter(Q(name__icontains=q) | Q(city__icontains=q))
        if cuisine:
            values = [c.strip() for c in cuisine.split(",") if c.strip()]
            for c in values:
                qs = qs.filter(cuisines__contains=[c])
        if active is not None:
            val = active.lower()
            if val in ("1", "true", "yes"):
                qs = qs.filter(is_active=True)
            elif val in ("0", "false", "no"):
                qs = qs.filter(is_active=False)
        return qs
