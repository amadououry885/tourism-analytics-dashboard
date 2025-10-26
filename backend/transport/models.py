from django.db import models


class Place(models.Model):
    name = models.CharField(max_length=150, unique=True)  # "Alor Setar", "Kuala Lumpur"
    lat = models.FloatField(null=True, blank=True)
    lon = models.FloatField(null=True, blank=True)
    is_in_kedah = models.BooleanField(default=False)

    class Meta:
        ordering = ["name"]
        indexes = [
            models.Index(fields=["name"]),
            models.Index(fields=["is_in_kedah"]),
        ]

    def __str__(self):
        return self.name


class Route(models.Model):
    TYPE_CHOICES = [
        ("intra_kedah", "Intra-Kedah"),
        ("coming_to_kedah", "Coming to Kedah"),
        ("leaving_kedah", "Leaving Kedah"),
    ]

    from_place = models.ForeignKey(Place, on_delete=models.CASCADE, related_name="routes_from")
    to_place   = models.ForeignKey(Place, on_delete=models.CASCADE, related_name="routes_to")
    route_type = models.CharField(max_length=20, choices=TYPE_CHOICES)

    # Same structure as your frontend mock: list of {mode, durationMin, priceMin, priceMax, provider}
    options = models.JSONField(default=list, blank=True)

    # Optional path preview: [[lat, lng], ...]
    polyline = models.JSONField(null=True, blank=True)

    class Meta:
        # allow multiple route types between the same pair
        unique_together = ("from_place", "to_place", "route_type")
        indexes = [
            models.Index(fields=["route_type"]),
            models.Index(fields=["from_place", "to_place"]),
        ]

    def __str__(self):
        return f"{self.from_place} → {self.to_place} ({self.route_type})"
