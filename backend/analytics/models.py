from django.db import models


class Place(models.Model):
    # Core identity
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True, default="")  # ✅ added

    # Classification / location
    category = models.CharField(max_length=100, blank=True, default="")
    city = models.CharField(max_length=100, blank=True, default="")
    state = models.CharField(max_length=100, blank=True, default="")
    country = models.CharField(max_length=100, blank=True, default="")

    # Pricing
    is_free = models.BooleanField(default=True)
    price = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    currency = models.CharField(max_length=10, blank=True, default="MYR")

    # Geo
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)

    def __str__(self):
        # Extra defensive (avoids admin rendering surprises)
        return self.name or f"Place #{self.pk}"

    class Meta:
        ordering = ("id",)  # stable, cheap default
        indexes = [
            models.Index(fields=["name"]),
            models.Index(fields=["city", "state"]),
        ]


class SocialPost(models.Model):
    # We keep platform (optional) for safe dedup and future analysis
    platform = models.CharField(max_length=50, blank=True, default="")

    # post_id alone can collide across platforms → scope uniqueness with platform
    post_id = models.CharField(max_length=100)

    url = models.URLField(blank=True)
    content = models.TextField()

    # Timestamps
    created_at = models.DateTimeField()               # when the post was made
    fetched_at = models.DateTimeField(auto_now_add=True)  # when we ingested it

    # Engagement
    likes = models.PositiveIntegerField(default=0)
    comments = models.PositiveIntegerField(default=0)
    shares = models.PositiveIntegerField(default=0)

    # Filtering + linkage
    is_tourism = models.BooleanField(default=True)
    place = models.ForeignKey(
        Place,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="posts",
        db_index=True,  # we query by place a lot
    )

    # Flexible bucket for anything extra (hashtags, language, keywords, etc.)
    extra = models.JSONField(default=dict, blank=True)

    def __str__(self):
        try:
            place_name = (self.place.name if self.place_id and self.place else "—")
        except Exception:
            place_name = "—"
        snippet = (
            (self.content[:30] + "…")
            if self.content and len(self.content) > 30
            else (self.content or "")
        )
        # Keep short so admin list rows stay light
        prefix = f"{self.platform}:" if self.platform else ""
        return f"{prefix}{self.post_id} → {place_name} {snippet}".strip()

    class Meta:
        ordering = ("-id",)  # safe and cheap
        constraints = [
            models.UniqueConstraint(
                fields=["platform", "post_id"],
                name="uniq_platform_postid",
            ),
        ]
        indexes = [
            models.Index(fields=["place", "created_at"]),  # common range queries
            models.Index(fields=["created_at"]),
        ]
