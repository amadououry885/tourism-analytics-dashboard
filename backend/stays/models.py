from django.db import models

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

    class Meta:
        ordering = ["district", "name"]
        indexes = [models.Index(fields=["district", "type"])]

    def __str__(self):
        return self.name
