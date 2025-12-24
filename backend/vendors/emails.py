# backend/vendors/emails.py
from django.core.mail import send_mail
from django.conf import settings


def send_reservation_confirmation(reservation):
    """
    Send confirmation email when a reservation is made
    """
    subject = f"Reservation Confirmed - {reservation.vendor.name}"
    
    html_message = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
            .content {{ background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }}
            .reservation-box {{ background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f97316; }}
            .detail-row {{ display: flex; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }}
            .detail-label {{ font-weight: bold; width: 140px; color: #6b7280; }}
            .detail-value {{ color: #1f2937; }}
            .footer {{ text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1 style="margin: 0; font-size: 28px;">🍽️ Reservation Confirmed!</h1>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">Your table is reserved</p>
            </div>
            
            <div class="content">
                <p style="font-size: 18px;">Hi {reservation.customer_name},</p>
                
                <p style="font-size: 16px;">
                    Your reservation at <strong>{reservation.vendor.name}</strong> has been confirmed!
                </p>
                
                <div class="reservation-box">
                    <h2 style="margin-top: 0; color: #f97316;">📅 Reservation Details</h2>
                    
                    <div class="detail-row">
                        <div class="detail-label">Restaurant:</div>
                        <div class="detail-value">{reservation.vendor.name}</div>
                    </div>
                    
                    <div class="detail-row">
                        <div class="detail-label">Date:</div>
                        <div class="detail-value">{reservation.date.strftime('%A, %B %d, %Y')}</div>
                    </div>
                    
                    <div class="detail-row">
                        <div class="detail-label">Time:</div>
                        <div class="detail-value">{reservation.time.strftime('%I:%M %p')}</div>
                    </div>
                    
                    <div class="detail-row">
                        <div class="detail-label">Party Size:</div>
                        <div class="detail-value">{reservation.party_size} guests</div>
                    </div>
                    
                    <div class="detail-row">
                        <div class="detail-label">Location:</div>
                        <div class="detail-value">{reservation.vendor.address or reservation.vendor.city}</div>
                    </div>
                    
                    {f'<div class="detail-row" style="border: none;"><div class="detail-label">Special Requests:</div><div class="detail-value">{reservation.special_requests}</div></div>' if reservation.special_requests else ''}
                </div>
                
                <p style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 6px;">
                    <strong>⏰ Important:</strong> Please arrive on time. If you need to cancel or modify, 
                    please contact the restaurant directly.
                </p>
                
                {f'<p style="color: #4b5563;"><strong>📞 Contact:</strong> {reservation.vendor.contact_phone}</p>' if reservation.vendor.contact_phone else ''}
                
                <p style="margin-top: 30px;">
                    We look forward to serving you!<br>
                    <em>The {reservation.vendor.name} Team</em>
                </p>
                
                <div class="footer">
                    <p>© 2025 Kedah Tourism Analytics Dashboard</p>
                </div>
            </div>
        </div>
    </body>
    </html>
    """
    
    plain_message = f"""
    Reservation Confirmed!
    
    Hi {reservation.customer_name},
    
    Your reservation at {reservation.vendor.name} has been confirmed!
    
    RESERVATION DETAILS:
    --------------------
    Restaurant: {reservation.vendor.name}
    Date: {reservation.date.strftime('%A, %B %d, %Y')}
    Time: {reservation.time.strftime('%I:%M %p')}
    Party Size: {reservation.party_size} guests
    Location: {reservation.vendor.address or reservation.vendor.city}
    {f'Special Requests: {reservation.special_requests}' if reservation.special_requests else ''}
    
    Important: Please arrive on time. If you need to cancel or modify, please contact the restaurant directly.
    {f'Contact: {reservation.vendor.contact_phone}' if reservation.vendor.contact_phone else ''}
    
    We look forward to serving you!
    The {reservation.vendor.name} Team
    """
    
    try:
        send_mail(
            subject=subject,
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[reservation.customer_email],
            html_message=html_message,
            fail_silently=False,
        )
        return True
    except Exception as e:
        print(f"❌ Failed to send reservation confirmation to {reservation.customer_email}: {e}")
        return False


def send_reservation_status_update(reservation, old_status):
    """
    Send email when reservation status changes
    """
    status_messages = {
        'confirmed': ('✅ Reservation Confirmed', 'Your reservation has been confirmed by the restaurant.'),
        'cancelled': ('❌ Reservation Cancelled', 'Unfortunately, your reservation has been cancelled.'),
        'completed': ('🎉 Thanks for Visiting!', 'Thank you for dining with us! We hope you enjoyed your experience.'),
    }
    
    if reservation.status not in status_messages:
        return False
    
    title, message = status_messages[reservation.status]
    subject = f"{title} - {reservation.vendor.name}"
    
    html_message = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: {'#16a34a' if reservation.status == 'confirmed' else '#dc2626' if reservation.status == 'cancelled' else '#3b82f6'}; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
            .content {{ background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }}
            .reservation-box {{ background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }}
            .footer {{ text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1 style="margin: 0; font-size: 28px;">{title}</h1>
            </div>
            
            <div class="content">
                <p style="font-size: 18px;">Hi {reservation.customer_name},</p>
                
                <p style="font-size: 16px;">{message}</p>
                
                <div class="reservation-box">
                    <p><strong>Restaurant:</strong> {reservation.vendor.name}</p>
                    <p><strong>Date:</strong> {reservation.date.strftime('%A, %B %d, %Y')}</p>
                    <p><strong>Time:</strong> {reservation.time.strftime('%I:%M %p')}</p>
                    <p><strong>Party Size:</strong> {reservation.party_size} guests</p>
                </div>
                
                {'<p style="background: #dbeafe; padding: 15px; border-radius: 6px;">We would love to hear about your experience! Please consider leaving a review.</p>' if reservation.status == 'completed' else ''}
                
                <div class="footer">
                    <p>© 2025 Kedah Tourism Analytics Dashboard</p>
                </div>
            </div>
        </div>
    </body>
    </html>
    """
    
    plain_message = f"""
    {title}
    
    Hi {reservation.customer_name},
    
    {message}
    
    Restaurant: {reservation.vendor.name}
    Date: {reservation.date.strftime('%A, %B %d, %Y')}
    Time: {reservation.time.strftime('%I:%M %p')}
    Party Size: {reservation.party_size} guests
    """
    
    try:
        send_mail(
            subject=subject,
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[reservation.customer_email],
            html_message=html_message,
            fail_silently=False,
        )
        return True
    except Exception as e:
        print(f"❌ Failed to send status update to {reservation.customer_email}: {e}")
        return False


def send_promotion_notification(promotion, customer_emails):
    """
    Send promotional email to customers
    """
    subject = f"🎉 Special Offer at {promotion.vendor.name}!"
    
    html_message = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
            .content {{ background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }}
            .promo-box {{ background: white; padding: 25px; border-radius: 8px; margin: 20px 0; text-align: center; border: 2px dashed #8b5cf6; }}
            .discount {{ font-size: 48px; font-weight: bold; color: #8b5cf6; }}
            .promo-code {{ background: #f3f4f6; padding: 10px 20px; border-radius: 6px; font-family: monospace; font-size: 18px; letter-spacing: 2px; }}
            .footer {{ text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1 style="margin: 0; font-size: 28px;">🎉 {promotion.title}</h1>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">at {promotion.vendor.name}</p>
            </div>
            
            <div class="content">
                <div class="promo-box">
                    {f'<div class="discount">{promotion.discount_percentage}% OFF</div>' if promotion.discount_percentage else ''}
                    {f'<div class="discount">RM{promotion.discount_amount} OFF</div>' if promotion.discount_amount else ''}
                    
                    <p style="font-size: 16px; color: #4b5563; margin: 15px 0;">{promotion.description}</p>
                    
                    {f'<p>Use code: <span class="promo-code">{promotion.promo_code}</span></p>' if promotion.promo_code else ''}
                    
                    <p style="color: #6b7280; font-size: 14px;">
                        Valid: {promotion.start_date.strftime('%B %d')} - {promotion.end_date.strftime('%B %d, %Y')}
                    </p>
                </div>
                
                <p style="text-align: center;">
                    <strong>📍 {promotion.vendor.name}</strong><br>
                    {promotion.vendor.address or promotion.vendor.city}
                </p>
                
                <div class="footer">
                    <p>Terms and conditions apply. © 2025 Kedah Tourism</p>
                </div>
            </div>
        </div>
    </body>
    </html>
    """
    
    plain_message = f"""
    🎉 {promotion.title} at {promotion.vendor.name}!
    
    {f'{promotion.discount_percentage}% OFF' if promotion.discount_percentage else ''}
    {f'RM{promotion.discount_amount} OFF' if promotion.discount_amount else ''}
    
    {promotion.description}
    
    {f'Use code: {promotion.promo_code}' if promotion.promo_code else ''}
    
    Valid: {promotion.start_date.strftime('%B %d')} - {promotion.end_date.strftime('%B %d, %Y')}
    
    📍 {promotion.vendor.name}
    {promotion.vendor.address or promotion.vendor.city}
    """
    
    sent_count = 0
    for email in customer_emails:
        try:
            send_mail(
                subject=subject,
                message=plain_message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
                html_message=html_message,
                fail_silently=False,
            )
            sent_count += 1
        except Exception as e:
            print(f"❌ Failed to send promotion to {email}: {e}")
    
    return sent_count


def send_review_thank_you(review):
    """
    Send thank you email after customer leaves a review
    """
    subject = f"Thank You for Your Review - {review.vendor.name}"
    
    stars = "⭐" * review.rating
    
    html_message = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
            .content {{ background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }}
            .review-box {{ background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }}
            .stars {{ font-size: 32px; }}
            .footer {{ text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1 style="margin: 0; font-size: 28px;">Thank You for Your Review!</h1>
            </div>
            
            <div class="content">
                <p style="font-size: 18px;">Hi {review.author_name},</p>
                
                <p>Thank you for taking the time to share your experience at <strong>{review.vendor.name}</strong>!</p>
                
                <div class="review-box">
                    <p class="stars">{stars}</p>
                    <p style="font-style: italic; color: #4b5563;">"{review.comment}"</p>
                </div>
                
                <p>Your feedback helps other diners make informed decisions and helps us improve our service.</p>
                
                <p style="margin-top: 30px;">
                    We hope to see you again soon!<br>
                    <em>The {review.vendor.name} Team</em>
                </p>
                
                <div class="footer">
                    <p>© 2025 Kedah Tourism Analytics Dashboard</p>
                </div>
            </div>
        </div>
    </body>
    </html>
    """
    
    # Note: We don't have reviewer email in the model, this would need to be added
    # For now, this is a placeholder
    return True
