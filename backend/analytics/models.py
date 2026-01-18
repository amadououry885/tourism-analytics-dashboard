from django.db import models
from django.conf import settings


class Place(models.Model):
    # Core identity
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True, default="")

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
    
    # Image (supports both URLs and base64 data URLs)
    image_url = models.TextField(blank=True, default="", help_text="URL or base64 data URL for place image")
    
    # External Links & Resources
    wikipedia_url = models.URLField(blank=True, default="", help_text="Wikipedia article link")
    official_website = models.URLField(blank=True, default="", help_text="Official website or tourism board link")
    tripadvisor_url = models.URLField(blank=True, default="", help_text="TripAdvisor page link")
    google_maps_url = models.URLField(blank=True, default="", help_text="Google Maps link")
    
    # Contact Information
    contact_phone = models.CharField(max_length=20, blank=True, default="", help_text="Contact phone number")
    contact_email = models.EmailField(blank=True, default="", help_text="Contact email")
    address = models.TextField(blank=True, default="", help_text="Full physical address")
    
    # Operational Details
    opening_hours = models.TextField(blank=True, default="", help_text="Opening hours (e.g., 'Mon-Fri: 9AM-6PM')")
    best_time_to_visit = models.CharField(max_length=200, blank=True, default="", help_text="Best season/time to visit")
    is_open = models.BooleanField(default=True, help_text="Whether the place is currently open/operational")
    
    # Facilities & Amenities (JSON field for flexible storage)
    amenities = models.JSONField(
        default=dict, 
        blank=True,
        help_text="Facilities like parking, WiFi, wheelchair access, etc."
    )
    
    # Ownership tracking
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_places',
        help_text="Admin user who created this place"
    )
    
    # Private place ownership (for non-council managed attractions)
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='owned_places',
        help_text="Place owner user who manages this attraction"
    )
    is_council_managed = models.BooleanField(
        default=True,
        help_text="True if managed by tourism council (admin), False if privately managed"
    )
    is_active = models.BooleanField(
        default=True,
        help_text="Whether the place is active/visible on the platform"
    )

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
    views = models.PositiveIntegerField(default=0)  # ✅ ADDED: To store post views

    # AI Analysis Results
    sentiment = models.CharField(
        max_length=20,
        choices=[
            ('positive', 'Positive'),
            ('negative', 'Negative'),
            ('neutral', 'Neutral'),
        ],
        default='neutral',
        blank=True,
        help_text="AI-classified sentiment category"
    )
    sentiment_score = models.FloatField(
        default=0.0,
        help_text="Numerical sentiment score: -1.0 (very negative) to +1.0 (very positive)"
    )
    confidence = models.FloatField(
        default=0.0,
        help_text="AI classification confidence (0-100%)"
    )

    # Filtering + linkage
    is_tourism = models.BooleanField(default=True)
    place = models.ForeignKey(
        Place,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="posts",
        db_index=True,  # we query by place a lot
        help_text="Related tourism destination"
    )
    
    # ✅ NEW: Link to vendors/restaurants
    vendor = models.ForeignKey(
        'vendors.Vendor',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="social_posts",
        db_index=True,
        help_text="Related restaurant/vendor mentioned in post"
    )
    
    # ✅ NEW: Link to accommodations
    stay = models.ForeignKey(
        'stays.Stay',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="social_posts",
        db_index=True,
        help_text="Related accommodation mentioned in post"
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


class PostRaw(models.Model):
    """Raw social media posts before processing"""
    post = models.ForeignKey(SocialPost, on_delete=models.CASCADE, related_name='raw_posts')
    content = models.TextField()
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("-created_at",)


class PostClean(models.Model):
    """Processed and cleaned social media posts"""
    raw_post = models.OneToOneField(PostRaw, on_delete=models.CASCADE, related_name='cleaned_post')
    content = models.TextField()
    sentiment = models.CharField(max_length=20, choices=[
        ('positive', 'Positive'),
        ('neutral', 'Neutral'),
        ('negative', 'Negative')
    ])
    keywords = models.JSONField(default=list)
    poi = models.ForeignKey(Place, null=True, blank=True, on_delete=models.SET_NULL)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("-created_at",)
        indexes = [
            models.Index(fields=["sentiment"]),
            models.Index(fields=["poi"]),
        ]


class SentimentTopic(models.Model):
    """Topics extracted from posts with their sentiment analysis"""
    topic = models.CharField(max_length=100)
    sentiment = models.CharField(max_length=20, choices=[
        ('positive', 'Positive'),
        ('neutral', 'Neutral'),
        ('negative', 'Negative')
    ])
    count = models.PositiveIntegerField(default=0)
    category = models.CharField(max_length=100, blank=True)  # e.g., 'Attractions', 'Food', 'Transport'
    date = models.DateField()
    
    class Meta:
        ordering = ("-date", "-count")
        indexes = [
            models.Index(fields=["topic"]),
            models.Index(fields=["sentiment"]),
            models.Index(fields=["category"]),
            models.Index(fields=["date"]),
        ]
