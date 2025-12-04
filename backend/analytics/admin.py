from django.contrib import admin
from django import forms
from django.utils.html import format_html
from .models import Place, SocialPost, PostRaw, PostClean, SentimentTopic


# ---------- Custom Form for Place with better amenities handling ----------
class PlaceAdminForm(forms.ModelForm):
    class Meta:
        model = Place
        fields = '__all__'
        widgets = {
            'amenities': forms.Textarea(attrs={
                'rows': 6,
                'cols': 60,
                'placeholder': '{\n  "parking": true,\n  "wifi": true,\n  "wheelchair_accessible": true,\n  "restaurant": true,\n  "restroom": true\n}'
            }),
            'description': forms.Textarea(attrs={'rows': 4, 'cols': 80}),
            'opening_hours': forms.Textarea(attrs={'rows': 2, 'cols': 60, 'placeholder': 'e.g., Mon-Sun: 9:00 AM - 10:00 PM'}),
            'best_time_to_visit': forms.Textarea(attrs={'rows': 2, 'cols': 60, 'placeholder': 'e.g., November to February for cooler weather'}),
            'address': forms.Textarea(attrs={'rows': 2, 'cols': 60}),
        }


# ---------- Inline: show posts inside a Place page ----------
class SocialPostInline(admin.TabularInline):
    model = SocialPost
    extra = 0
    fields = ("platform", "post_id", "created_at", "likes", "comments", "shares", "is_tourism")
    readonly_fields = ("created_at", "likes", "comments", "shares")  # tweak if you want editable
    show_change_link = True


@admin.register(Place)
class PlaceAdmin(admin.ModelAdmin):
    form = PlaceAdminForm  # Use custom form for better field handling
    
    # columns in the table
    list_display = (
        "id", "name", "category", "city", "state", "country",
        "is_free", "price", "currency", "has_wikipedia", "has_website", 
        "has_contact", "has_amenities",
    )
    list_filter = ("category", "city", "state", "country", "is_free", "currency")
    search_fields = ("name", "description", "city", "state", "country", "category")
    ordering = ("name",)
    list_per_page = 50

    fieldsets = (
        ("Basic Information", {
            "fields": ("name", "description", "category", "image_url")
        }),
        ("Location Details", {
            "fields": ("city", "state", "country", "latitude", "longitude", "address")
        }),
        ("Pricing Information", {
            "fields": ("is_free", "price", "currency")
        }),
        ("External Links & Resources", {
            "fields": ("wikipedia_url", "official_website", "tripadvisor_url", "google_maps_url"),
            "description": "Add external links to help visitors find more information about this place."
        }),
        ("Contact Information", {
            "fields": ("contact_phone", "contact_email"),
            "description": "Provide contact details for visitors to reach out."
        }),
        ("Visitor Information", {
            "fields": ("opening_hours", "best_time_to_visit"),
            "description": "Help visitors plan their visit with operating hours and best times."
        }),
        ("Facilities & Amenities", {
            "fields": ("amenities",),
            "description": "Enter amenities as JSON, e.g.: {\"parking\": true, \"wifi\": true, \"wheelchair_accessible\": true, \"restaurant\": true, \"restroom\": true}"
        }),
        ("Ownership & Management", {
            "fields": ("created_by",),
            "classes": ("collapse",)
        }),
    )
    
    def has_wikipedia(self, obj):
        return bool(obj.wikipedia_url)
    has_wikipedia.boolean = True
    has_wikipedia.short_description = "Wikipedia"
    
    def has_website(self, obj):
        return bool(obj.official_website)
    has_website.boolean = True
    has_website.short_description = "Website"
    
    def has_contact(self, obj):
        return bool(obj.contact_phone or obj.contact_email)
    has_contact.boolean = True
    has_contact.short_description = "Contact Info"
    
    def has_amenities(self, obj):
        return bool(obj.amenities)
    has_amenities.boolean = True
    has_amenities.short_description = "Amenities"

    inlines = [SocialPostInline]


# ---------- Admin helpers for SocialPost ----------
@admin.register(SocialPost)
class SocialPostAdmin(admin.ModelAdmin):
    @admin.display(description="Engagement")
    def engagement(self, obj):
        return (obj.likes or 0) + (obj.comments or 0) + (obj.shares or 0)

    @admin.display(description="Snippet")
    def snippet(self, obj):
        s = (obj.content or "")
        return s if len(s) <= 80 else s[:77] + "…"

    list_display = (
        "id", "platform", "post_id", "place", "created_at",
        "likes", "comments", "shares", "engagement", "is_tourism",
    )
    list_filter = ("platform", "is_tourism", "created_at", "place")
    search_fields = ("post_id", "content", "url", "platform", "place__name")
    autocomplete_fields = ("place",)
    list_select_related = ("place",)
    date_hierarchy = "created_at"
    ordering = ("-created_at", "-id")
    list_per_page = 50

    readonly_fields = ("fetched_at",)

    fieldsets = (
        ("Identity", {"fields": ("platform", "post_id", "url")}),
        ("Content", {"fields": ("content",)}),
        ("Linkage", {"fields": ("place", "is_tourism", "extra")}),
        ("Timestamps", {"fields": ("created_at", "fetched_at")}),
        ("Engagement", {"fields": ("likes", "comments", "shares")}),
    )

    actions = [
        "mark_as_tourism",
        "mark_as_non_tourism",
    ]

    def mark_as_tourism(self, request, queryset):
        updated = queryset.update(is_tourism=True)
        self.message_user(request, f"Marked {updated} posts as tourism.")
    mark_as_tourism.short_description = "Mark selected as tourism ✅"

    def mark_as_non_tourism(self, request, queryset):
        updated = queryset.update(is_tourism=False)
        self.message_user(request, f"Marked {updated} posts as NOT tourism.")
    mark_as_non_tourism.short_description = "Mark selected as NOT tourism ❌"


@admin.register(PostRaw)
class PostRawAdmin(admin.ModelAdmin):
    list_display = ('post', 'created_at')
    date_hierarchy = 'created_at'


@admin.register(PostClean)
class PostCleanAdmin(admin.ModelAdmin):
    list_display = ('raw_post', 'sentiment', 'poi', 'created_at')
    list_filter = ('sentiment', 'poi')
    date_hierarchy = 'created_at'


@admin.register(SentimentTopic)
class SentimentTopicAdmin(admin.ModelAdmin):
    list_display = ('topic', 'sentiment', 'count', 'category', 'date')
    list_filter = ('sentiment', 'category', 'date')
    search_fields = ('topic',)
    date_hierarchy = 'date'
