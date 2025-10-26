from django.contrib import admin
from django.utils.html import format_html
from .models import Place, SocialPost

# ----- helpers to safely read optional fields by multiple possible names -----
def read_any(obj, names, default=None):
    for n in names:
        if hasattr(obj, n):
            return getattr(obj, n)
    return default

@admin.register(Place)
class PlaceAdmin(admin.ModelAdmin):
    # show only fields we know exist, and add safe callables
    list_display = (
        "name",
        "category",
        "is_free",
        "price_or_free",
        "latitude",
        "longitude",
    )
    list_filter = ("category", "is_free")
    search_fields = ("name", "category")

    def price_or_free(self, obj):
        # Handle various possible price/currency combos gracefully
        is_free = read_any(obj, ["is_free"], False)
        if is_free:
            return format_html("<b>FREE</b>")
        price = read_any(obj, ["price"])
        if price is None:
            return "—"
        currency = read_any(obj, ["currency"], "")
        return f"{price} {currency}".strip()

    price_or_free.short_description = "Price"

@admin.register(SocialPost)
class SocialPostAdmin(admin.ModelAdmin):
    # Avoid referencing fields that may not exist; use callables instead.
    list_display = (
        "platform",
        "post_id_any",
        "place",
        "likes_any",
        "comments_any",
        "shares_any",
        "posted_at_any",
    )

    # Only filter by fields that are very likely to exist.
    # (Do NOT include booleans/choices if you’re not 100% sure they exist.)
    list_filter = ("platform", "place")
    search_fields = ("platform", "text")

    # ---------- safe accessors ----------
    def post_id_any(self, obj):
        return read_any(obj, ["external_id", "post_id", "source_id", "provider_id", "id"], "—")
    post_id_any.short_description = "Post ID"

    def likes_any(self, obj):
        return read_any(obj, ["likes", "like_count"], 0)
    likes_any.short_description = "Likes"

    def comments_any(self, obj):
        return read_any(obj, ["comments", "comment_count"], 0)
    comments_any.short_description = "Comments"

    def shares_any(self, obj):
        return read_any(obj, ["shares", "share_count", "reposts"], 0)
    shares_any.short_description = "Shares"

    def posted_at_any(self, obj):
        return read_any(obj, ["posted_at", "created_at", "published_at"])
    posted_at_any.short_description = "Posted at"
