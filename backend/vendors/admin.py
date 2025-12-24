# backend/vendors/admin.py
from django.contrib import admin
from django.contrib import messages
from django.utils.html import format_html
from django.db.models import Avg, Count
from .models import Vendor, MenuItem, OpeningHours, Review, Promotion, Reservation
from .emails import send_reservation_confirmation, send_reservation_status_update, send_promotion_notification


# ✨ Inline for Menu Items
class MenuItemInline(admin.TabularInline):
    model = MenuItem
    extra = 1
    fields = ('name', 'category', 'price', 'is_available', 'is_vegetarian', 'is_halal', 'spiciness_level')
    ordering = ('category', 'name')


# ✨ Inline for Opening Hours
class OpeningHoursInline(admin.TabularInline):
    model = OpeningHours
    extra = 0
    fields = ('day_of_week', 'open_time', 'close_time', 'is_closed')
    ordering = ('day_of_week',)
    max_num = 7


# ✨ Inline for Reviews (read-only)
class ReviewInline(admin.TabularInline):
    model = Review
    extra = 0
    readonly_fields = ('author_name', 'rating', 'comment', 'date', 'verified_visit')
    fields = ('author_name', 'rating', 'comment', 'date', 'verified_visit')
    can_delete = True
    max_num = 0
    
    def has_add_permission(self, request, obj=None):
        return False


# ✨ Inline for Reservations (read-only from Vendor)
class ReservationInline(admin.TabularInline):
    model = Reservation
    extra = 0
    readonly_fields = ('customer_name', 'customer_email', 'date', 'time', 'party_size', 'status')
    fields = ('customer_name', 'date', 'time', 'party_size', 'status')
    can_delete = False
    max_num = 0
    ordering = ('-date', '-time')
    
    def has_add_permission(self, request, obj=None):
        return False


# ✨ Inline for Promotions
class PromotionInline(admin.TabularInline):
    model = Promotion
    extra = 0
    fields = ('title', 'discount_percentage', 'promo_code', 'start_date', 'end_date', 'is_active')
    ordering = ('-start_date',)


@admin.register(MenuItem)
class MenuItemAdmin(admin.ModelAdmin):
    list_display = ('name', 'vendor', 'category', 'price_display', 'is_available', 'dietary_badges')
    list_filter = ('vendor', 'category', 'is_available', 'is_vegetarian', 'is_halal')
    search_fields = ('name', 'vendor__name', 'description')
    list_editable = ('is_available',)
    actions = ['mark_available', 'mark_unavailable']
    
    fieldsets = (
        ('Basic Info', {
            'fields': ('vendor', 'name', 'category', 'description', 'image_url')
        }),
        ('Pricing', {
            'fields': ('price', 'currency')
        }),
        ('Dietary Info', {
            'fields': ('is_vegetarian', 'is_halal', 'spiciness_level', 'allergens')
        }),
        ('Availability', {
            'fields': ('is_available',)
        }),
    )
    
    def price_display(self, obj):
        return f"{obj.currency} {obj.price:.2f}"
    price_display.short_description = 'Price'
    
    def dietary_badges(self, obj):
        badges = []
        if obj.is_halal:
            badges.append('<span style="background: #16a34a; color: white; padding: 2px 6px; border-radius: 3px; font-size: 11px;">Halal</span>')
        if obj.is_vegetarian:
            badges.append('<span style="background: #22c55e; color: white; padding: 2px 6px; border-radius: 3px; font-size: 11px;">Veg</span>')
        if obj.spiciness_level > 0:
            badges.append(f'<span style="background: #ef4444; color: white; padding: 2px 6px; border-radius: 3px; font-size: 11px;">🌶️ {obj.spiciness_level}</span>')
        return format_html(' '.join(badges)) if badges else '-'
    dietary_badges.short_description = 'Dietary'
    
    @admin.action(description='✅ Mark as available')
    def mark_available(self, request, queryset):
        updated = queryset.update(is_available=True)
        self.message_user(request, f"Marked {updated} item(s) as available", messages.SUCCESS)
    
    @admin.action(description='❌ Mark as unavailable')
    def mark_unavailable(self, request, queryset):
        updated = queryset.update(is_available=False)
        self.message_user(request, f"Marked {updated} item(s) as unavailable", messages.SUCCESS)


