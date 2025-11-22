from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.db.models import Q, Max
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
