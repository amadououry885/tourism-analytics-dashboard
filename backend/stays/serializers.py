from rest_framework import serializers
from django.db import models
from .models import Stay, StayImage

class StayImageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = StayImage
        fields = ['id', 'image', 'image_url', 'caption', 'is_primary', 'order', 'uploaded_at']
        read_only_fields = ['uploaded_at']
    
    def get_image_url(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None

class StaySerializer(serializers.ModelSerializer):
    owner_username = serializers.ReadOnlyField(source='owner.username')
    stay_images = StayImageSerializer(many=True, read_only=True)
    main_image_url = serializers.SerializerMethodField()
    uploaded_images = serializers.ListField(
        child=serializers.ImageField(),
        write_only=True,
        required=False
    )
    
    class Meta:
        model = Stay
        fields = [
            "id",
            "name",
            "type",
            "district",
            "rating",
            "priceNight",
            "amenities",
            "lat",
            "lon",
            "images",
            "main_image",
            "main_image_url",
            "stay_images",
            "uploaded_images",
            "landmark",
            "distanceKm",
            "is_active",
            "is_open",
            "is_internal",
            "contact_email",
            "contact_phone",
            "contact_whatsapp",
            "booking_com_url",
            "agoda_url",
            "booking_provider",
            "owner",
            "owner_username",
        ]
        read_only_fields = ['owner', 'owner_username', 'stay_images', 'main_image_url']
    
    def get_main_image_url(self, obj):
        if obj.main_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.main_image.url)
            return obj.main_image.url
        # Fallback to first stay_image if no main_image
        first_image = obj.stay_images.filter(is_primary=True).first() or obj.stay_images.first()
        if first_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(first_image.image.url)
            return first_image.image.url
        return None
    
    def create(self, validated_data):
        uploaded_images = validated_data.pop('uploaded_images', [])
        stay = Stay.objects.create(**validated_data)
        
        # Create StayImage objects for uploaded images
        for idx, image_file in enumerate(uploaded_images):
            StayImage.objects.create(
                stay=stay,
                image=image_file,
                is_primary=(idx == 0),  # First image is primary
                order=idx
            )
        
        return stay
    
    def update(self, instance, validated_data):
        uploaded_images = validated_data.pop('uploaded_images', [])
        
        # Update stay fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Add new images if provided
        if uploaded_images:
            current_max_order = instance.stay_images.aggregate(
                models.Max('order')
            )['order__max'] or -1
            
            for idx, image_file in enumerate(uploaded_images):
                StayImage.objects.create(
                    stay=instance,
                    image=image_file,
                    order=current_max_order + idx + 1
                )
        
        return instance