@admin.register(OpeningHours)
class OpeningHoursAdmin(admin.ModelAdmin):
    list_display = ('vendor', 'day_name_display', 'hours_display', 'is_closed')
    list_filter = ('vendor', 'day_of_week', 'is_closed')
    ordering = ('vendor', 'day_of_week')
    
    def day_name_display(self, obj):
        return obj.get_day_name()
    day_name_display.short_description = 'Day'
    
    def hours_display(self, obj):
        if obj.is_closed:
            return format_html('<span style="color: #dc2626;">Closed</span>')
        return f"{obj.open_time.strftime('%I:%M %p')} - {obj.close_time.strftime('%I:%M %p')}"
    hours_display.short_description = 'Hours'


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('vendor', 'author_name', 'rating_display', 'comment_preview', 'date', 'verified_visit')
    list_filter = ('vendor', 'rating', 'verified_visit', 'date')
    search_fields = ('vendor__name', 'author_name', 'comment')
    date_hierarchy = 'date'
    readonly_fields = ('date',)
    actions = ['mark_verified', 'mark_unverified']
    
    fieldsets = (
        ('Review Info', {
            'fields': ('vendor', 'author_name', 'rating', 'comment', 'date')
        }),
        ('Detailed Ratings', {
            'fields': ('food_rating', 'service_rating', 'ambience_rating', 'value_rating'),
            'classes': ('collapse',)
        }),
        ('Verification', {
            'fields': ('verified_visit',)
        }),
    )
    
    def rating_display(self, obj):
        stars = '⭐' * obj.rating + '☆' * (5 - obj.rating)
        color = '#16a34a' if obj.rating >= 4 else '#f59e0b' if obj.rating >= 3 else '#dc2626'
        return format_html('<span style="color: {};">{}</span>', color, stars)
    rating_display.short_description = 'Rating'
    
    def comment_preview(self, obj):
        if len(obj.comment) > 50:
            return obj.comment[:50] + '...'
        return obj.comment
    comment_preview.short_description = 'Comment'
    
    @admin.action(description='✅ Mark as verified visit')
    def mark_verified(self, request, queryset):
        updated = queryset.update(verified_visit=True)
        self.message_user(request, f"Marked {updated} review(s) as verified", messages.SUCCESS)
    
    @admin.action(description='❌ Mark as unverified')
    def mark_unverified(self, request, queryset):
        updated = queryset.update(verified_visit=False)
        self.message_user(request, f"Marked {updated} review(s) as unverified", messages.SUCCESS)


