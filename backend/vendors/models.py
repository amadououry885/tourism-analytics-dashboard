from django.db import models
from django.conf import settings

class Vendor(models.Model):
    # Basic Information
    name = models.CharField(max_length=200)
    city = models.CharField(max_length=120, db_index=True)
    cuisines = models.JSONField(default=list, blank=True)
    description = models.TextField(blank=True, help_text="About the restaurant")
    established_year = models.IntegerField(null=True, blank=True, help_text="Year the restaurant opened")
    
    # Location
    lat = models.FloatField(null=True, blank=True)
    lon = models.FloatField(null=True, blank=True)
    address = models.TextField(blank=True, help_text="Full street address")
    
    # Pricing
    PRICE_RANGE_CHOICES = [
        ('$', 'Budget (< RM30)'),
        ('$$', 'Moderate (RM30-80)'),
        ('$$$', 'Upscale (RM80-150)'),
        ('$$$$', 'Fine Dining (> RM150)')
    ]
    price_range = models.CharField(max_length=10, choices=PRICE_RANGE_CHOICES, default='$$', blank=True)
    
    # Contact Information
    contact_phone = models.CharField(max_length=20, blank=True)
    contact_email = models.EmailField(blank=True)
    
    # Online Presence
    official_website = models.URLField(blank=True)
    facebook_url = models.URLField(blank=True)
    instagram_url = models.URLField(blank=True)
    tripadvisor_url = models.URLField(blank=True)
    google_maps_url = models.URLField(blank=True)
    
    # Visual Content
    logo_url = models.URLField(blank=True, help_text="Restaurant logo image URL")
    cover_image_url = models.URLField(blank=True, help_text="Banner/cover image URL")
    gallery_images = models.JSONField(default=list, blank=True, help_text="Array of image URLs for gallery")
    
    # Amenities & Features
    amenities = models.JSONField(default=dict, blank=True, help_text="Facilities like parking, wifi, wheelchair_accessible, etc.")
    
    # Operational Info
    delivery_available = models.BooleanField(default=False)
    takeaway_available = models.BooleanField(default=True)
    reservation_required = models.BooleanField(default=False)
    dress_code = models.CharField(max_length=100, blank=True, help_text="e.g., Casual, Smart Casual, Formal")
    is_open = models.BooleanField(default=True, help_text="Whether the restaurant is currently open/operational")
    is_halal = models.BooleanField(default=True, help_text="Whether the restaurant is Halal certified")
    
    # System Fields
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Ownership tracking (nullable for existing records)
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='owned_vendors',
        help_text="Vendor user who owns this vendor profile"
    )

    class Meta:
        ordering = ["city", "name"]
        indexes = [models.Index(fields=["city"])]

    def __str__(self):
        return f"{self.name} — {self.city}"


class MenuItem(models.Model):
    """Food/drink items offered by vendors"""
    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE, related_name='menu_items')
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=100)  # e.g., "Main Course", "Dessert", "Beverage"
    price = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default="MYR")
    is_available = models.BooleanField(default=True)
    is_vegetarian = models.BooleanField(default=False)
    is_halal = models.BooleanField(default=True)
    spiciness_level = models.IntegerField(default=0)  # 0-5 scale
    allergens = models.JSONField(default=list, blank=True)
    image_url = models.URLField(blank=True)
    
    class Meta:
        ordering = ['category', 'name']
        indexes = [
            models.Index(fields=['vendor', 'category']),
            models.Index(fields=['is_available']),
            models.Index(fields=['is_vegetarian']),
            models.Index(fields=['is_halal']),
        ]

    def __str__(self):
        return f"{self.name} ({self.vendor.name})"


class OpeningHours(models.Model):
    """Vendor operating hours"""
    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE, related_name='opening_hours')
    day_of_week = models.IntegerField()  # 0=Monday, 6=Sunday
    open_time = models.TimeField()
    close_time = models.TimeField()
    is_closed = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['day_of_week', 'open_time']
        indexes = [
            models.Index(fields=['vendor', 'day_of_week']),
        ]

    def __str__(self):
        return f"{self.vendor.name} - {self.get_day_name()}"

    def get_day_name(self):
        days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        return days[self.day_of_week]


class Review(models.Model):
    """Customer reviews for vendors"""
    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE, related_name='reviews')
    rating = models.IntegerField()  # 1-5 stars
    comment = models.TextField()
    author_name = models.CharField(max_length=100)
    date = models.DateTimeField(auto_now_add=True)
    verified_visit = models.BooleanField(default=False)
    
    # Rating breakdown
    food_rating = models.IntegerField(null=True, blank=True)
    service_rating = models.IntegerField(null=True, blank=True)
    ambience_rating = models.IntegerField(null=True, blank=True)
    value_rating = models.IntegerField(null=True, blank=True)
    
    class Meta:
        ordering = ['-date']
        indexes = [
            models.Index(fields=['vendor', 'date']),
            models.Index(fields=['rating']),
            models.Index(fields=['verified_visit']),
        ]

    def __str__(self):
        return f"{self.vendor.name} - {self.rating}★ by {self.author_name}"


class Promotion(models.Model):
    """Special offers and promotions"""
    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE, related_name='promotions')
    title = models.CharField(max_length=200)
    description = models.TextField()
    start_date = models.DateField()
    end_date = models.DateField()
    discount_percentage = models.IntegerField(null=True, blank=True)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    promo_code = models.CharField(max_length=50, blank=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['-start_date']
        indexes = [
            models.Index(fields=['vendor', 'start_date', 'end_date']),
            models.Index(fields=['is_active']),
        ]

    def __str__(self):
        return f"{self.vendor.name} - {self.title}"


class Reservation(models.Model):
    """Table reservations at vendors"""
    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE, related_name='reservations')
    customer_name = models.CharField(max_length=100)
    customer_email = models.EmailField()
    customer_phone = models.CharField(max_length=20)
    date = models.DateField()
    time = models.TimeField()
    party_size = models.IntegerField()
    special_requests = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=[
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
        ('completed', 'Completed')
    ], default='pending')
    
    class Meta:
        ordering = ['date', 'time']
        indexes = [
            models.Index(fields=['vendor', 'date']),
            models.Index(fields=['status']),
        ]

    def __str__(self):
        return f"{self.vendor.name} - {self.customer_name} ({self.date} {self.time})"
