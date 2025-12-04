# backend/vendors/views.py
from datetime import datetime, timedelta
from django.db.models import Q, Avg, Count, F
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from common.permissions import IsVendorOwnerOrReadOnly

from .models import Vendor, MenuItem, OpeningHours, Review, Promotion, Reservation
from .serializers import (
    VendorDetailSerializer, VendorListSerializer, MenuItemSerializer,
    OpeningHoursSerializer, ReviewSerializer, PromotionSerializer,
    ReservationSerializer
)

class VendorViewSet(viewsets.ModelViewSet):
    queryset = Vendor.objects.all().order_by("city", "name")
    permission_classes = [IsVendorOwnerOrReadOnly]
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return VendorDetailSerializer
        return VendorListSerializer
    
    def perform_create(self, serializer):
        """Automatically set owner to current user"""
        serializer.save(owner=self.request.user)
    
    def perform_update(self, serializer):
        """Keep original owner on updates"""
        serializer.save()
    
    def get_queryset(self):
        """Filter vendors - owners see their own, others see all active"""
        qs = super().get_queryset()
        user = self.request.user
        
        # If user is authenticated vendor, show their own vendors
        if user.is_authenticated and user.role == 'vendor':
            qs = qs.filter(owner=user)
        else:
            # Others see only active vendors
            qs = qs.filter(is_active=True)
        
        city = self.request.query_params.get("city")
        q = self.request.query_params.get("q")
        cuisine = self.request.query_params.get("cuisine")
        active = self.request.query_params.get("active")
        min_rating = self.request.query_params.get("min_rating")
        has_promotions = self.request.query_params.get("has_promotions")

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
        if min_rating:
            try:
                rating = float(min_rating)
                qs = qs.annotate(avg_rating=Avg('reviews__rating')).filter(avg_rating__gte=rating)
            except ValueError:
                pass
        if has_promotions:
            today = datetime.now().date()
            qs = qs.filter(
                promotions__is_active=True,
                promotions__start_date__lte=today,
                promotions__end_date__gte=today
            ).distinct()
        return qs

    @action(detail=True)
    def menu(self, request, pk=None):
        vendor = self.get_object()
        menu_items = vendor.menu_items.filter(is_available=True)
        serializer = MenuItemSerializer(menu_items, many=True)
        return Response(serializer.data)

    @action(detail=True)
    def reviews(self, request, pk=None):
        vendor = self.get_object()
        reviews = vendor.reviews.all()
        page = self.paginate_queryset(reviews)
        serializer = ReviewSerializer(page, many=True)
        return self.get_paginated_response(serializer.data)

    @action(detail=True)
    def promotions(self, request, pk=None):
        vendor = self.get_object()
        today = datetime.now().date()
        promotions = vendor.promotions.filter(
            is_active=True,
            start_date__lte=today,
            end_date__gte=today
        )
        serializer = PromotionSerializer(promotions, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def make_reservation(self, request, pk=None):
        vendor = self.get_object()
        serializer = ReservationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(vendor=vendor)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class VendorAnalyticsView(APIView):
    """Get analytics for vendors"""
    def get(self, request):
        days = int(request.GET.get('days', 30))
        end_date = datetime.now().date()
        start_date = end_date - timedelta(days=days)
        
        # Get top rated vendors
        top_rated = (
            Vendor.objects
            .annotate(
                avg_rating=Avg('reviews__rating'),
                review_count=Count('reviews')
            )
            .filter(review_count__gt=10)  # minimum reviews threshold
            .order_by('-avg_rating')[:10]
        )
        
        # Get most reviewed vendors
        most_reviewed = (
            Vendor.objects
            .annotate(review_count=Count('reviews'))
            .order_by('-review_count')[:10]
        )
        
        # Get trending vendors (most recent positive reviews)
        trending = (
            Vendor.objects
            .filter(
                reviews__date__range=[start_date, end_date],
                reviews__rating__gte=4
            )
            .annotate(recent_reviews=Count('reviews'))
            .order_by('-recent_reviews')[:10]
        )
        
        return Response({
            'top_rated': VendorListSerializer(top_rated, many=True).data,
            'most_reviewed': VendorListSerializer(most_reviewed, many=True).data,
            'trending': VendorListSerializer(trending, many=True).data
        })


class VendorSearchView(APIView):
    """Advanced vendor search"""
    def get(self, request):
        # Get parameters
        cuisine = request.GET.get('cuisine')
        price_range = request.GET.get('price_range')
        dietary = request.GET.getlist('dietary[]')  # vegetarian, halal
        rating = request.GET.get('min_rating')
        lat = request.GET.get('lat')
        lon = request.GET.get('lon')
        radius = float(request.GET.get('radius', 5))  # km
        
        # Start with all vendors
        qs = Vendor.objects.all()
        
        # Apply filters
        if cuisine:
            qs = qs.filter(cuisines__contains=[cuisine])
        
        if price_range:
            min_price, max_price = map(float, price_range.split('-'))
            qs = qs.filter(menu_items__price__range=(min_price, max_price)).distinct()
        
        if dietary:
            for requirement in dietary:
                if requirement == 'vegetarian':
                    qs = qs.filter(menu_items__is_vegetarian=True)
                elif requirement == 'halal':
                    qs = qs.filter(menu_items__is_halal=True)
        
        if rating:
            try:
                min_rating = float(rating)
                qs = qs.annotate(avg_rating=Avg('reviews__rating')).filter(avg_rating__gte=min_rating)
            except ValueError:
                pass
        
        # Location-based search
        if lat and lon:
            try:
                lat, lon = float(lat), float(lon)
                # Simple distance calculation (not perfect but fast)
                qs = qs.filter(
                    lat__range=(lat - radius/111, lat + radius/111),
                    lon__range=(lon - radius/111, lon + radius/111)
                )
            except ValueError:
                pass
        
        # Annotate with useful metrics
        qs = qs.annotate(
            avg_rating=Avg('reviews__rating'),
            review_count=Count('reviews'),
            has_promotions=Count('promotions', filter=Q(
                promotions__is_active=True,
                promotions__start_date__lte=datetime.now().date(),
                promotions__end_date__gte=datetime.now().date()
            ))
        ).order_by('-avg_rating')
        
        return Response(VendorListSerializer(qs, many=True).data)


class MenuItemViewSet(viewsets.ModelViewSet):
    """CRUD for menu items - vendor owners only"""
    serializer_class = MenuItemSerializer
    
    def get_queryset(self):
        # Vendors can only see/edit their own menu items
        user = self.request.user
        if user.is_authenticated and hasattr(user, 'vendor_set'):
            vendor_ids = user.vendor_set.values_list('id', flat=True)
            return MenuItem.objects.filter(vendor_id__in=vendor_ids)
        return MenuItem.objects.none()
    
    def perform_create(self, serializer):
        # Ensure vendor is owned by current user
        vendor = serializer.validated_data['vendor']
        if vendor.owner != self.request.user:
            return Response(
                {'error': 'You can only add menu items to your own restaurants'},
                status=status.HTTP_403_FORBIDDEN
            )
        serializer.save()


class OpeningHoursViewSet(viewsets.ModelViewSet):
    """CRUD for opening hours - vendor owners only"""
    serializer_class = OpeningHoursSerializer
    
    def get_queryset(self):
        # Vendors can only see/edit their own opening hours
        user = self.request.user
        if user.is_authenticated and hasattr(user, 'vendor_set'):
            vendor_ids = user.vendor_set.values_list('id', flat=True)
            return OpeningHours.objects.filter(vendor_id__in=vendor_ids)
        return OpeningHours.objects.none()
    
    def perform_create(self, serializer):
        # Ensure vendor is owned by current user
        vendor = serializer.validated_data['vendor']
        if vendor.owner != self.request.user:
            return Response(
                {'error': 'You can only add hours to your own restaurants'},
                status=status.HTTP_403_FORBIDDEN
            )
        serializer.save()


class ReviewViewSet(viewsets.ModelViewSet):
    """Reviews - anyone can view, authenticated users can create"""
    serializer_class = ReviewSerializer
    queryset = Review.objects.all().order_by('-date')
    
    def get_queryset(self):
        queryset = super().get_queryset()
        vendor_id = self.request.query_params.get('vendor_id')
        if vendor_id:
            queryset = queryset.filter(vendor_id=vendor_id)
        return queryset


class PromotionViewSet(viewsets.ModelViewSet):
    """CRUD for promotions - vendor owners only"""
    serializer_class = PromotionSerializer
    
    def get_queryset(self):
        # Vendors can only see/edit their own promotions
        user = self.request.user
        if user.is_authenticated and hasattr(user, 'vendor_set'):
            vendor_ids = user.vendor_set.values_list('id', flat=True)
            return Promotion.objects.filter(vendor_id__in=vendor_ids)
        return Promotion.objects.none()