@admin.register(Promotion)
class PromotionAdmin(admin.ModelAdmin):
    list_display = ('title', 'vendor', 'discount_display', 'promo_code', 'date_range', 'is_active', 'status_badge')
    list_filter = ('vendor', 'is_active', 'start_date', 'end_date')
    search_fields = ('title', 'vendor__name', 'promo_code')
    date_hierarchy = 'start_date'
    list_editable = ('is_active',)
    actions = ['activate_promotions', 'deactivate_promotions', 'send_promo_emails']
    
    fieldsets = (
        ('Promotion Info', {
            'fields': ('vendor', 'title', 'description')
        }),
        ('Discount', {
            'fields': ('discount_percentage', 'discount_amount', 'promo_code')
        }),
        ('Schedule', {
            'fields': ('start_date', 'end_date', 'is_active')
        }),
    )
    
    def discount_display(self, obj):
        if obj.discount_percentage:
            return f"{obj.discount_percentage}% OFF"
        if obj.discount_amount:
            return f"RM{obj.discount_amount} OFF"
        return "-"
    discount_display.short_description = 'Discount'
    
    def date_range(self, obj):
        return f"{obj.start_date.strftime('%b %d')} - {obj.end_date.strftime('%b %d, %Y')}"
    date_range.short_description = 'Valid Period'
    
    def status_badge(self, obj):
        from datetime import date
        today = date.today()
        if not obj.is_active:
            return format_html('<span style="background: #6b7280; color: white; padding: 2px 8px; border-radius: 10px; font-size: 11px;">Inactive</span>')
        if obj.end_date < today:
            return format_html('<span style="background: #dc2626; color: white; padding: 2px 8px; border-radius: 10px; font-size: 11px;">Expired</span>')
        if obj.start_date > today:
            return format_html('<span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 10px; font-size: 11px;">Upcoming</span>')
        return format_html('<span style="background: #16a34a; color: white; padding: 2px 8px; border-radius: 10px; font-size: 11px;">Active</span>')
    status_badge.short_description = 'Status'
    
    @admin.action(description='✅ Activate selected promotions')
    def activate_promotions(self, request, queryset):
        updated = queryset.update(is_active=True)
        self.message_user(request, f"Activated {updated} promotion(s)", messages.SUCCESS)
    
    @admin.action(description='❌ Deactivate selected promotions')
    def deactivate_promotions(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(request, f"Deactivated {updated} promotion(s)", messages.SUCCESS)
    
    @admin.action(description='📧 Send promotion emails to past customers')
    def send_promo_emails(self, request, queryset):
        """Send promotional emails to customers who have reserved at these vendors"""
        total_sent = 0
        for promotion in queryset.filter(is_active=True):
            # Get customer emails from past reservations
            customer_emails = list(
                Reservation.objects.filter(vendor=promotion.vendor, status='completed')
                .values_list('customer_email', flat=True)
                .distinct()
            )
            if customer_emails:
                sent = send_promotion_notification(promotion, customer_emails)
                total_sent += sent
        
        self.message_user(request, f"📧 Sent promotion to {total_sent} customer(s)", messages.SUCCESS)


@admin.register(Reservation)
class ReservationAdmin(admin.ModelAdmin):
    list_display = ('customer_name', 'vendor', 'date', 'time', 'party_size', 'status_badge', 'contact_info', 'email_actions')
    list_filter = ('status', 'vendor', 'date')
    search_fields = ('customer_name', 'customer_email', 'customer_phone', 'vendor__name')
    date_hierarchy = 'date'
    readonly_fields = ('created_at',) if hasattr(Reservation, 'created_at') else ()
    actions = ['confirm_reservations', 'cancel_reservations', 'mark_completed', 'send_confirmation_emails']
    
    fieldsets = (
        ('Customer Info', {
            'fields': ('customer_name', 'customer_email', 'customer_phone')
        }),
        ('Reservation Details', {
            'fields': ('vendor', 'date', 'time', 'party_size', 'special_requests')
        }),
        ('Status', {
            'fields': ('status',)
        }),
    )
    
    def status_badge(self, obj):
        colors = {
            'pending': '#f59e0b',
            'confirmed': '#16a34a',
            'cancelled': '#dc2626',
            'completed': '#3b82f6'
        }
        icons = {
            'pending': '⏳',
            'confirmed': '✅',
            'cancelled': '❌',
            'completed': '🎉'
        }
        color = colors.get(obj.status, '#6b7280')
        icon = icons.get(obj.status, '')
        return format_html(
            '<span style="background: {}; color: white; padding: 3px 10px; border-radius: 10px; font-size: 11px;">{} {}</span>',
            color, icon, obj.status.title()
        )
    status_badge.short_description = 'Status'
    
    def contact_info(self, obj):
        return format_html(
            '<a href="mailto:{}">{}</a><br><small>{}</small>',
            obj.customer_email, obj.customer_email, obj.customer_phone or '-'
        )
    contact_info.short_description = 'Contact'
    
    def email_actions(self, obj):
        return format_html(
            '<a class="button" href="mailto:{}" style="padding: 2px 8px; background: #3b82f6; color: white; text-decoration: none; border-radius: 3px; font-size: 11px;">📧 Email</a>',
            obj.customer_email
        )
    email_actions.short_description = 'Actions'
    
    @admin.action(description='✅ Confirm selected reservations')
    def confirm_reservations(self, request, queryset):
        for reservation in queryset.filter(status='pending'):
            old_status = reservation.status
            reservation.status = 'confirmed'
            reservation.save()
            send_reservation_status_update(reservation, old_status)
        
        count = queryset.filter(status='pending').count()
        self.message_user(request, f"✅ Confirmed {count} reservation(s) and sent emails", messages.SUCCESS)
    
    @admin.action(description='❌ Cancel selected reservations')
    def cancel_reservations(self, request, queryset):
        for reservation in queryset.exclude(status='cancelled'):
            old_status = reservation.status
            reservation.status = 'cancelled'
            reservation.save()
            send_reservation_status_update(reservation, old_status)
        
        count = queryset.exclude(status='cancelled').count()
        self.message_user(request, f"❌ Cancelled {count} reservation(s) and sent emails", messages.SUCCESS)
    
    @admin.action(description='🎉 Mark as completed')
    def mark_completed(self, request, queryset):
        for reservation in queryset.filter(status='confirmed'):
            old_status = reservation.status
            reservation.status = 'completed'
            reservation.save()
            send_reservation_status_update(reservation, old_status)
        
        count = queryset.filter(status='confirmed').count()
        self.message_user(request, f"🎉 Marked {count} reservation(s) as completed", messages.SUCCESS)
    
    @admin.action(description='📧 Send confirmation emails')
    def send_confirmation_emails(self, request, queryset):
        sent = 0
        for reservation in queryset:
            if send_reservation_confirmation(reservation):
                sent += 1
        self.message_user(request, f"📧 Sent {sent} confirmation email(s)", messages.SUCCESS)


@admin.register(Vendor)
class VendorAdmin(admin.ModelAdmin):
    list_display = ('name', 'city', 'cuisines_display', 'price_range', 'rating_display', 'stats_display', 'is_active', 'owner_display')
    list_filter = ('city', 'is_active', 'price_range', 'delivery_available', 'takeaway_available')
    search_fields = ('name', 'city', 'description', 'address')
    list_editable = ('is_active',)
    inlines = [MenuItemInline, OpeningHoursInline, PromotionInline, ReservationInline, ReviewInline]
    actions = ['activate_vendors', 'deactivate_vendors']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'description', 'cuisines', 'established_year', 'is_active')
        }),
        ('Location', {
            'fields': ('city', 'address', 'lat', 'lon')
        }),
        ('Pricing & Services', {
            'fields': ('price_range', 'delivery_available', 'takeaway_available', 'reservation_required', 'dress_code')
        }),
        ('Contact', {
            'fields': ('contact_phone', 'contact_email')
        }),
        ('Online Presence', {
            'fields': ('official_website', 'facebook_url', 'instagram_url', 'tripadvisor_url', 'google_maps_url'),
            'classes': ('collapse',)
        }),
        ('Visual Content', {
            'fields': ('logo_url', 'cover_image_url', 'gallery_images'),
            'classes': ('collapse',)
        }),
        ('Amenities', {
            'fields': ('amenities',),
            'classes': ('collapse',)
        }),
        ('Ownership', {
            'fields': ('owner',),
            'classes': ('collapse',)
        }),
    )
    
    def cuisines_display(self, obj):
        if obj.cuisines:
            badges = [f'<span style="background: #e0e7ff; color: #3730a3; padding: 2px 6px; border-radius: 3px; font-size: 11px; margin-right: 3px;">{c}</span>' for c in obj.cuisines[:3]]
            return format_html(' '.join(badges))
        return '-'
    cuisines_display.short_description = 'Cuisines'
    
    def rating_display(self, obj):
        avg = obj.reviews.aggregate(Avg('rating'))['rating__avg']
        if avg:
            stars = '⭐' * int(round(avg))
            return format_html('{} <small>({:.1f})</small>', stars, avg)
        return '-'
    rating_display.short_description = 'Rating'
    
    def stats_display(self, obj):
        menu_count = obj.menu_items.count()
        review_count = obj.reviews.count()
        reservation_count = obj.reservations.filter(status__in=['pending', 'confirmed']).count()
        
        return format_html(
            '<small>🍽️ {} items | 📝 {} reviews | 📅 {} bookings</small>',
            menu_count, review_count, reservation_count
        )
    stats_display.short_description = 'Stats'
    
    def owner_display(self, obj):
        if obj.owner:
            return format_html('<span style="color: #16a34a;">✓ {}</span>', obj.owner.username)
        return format_html('<span style="color: #6b7280;">Unassigned</span>')
    owner_display.short_description = 'Owner'
    
    @admin.action(description='✅ Activate selected vendors')
    def activate_vendors(self, request, queryset):
        updated = queryset.update(is_active=True)
        self.message_user(request, f"Activated {updated} vendor(s)", messages.SUCCESS)
    
    @admin.action(description='❌ Deactivate selected vendors')
    def deactivate_vendors(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(request, f"Deactivated {updated} vendor(s)", messages.SUCCESS)

