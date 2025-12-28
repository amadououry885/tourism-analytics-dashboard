from django.db import models
from django.conf import settings
import os

def stay_image_upload_path(instance, filename):
    """Generate upload path for stay images: stays/{stay_id}/{filename}"""
    ext = filename.split('.')[-1]
    filename = f"{instance.name.replace(' ', '_')}_{filename}"
    return os.path.join('stays', str(instance.id or 'temp'), filename)

class Stay(models.Model):
    TYPE_CHOICES = [
        ("Hotel", "Hotel"),
        ("Apartment", "Apartment"),
        ("Guest House", "Guest House"),
        ("Homestay", "Homestay"),
    ]
    name = models.CharField(max_length=200)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    district = models.CharField(max_length=120, db_index=True)  # "Alor Setar", "Langkawi", ...
    rating = models.DecimalField(max_digits=3, decimal_places=1, null=True, blank=True)  # 8.6
    priceNight = models.DecimalField(max_digits=8, decimal_places=2)  # RM
    amenities = models.JSONField(default=list, blank=True)  # ["WiFi","Parking",...]
    lat = models.FloatField(null=True, blank=True)
    lon = models.FloatField(null=True, blank=True)
    images = models.JSONField(default=list, blank=True)  # Array of image URLs/paths
    main_image = models.ImageField(upload_to=stay_image_upload_path, null=True, blank=True)  # Primary image
    landmark = models.CharField(max_length=200, blank=True)
    distanceKm = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    is_open = models.BooleanField(default=True, help_text="Whether the accommodation is currently open/operational")
    
    # Hybrid search: differentiate internal (platform) vs external (affiliate) stays
    is_internal = models.BooleanField(
        default=True,
        help_text="True for stays created by owners on our platform, False for external affiliate stays"
    )
    
    # Contact information for internal stays (direct booking)
    contact_email = models.EmailField(
        max_length=255,
        blank=True,
        null=True,
        help_text="Email for tourists to contact the owner directly"
    )
    contact_phone = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        help_text="Phone number for direct booking inquiries"
    )
    contact_whatsapp = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        help_text="WhatsApp number for instant messaging"
    )
    
    # External booking integration
    booking_com_url = models.URLField(
        max_length=500, 
        blank=True, 
        null=True, 
        help_text="Direct link to this property on Booking.com"
    )
    agoda_url = models.URLField(
        max_length=500, 
        blank=True, 
        null=True, 
        help_text="Direct link to this property on Agoda"
    )
    booking_provider = models.CharField(
        max_length=50, 
        blank=True, 
        choices=[
            ('booking.com', 'Booking.com'),
            ('agoda', 'Agoda'),
            ('both', 'Both Platforms'),
            ('direct', 'Direct Booking'),
        ], 
        default='booking.com',
        help_text="Primary booking platform for this property"
    )
    
    # Ownership tracking (nullable for existing records)
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='owned_stays',
        help_text="Stay owner user who owns this property"
    )

    class Meta:
        ordering = ["district", "name"]
        indexes = [models.Index(fields=["district", "type"])]

    def __str__(self):
        return self.name

class StayImage(models.Model):
    """Multiple images for a stay"""
    stay = models.ForeignKey(
        Stay,
        on_delete=models.CASCADE,
        related_name='stay_images'
    )
    image = models.ImageField(upload_to=stay_image_upload_path)
    caption = models.CharField(max_length=200, blank=True)
    is_primary = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-is_primary', 'order', '-uploaded_at']
        indexes = [models.Index(fields=['stay', 'is_primary'])]

    def __str__(self):
        return f"{self.stay.name} - Image {self.order}"
    
    def save(self, *args, **kwargs):
        # If this is set as primary, unset other primary images
        if self.is_primary:
            StayImage.objects.filter(stay=self.stay, is_primary=True).update(is_primary=False)
        super().save(*args, **kwargs)
