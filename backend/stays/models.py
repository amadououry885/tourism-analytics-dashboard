from django.db import models
from django.conf import settings

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
    images = models.JSONField(default=list, blank=True)  # URLs/paths if you add uploads later
    landmark = models.CharField(max_length=200, blank=True)
    distanceKm = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    
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
