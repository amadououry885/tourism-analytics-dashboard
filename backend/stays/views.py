from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.db.models import Q, Max, Avg, Count, Sum, F
from datetime import datetime, timedelta
from .models import Stay, StayImage
from .serializers import StaySerializer, StayImageSerializer
from common.permissions import IsStayOwnerOrReadOnly

class StayViewSet(viewsets.ModelViewSet):
    queryset = Stay.objects.all().order_by("priceNight")
    serializer_class = StaySerializer
    permission_classes = [IsStayOwnerOrReadOnly]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def perform_create(self, serializer):
        """Automatically set owner to current user"""
        serializer.save(owner=self.request.user)
    
    def perform_update(self, serializer):
        """Keep original owner on updates"""
        serializer.save()
    
    def calculate_social_rating(self, stay):
        """Calculate rating from social media sentiment (1-10 scale for stays)"""
        from analytics.models import SocialPost
        
        # Use foreign key relationship if available, fallback to text search
        posts = SocialPost.objects.filter(stay=stay)
        
        # Fallback: also search by name/landmark in content if no direct links
        if not posts.exists():
            posts = SocialPost.objects.filter(
                Q(content__icontains=stay.name) |
                (Q(content__icontains=stay.landmark) if stay.landmark else Q(pk=None))
            )
        
        if not posts.exists():
            return None
        
        avg_sentiment = posts.aggregate(avg=Avg('sentiment_score'))['avg'] or 0.0
        
        # Convert sentiment (-1.0 to +1.0) to rating (1-10)
        # -1.0 → 1.0, 0.0 → 5.5, +1.0 → 10.0
        rating = ((avg_sentiment + 1) / 2) * 9 + 1
        
        return round(rating, 1)
    
    def calculate_trending(self, stay):
        """Calculate trending status from social media mentions"""
        from analytics.models import SocialPost
        
        now = datetime.now()
        current_start = now - timedelta(days=7)
        prev_start = now - timedelta(days=14)
        
        # Use foreign key relationship + fallback to text search
        base_query = Q(stay=stay) | Q(content__icontains=stay.name)
        if stay.landmark:
            base_query |= Q(content__icontains=stay.landmark)
        
        # Current period mentions
        current = SocialPost.objects.filter(
            base_query,
            created_at__gte=current_start
        ).count()
        
        # Previous period mentions
        previous = SocialPost.objects.filter(
            base_query,
            created_at__range=[prev_start, current_start]
        ).count()
        
        if previous == 0:
            growth = 100 if current > 0 else 0
        else:
            growth = ((current - previous) / previous) * 100
        
        return {
            'is_trending': growth > 20,
            'growth_percentage': round(growth, 1),
            'current_mentions': current,
            'previous_mentions': previous
        }
    
    def get_social_metrics(self, stay):
        """Get all social media metrics for a stay"""
        from analytics.models import SocialPost
        
        # Use foreign key relationship + fallback to text search
        base_query = Q(stay=stay) | Q(content__icontains=stay.name)
        if stay.landmark:
            base_query |= Q(content__icontains=stay.landmark)
        
        posts = SocialPost.objects.filter(base_query)
        
        mention_count = posts.count()
        
        # Calculate total engagement
        engagement = posts.aggregate(
            total=Sum(F('likes') + F('comments') + F('shares'))
        )['total'] or 0
        
        # Estimate interest (1 mention ≈ 50 potential viewers)
        estimated_interest = mention_count * 50
        
        return {
            'social_mentions': mention_count,
            'social_engagement': engagement,
            'estimated_interest': estimated_interest
        }

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
    
    def list(self, request, *args, **kwargs):
        """Override list to add social media metrics to each stay"""
        queryset = self.filter_queryset(self.get_queryset())
        
        # Paginate if needed
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            results = self._enhance_with_social_metrics(serializer.data)
            return self.get_paginated_response(results)
        
        serializer = self.get_serializer(queryset, many=True)
        results = self._enhance_with_social_metrics(serializer.data)
        return Response(results)
    
    def retrieve(self, request, *args, **kwargs):
        """Override retrieve to add social media metrics to single stay"""
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        data = serializer.data
        
        # Add social metrics
        social_metrics = self.get_social_metrics(instance)
        trending_data = self.calculate_trending(instance)
        social_rating = self.calculate_social_rating(instance)
        
        data.update({
            'social_mentions': social_metrics['social_mentions'],
            'social_engagement': social_metrics['social_engagement'],
            'estimated_interest': social_metrics['estimated_interest'],
            'trending_percentage': trending_data['growth_percentage'],
            'is_trending': trending_data['is_trending'],
            'social_rating': social_rating,
        })
        
        return Response(data)
    
    def _enhance_with_social_metrics(self, stays_data):
        """Add social media metrics to list of stays"""
        from .models import Stay
        
        enhanced = []
        for stay_data in stays_data:
            try:
                stay = Stay.objects.get(id=stay_data['id'])
                
                # Get social metrics
                social_metrics = self.get_social_metrics(stay)
                trending_data = self.calculate_trending(stay)
                social_rating = self.calculate_social_rating(stay)
                
                # Add to stay data
                stay_data.update({
                    'social_mentions': social_metrics['social_mentions'],
                    'social_engagement': social_metrics['social_engagement'],
                    'estimated_interest': social_metrics['estimated_interest'],
                    'trending_percentage': trending_data['growth_percentage'],
                    'is_trending': trending_data['is_trending'],
                    'social_rating': social_rating,
                    # Use social rating if no manual rating set
                    'rating': stay_data.get('rating') or social_rating or 0,
                })
                
                enhanced.append(stay_data)
            except Stay.DoesNotExist:
                enhanced.append(stay_data)
        
        return enhanced
    
    @action(detail=False, methods=['get'], permission_classes=[])
    def hybrid_search(self, request):
        """
        Hybrid search endpoint that combines internal platform stays with external affiliate stays.
        Internal stays (created by owners) are shown first, then external affiliate stays.
        All filters apply to both internal and external stays.
        """
        # Get filter parameters
        district = request.query_params.get("district")
        typ = request.query_params.get("type")
        min_price = request.query_params.get("min_price")
        max_price = request.query_params.get("max_price")
        min_rating = request.query_params.get("min_rating")
        
        # 1. Get internal stays (from our platform)
        internal_qs = Stay.objects.filter(is_active=True, is_internal=True)
        
        # Apply filters to internal stays
        if district:
            internal_qs = internal_qs.filter(district__iexact=district)
        if typ:
            internal_qs = internal_qs.filter(type__iexact=typ)
        if min_price:
            internal_qs = internal_qs.filter(priceNight__gte=min_price)
        if max_price:
            internal_qs = internal_qs.filter(priceNight__lte=max_price)
        if min_rating:
            internal_qs = internal_qs.filter(rating__gte=min_rating)
        
        internal_stays = list(internal_qs.order_by('-rating', 'priceNight'))
        
        # 2. Generate external affiliate stays (mock data for Phase 1)
        external_stays = self._generate_external_affiliate_stays(request.query_params)
        
        # 3. Combine internal and external stays (internal first)
        combined_stays = list(internal_stays) + external_stays
        
        # 4. Serialize internal stays with the serializer, external as-is
        serialized_internal = self.get_serializer(internal_stays, many=True).data
        
        return Response({
            'count': len(combined_stays),
            'internal_count': len(internal_stays),
            'external_count': len(external_stays),
            'results': list(serialized_internal) + external_stays  # external_stays already dict
        })
    
    def _generate_external_affiliate_stays(self, params):
        """
        Generate mock external affiliate stays based on filters.
        Phase 1: Returns mock data with booking.com/agoda links
        Phase 2: Will integrate with real Booking.com/Agoda APIs
        """
        district = params.get("district", "Langkawi")
        typ = params.get("type", "Hotel")
        
        # Mock external stays - these would come from API in Phase 2
        external_mock_data = [
            {
                'id': 'ext_booking_1',
                'name': f'{district} Luxury Resort (Booking.com)',
                'type': typ,
                'district': district,
                'rating': 4.8,
                'priceNight': 450,
                'amenities': ['WiFi', 'Pool', 'Restaurant', 'Spa'],
                'lat': 6.3500 if district == "Langkawi" else 6.1219,
                'lon': 99.8000 if district == "Langkawi" else 100.3671,
                'images': [],
                'landmark': f'Near {district} Beach',
                'distanceKm': 2.5,
                'is_active': True,
                'is_internal': False,
                'contact_email': None,
                'contact_phone': None,
                'contact_whatsapp': None,
                'booking_com_url': f'https://www.booking.com/searchresults.html?ss={district}&dest_type=district',
                'agoda_url': None,
                'booking_provider': 'booking.com',
                'owner': None,
                'owner_username': None,
            },
            {
                'id': 'ext_agoda_1',
                'name': f'{district} Beach Hotel (Agoda)',
                'type': typ,
                'district': district,
                'rating': 4.6,
                'priceNight': 380,
                'amenities': ['WiFi', 'Beach Access', 'Restaurant'],
                'lat': 6.3500 if district == "Langkawi" else 6.1219,
                'lon': 99.8000 if district == "Langkawi" else 100.3671,
                'images': [],
                'landmark': f'{district} Waterfront',
                'distanceKm': 1.8,
                'is_active': True,
                'is_internal': False,
                'contact_email': None,
                'contact_phone': None,
                'contact_whatsapp': None,
                'booking_com_url': None,
                'agoda_url': f'https://www.agoda.com/search?city={district}',
                'booking_provider': 'agoda',
                'owner': None,
                'owner_username': None,
            },
        ]
        
        # Filter by price if specified
        min_price = params.get("min_price")
        max_price = params.get("max_price")
        min_rating = params.get("min_rating")
        
        filtered_external = []
        for stay_data in external_mock_data:
            if min_price and stay_data['priceNight'] < float(min_price):
                continue
            if max_price and stay_data['priceNight'] > float(max_price):
                continue
            if min_rating and stay_data['rating'] < float(min_rating):
                continue
            filtered_external.append(stay_data)
        
        # Convert dict to list of dicts (for JSON response)
        return filtered_external

    @action(detail=True, methods=['post'], parser_classes=[MultiPartParser, FormParser])
    def upload_images(self, request, pk=None):
        """
        Upload multiple images for a stay.
        Expects multipart/form-data with files named 'images'
        """
        stay = self.get_object()
        
        # Check permission - only owner can upload
        if request.user != stay.owner and not request.user.is_staff:
            return Response(
                {"error": "Only the owner can upload images"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        images = request.FILES.getlist('images')
        if not images:
            return Response(
                {"error": "No images provided"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get current max order
        current_max_order = stay.stay_images.aggregate(
            models.Max('order')
        )['order__max'] or -1
        
        created_images = []
        for idx, image_file in enumerate(images):
            stay_image = StayImage.objects.create(
                stay=stay,
                image=image_file,
                is_primary=(stay.stay_images.count() == 0 and idx == 0),  # First image if no images exist
                order=current_max_order + idx + 1
            )
            created_images.append(stay_image)
        
        serializer = StayImageSerializer(created_images, many=True, context={'request': request})
        return Response({
            "message": f"{len(created_images)} images uploaded successfully",
            "images": serializer.data
        }, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['delete'], url_path='images/(?P<image_id>[^/.]+)')
    def delete_image(self, request, pk=None, image_id=None):
        """Delete a specific image from a stay"""
        stay = self.get_object()
        
        # Check permission
        if request.user != stay.owner and not request.user.is_staff:
            return Response(
                {"error": "Only the owner can delete images"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            stay_image = stay.stay_images.get(id=image_id)
            stay_image.delete()
            return Response(
                {"message": "Image deleted successfully"},
                status=status.HTTP_204_NO_CONTENT
            )
        except StayImage.DoesNotExist:
            return Response(
                {"error": "Image not found"},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['patch'], url_path='images/(?P<image_id>[^/.]+)/set-primary')
    def set_primary_image(self, request, pk=None, image_id=None):
        """Set an image as the primary image for a stay"""
        stay = self.get_object()
        
        # Check permission
        if request.user != stay.owner and not request.user.is_staff:
            return Response(
                {"error": "Only the owner can set primary image"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            stay_image = stay.stay_images.get(id=image_id)
            # Unset other primary images
            stay.stay_images.filter(is_primary=True).update(is_primary=False)
            # Set this as primary
            stay_image.is_primary = True
            stay_image.save()
            
            serializer = StayImageSerializer(stay_image, context={'request': request})
            return Response({
                "message": "Primary image updated",
                "image": serializer.data
            })
        except StayImage.DoesNotExist:
            return Response(
                {"error": "Image not found"},
                status=status.HTTP_404_NOT_FOUND
            )

class StayImageViewSet(viewsets.ModelViewSet):
    """Separate viewset for managing stay images"""
    queryset = StayImage.objects.all()
    serializer_class = StayImageSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    def get_queryset(self):
        """Filter images by stay if stay_id is provided"""
        qs = super().get_queryset()
        stay_id = self.request.query_params.get('stay_id')
        if stay_id:
            qs = qs.filter(stay_id=stay_id)
        return qs
