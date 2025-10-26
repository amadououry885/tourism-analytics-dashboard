from django.db import models

class Place(models.Model):
    name = models.CharField(max_length=200)
    category = models.CharField(max_length=100, blank=True, default="")
    city = models.CharField(max_length=100, blank=True, default="")
    state = models.CharField(max_length=100, blank=True, default="")
    country = models.CharField(max_length=100, blank=True, default="")
    is_free = models.BooleanField(default=True)
    price = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    currency = models.CharField(max_length=10, blank=True, default="MYR")
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)

    def __str__(self):
        # extra defensive (shouldn’t be needed, but avoids surprises)
        return self.name or f"Place #{self.pk}"

    class Meta:
        ordering = ("id",)   # safe default; admin won’t accidentally use a missing field


class SocialPost(models.Model):
    platform = models.CharField(max_length=50)
    post_id = models.CharField(max_length=100, unique=True)
    url = models.URLField(blank=True)
    content = models.TextField()
    created_at = models.DateTimeField()
    fetched_at = models.DateTimeField(auto_now_add=True)
    likes = models.PositiveIntegerField(default=0)
    comments = models.PositiveIntegerField(default=0)
    shares = models.PositiveIntegerField(default=0)
    is_tourism = models.BooleanField(default=True)
    place = models.ForeignKey(Place, null=True, blank=True,
                              on_delete=models.SET_NULL, related_name="posts")
    extra = models.JSONField(default=dict, blank=True)

    def __str__(self):
        try:
            place_name = (self.place.name if self.place_id and self.place else "—")
        except Exception:
            place_name = "—"
        # keep it short so admin lists don’t blow up rendering
        snippet = (self.content[:30] + "…") if self.content and len(self.content) > 30 else (self.content or "")
        return f"{self.platform}:{self.post_id} → {place_name} {snippet}".strip()

    class Meta:
        ordering = ("-id",)  # safe and cheap
