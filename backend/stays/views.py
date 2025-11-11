from rest_framework import viewsets
from django.db.models import Q
from .models import Stay
from .serializers import StaySerializer
from common.permissions import IsStayOwnerOrReadOnly

class StayViewSet(viewsets.ModelViewSet):
    queryset = Stay.objects.all().order_by("priceNight")
    serializer_class = StaySerializer
    permission_classes = [IsStayOwnerOrReadOnly]

    def perform_create(self, serializer):
        """Automatically set owner to current user"""
        serializer.save(owner=self.request.user)
    
    def perform_update(self, serializer):
        """Keep original owner on updates"""
        serializer.save()

    def get_queryset(self):
        """Filter stays - owners see their own, others see all active"""
        qs = super().get_queryset()
        user = self.request.user
        
        # If user is authenticated stay_owner, show their own stays
        if user.is_authenticated and user.role == 'stay_owner':
            qs = qs.filter(owner=user)
        else:
            # Others see only active stays
            qs = qs.filter(is_active=True)
        
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
