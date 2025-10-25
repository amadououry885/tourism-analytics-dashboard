from rest_framework import viewsets
from django.db.models import Q
from .models import Vendor
from .serializers import VendorSerializer

class VendorViewSet(viewsets.ModelViewSet):
    queryset = Vendor.objects.all().order_by("name")
    serializer_class = VendorSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        q = self.request.query_params.get("q")
        city = self.request.query_params.get("city")
        active = self.request.query_params.get("active")

        if q:
            ql = q.strip().lower()
            qs = qs.filter(
                Q(name__icontains=ql) |
                Q(city__icontains=ql) |
                Q(cuisines__icontains=ql)  # works for JSON/text
            )

        if city:
            qs = qs.filter(city__iexact=city)

        if active in {"0", "false", "False"}:
            qs = qs.filter(is_active=False)
        elif active in {"1", "true", "True"}:
            qs = qs.filter(is_active=True)

        return qs
