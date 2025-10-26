
from django.db import models


# ──────────────────────────────────────────────
# 1️⃣ Place model — stores tourism places
# ──────────────────────────────────────────────
class Place(models.Model):
    name = models.CharField(max_length=200, unique=True)
    city = models.CharField(max_length=100, blank=True)
    description = models.TextField(blank=True)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    category = models.CharField(max_length=100, blank=True)
    price_cents = models.IntegerField(null=True, blank=True)
    is_free = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

    @property
    def price_display(self):
        if self.is_free or not self.price_cents:
            return "Free"
        return f"RM {self.price_cents / 100:.2f}"


# ──────────────────────────────────────────────
# 2️⃣ SocialPost model — stores social data about those places
# ──────────────────────────────────────────────
class SocialPost(models.Model):
    PLATFORM_CHOICES = [
        ("x", "X / Twitter"),
        ("ig", "Instagram"),
        ("tt", "TikTok"),
        ("fb", "Facebook"),
    ]
    platform = models.CharField(max_length=8, choices=PLATFORM_CHOICES)
    external_id = models.CharField(max_length=128, unique=True)
    text = models.TextField()
    created_at = models.DateTimeField()
    place = models.ForeignKey(Place, null=True, blank=True, on_delete=models.SET_NULL)
    is_tourism_related = models.BooleanField(default=False)
    sentiment = models.SmallIntegerField(default=0)  # -1, 0, 1
    likes = models.IntegerField(default=0)
    comments = models.IntegerField(default=0)
    shares = models.IntegerField(default=0)
    inserted_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.platform.upper()} post {self.external_id}"

    class Meta:
        indexes = [
            models.Index(fields=["created_at"]),
            models.Index(fields=["place", "created_at"]),
        ]
