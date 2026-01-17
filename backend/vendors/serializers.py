# backend/vendors/serializers.py
from datetime import datetime
import base64
import json
from django.db.models import Avg
from rest_framework import serializers
from .models import Vendor, MenuItem, OpeningHours, Review, Promotion, Reservation


class MenuItemSerializer(serializers.ModelSerializer):
    # Accept image file upload and convert to base64 data URL
    image = serializers.ImageField(write_only=True, required=False, allow_null=True)
    # Override allergens to accept JSON string
    allergens = serializers.JSONField(required=False, default=list)
    
    class Meta:
        model = MenuItem
        fields = "__all__"
    
    def to_internal_value(self, data):
        # Make a mutable copy
        if hasattr(data, 'copy'):
            data = data.copy()
        else:
            data = dict(data)
        
        # Handle allergens as JSON string from frontend
        if 'allergens' in data:
            allergens_value = data.get('allergens')
            if isinstance(allergens_value, str):
                try:
                    # Try to parse as JSON
                    parsed = json.loads(allergens_value)
                    data['allergens'] = parsed if isinstance(parsed, list) else [parsed]
                except (json.JSONDecodeError, TypeError):
                    # If it's not valid JSON, treat as single value or empty
                    if allergens_value and allergens_value != '[]':
                        data['allergens'] = [allergens_value]
                    else:
                        data['allergens'] = []
            elif isinstance(allergens_value, list):
                data['allergens'] = allergens_value
            else:
                data['allergens'] = []
        else:
            data['allergens'] = []
        
        return super().to_internal_value(data)
    
    def create(self, validated_data):
        # Handle image file upload
        image_file = validated_data.pop('image', None)
        if image_file:
            # Convert to base64 data URL
            image_data = base64.b64encode(image_file.read()).decode('utf-8')
            content_type = image_file.content_type or 'image/jpeg'
            validated_data['image_url'] = f"data:{content_type};base64,{image_data}"
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        # Handle image file upload
        image_file = validated_data.pop('image', None)
        if image_file:
            # Convert to base64 data URL
            image_data = base64.b64encode(image_file.read()).decode('utf-8')
            content_type = image_file.content_type or 'image/jpeg'
            validated_data['image_url'] = f"data:{content_type};base64,{image_data}"
        return super().update(instance, validated_data)


class OpeningHoursSerializer(serializers.ModelSerializer):
    day_name = serializers.CharField(source='get_day_name', read_only=True)

    class Meta:
        model = OpeningHours
        fields = "__all__"


class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = "__all__"


class PromotionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Promotion
        fields = "__all__"


class ReservationSerializer(serializers.ModelSerializer):
    # Accept frontend field names and map to model fields
    reservation_date = serializers.DateField(source='date', required=False)
    reservation_time = serializers.TimeField(source='time', required=False)
    
    class Meta:
        model = Reservation
        fields = [
            'id', 'vendor', 'customer_name', 'customer_email', 'customer_phone',
            'date', 'time', 'reservation_date', 'reservation_time',
            'party_size', 'special_requests', 'status'
        ]
        extra_kwargs = {
            'vendor': {'required': False},  # Set in view
            'date': {'required': False},     # Can use reservation_date
            'time': {'required': False},     # Can use reservation_time
        }
    
    def validate(self, data):
        # Ensure date and time are provided (either directly or via aliases)
        if 'date' not in data:
            raise serializers.ValidationError({'date': 'This field is required.'})
        if 'time' not in data:
            raise serializers.ValidationError({'time': 'This field is required.'})
        return data


class VendorDetailSerializer(serializers.ModelSerializer):
    menu_items = MenuItemSerializer(many=True, read_only=True)
    opening_hours = OpeningHoursSerializer(many=True, read_only=True)
    reviews = ReviewSerializer(many=True, read_only=True)
    active_promotions = serializers.SerializerMethodField()
    rating_summary = serializers.SerializerMethodField()
    owner_username = serializers.ReadOnlyField(source='owner.username')

    class Meta:
        model = Vendor
        fields = [
            "id", "name", "city", "cuisines", "lat", "lon", "is_active", "is_open", "is_halal",
            "created_at", "updated_at", "menu_items", "opening_hours",
            "reviews", "active_promotions", "rating_summary", "owner", "owner_username"
        ]
        read_only_fields = ['owner', 'owner_username', 'created_at', 'updated_at']

    def get_active_promotions(self, obj):
        promotions = obj.promotions.filter(
            is_active=True,
            start_date__lte=datetime.now().date(),
            end_date__gte=datetime.now().date()
        )
        return PromotionSerializer(promotions, many=True).data

    def get_rating_summary(self, obj):
        reviews = obj.reviews.all()
        if not reviews:
            return {
                'average_rating': 0,
                'total_reviews': 0,
                'rating_distribution': {
                    '5': 0, '4': 0, '3': 0, '2': 0, '1': 0
                }
            }
        
        total = reviews.count()
        avg_rating = reviews.aggregate(Avg('rating'))['rating__avg']
        distribution = {
            str(i): reviews.filter(rating=i).count()
            for i in range(1, 6)
        }
        
        return {
            'average_rating': round(avg_rating, 1),
            'total_reviews': total,
            'rating_distribution': distribution
        }


class VendorListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list views"""
    rating_average = serializers.SerializerMethodField()
    total_reviews = serializers.SerializerMethodField()
    owner_username = serializers.ReadOnlyField(source='owner.username')
    
    class Meta:
        model = Vendor
        fields = [
            'id', 'name', 'city', 'cuisines', 'lat', 'lon', 
            'description', 'established_year', 'price_range',
            'address', 'contact_phone', 'contact_email',
            'official_website', 'facebook_url', 'instagram_url', 
            'tripadvisor_url', 'google_maps_url',
            'logo_url', 'cover_image_url', 'gallery_images',
            'amenities', 'delivery_available', 'takeaway_available',
            'reservation_required', 'dress_code', 'is_halal',
            'rating_average', 'total_reviews', 'is_active', 'is_open',
            'owner', 'owner_username', 'created_at', 'updated_at'
        ]
        read_only_fields = ['owner', 'owner_username', 'created_at', 'updated_at']
    
    def get_rating_average(self, obj):
        avg = obj.reviews.aggregate(Avg('rating'))['rating__avg']
        return round(avg, 1) if avg else 0
    
    def get_total_reviews(self, obj):
        return obj.reviews.count()
    
    def get_rating_average(self, obj):
        avg = obj.reviews.aggregate(Avg('rating'))['rating__avg']
        return round(avg, 1) if avg else 0
    
    def get_total_reviews(self, obj):
        return obj.reviews.count()
