from django.contrib import admin
from .models import Place, SocialPost


# ---------- Inline: show posts inside a Place page ----------
class SocialPostInline(admin.TabularInline):
    model = SocialPost
    extra = 0
    fields = ("platform", "post_id", "created_at", "likes", "comments", "shares", "is_tourism")
    readonly_fields = ("created_at", "likes", "comments", "shares")  # tweak if you want editable
    show_change_link = True


@admin.register(Place)
class PlaceAdmin(admin.ModelAdmin):
    # columns in the table
    list_display = (
        "id", "name", "category", "city", "state", "country",
        "is_free", "price", "currency", "latitude", "longitude",
    )
    list_filter = ("category", "city", "state", "country", "is_free", "currency")
    search_fields = ("name", "description", "city", "state", "country", "category")
    ordering = ("name",)
    list_per_page = 50

    fieldsets = (
        ("Basic info", {"fields": ("name", "description", "category")}),
        ("Location", {"fields": ("city", "state", "country", "latitude", "longitude")}),
        ("Pricing", {"fields": ("is_free", "price", "currency")}),
    )

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
