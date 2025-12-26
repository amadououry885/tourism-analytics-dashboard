# backend/events/emails.py
from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags


def send_registration_confirmation(registration, event, is_pending=False):
    """
    Send a thank you email when someone registers for an event
    If is_pending=True, send a "pending approval" message instead
    """
    if is_pending:
        subject = f"Registration Pending Approval - {event.title}"
        header_title = "⏳ Registration Received"
        header_subtitle = "Your registration is pending approval"
        main_message = f"""
                    Thank you for your interest in <strong>{event.title}</strong>! 
                    We have received your registration and it is currently pending approval from our team.
                </p>
                
                <p style="font-size: 16px; color: #4b5563;">
                    You will receive a confirmation email once your registration has been reviewed. 
                    This usually takes 1-2 business days.
        """
        footer_note = "Your registration is pending review. You will be notified once it's approved."
    else:
        subject = f"Thank You for Registering - {event.title}"
        header_title = "🎉 Registration Confirmed!"
        header_subtitle = "Thank you for registering"
        main_message = f"""
                    Thank you for registering for <strong>{event.title}</strong>! 
                    We're excited to have you join us. Here are your event details:
        """
        footer_note = "This is an automated confirmation email. Please do not reply to this message."
    
    # Create HTML email content
    html_message = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
            .content {{ background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }}
            .event-details {{ background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }}
            .detail-row {{ display: flex; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }}
            .detail-label {{ font-weight: bold; width: 140px; color: #6b7280; }}
            .detail-value {{ color: #1f2937; }}
            .footer {{ text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; }}
            .button {{ display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1 style="margin: 0; font-size: 28px;">{header_title}</h1>
                <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">{header_subtitle}</p>
            </div>
            
            <div class="content">
                <p style="font-size: 18px; color: #1f2937;">Hi {registration.contact_name},</p>
                
                <p style="font-size: 16px; color: #4b5563;">
                    {main_message}
                </p>
                
                <div class="event-details">
                    <h2 style="margin-top: 0; color: #667eea; font-size: 20px;">📅 Event Details</h2>
                    
                    <div class="detail-row">
                        <div class="detail-label">Event:</div>
                        <div class="detail-value">{event.title}</div>
                    </div>
                    
                    <div class="detail-row">
                        <div class="detail-label">Date:</div>
                        <div class="detail-value">{event.start_date.strftime('%A, %B %d, %Y')}</div>
                    </div>
                    
                    <div class="detail-row">
                        <div class="detail-label">Time:</div>
                        <div class="detail-value">{event.start_date.strftime('%I:%M %p')}</div>
                    </div>
                    
                    <div class="detail-row">
                        <div class="detail-label">Location:</div>
                        <div class="detail-value">{event.location_name}</div>
                    </div>
                    
                    <div class="detail-row" style="border: none;">
                        <div class="detail-label">Your Name:</div>
                        <div class="detail-value">{registration.contact_name}</div>
                    </div>
                </div>
                
                {'<p style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0;"><strong>⏰ Important:</strong> Please arrive 15 minutes early. We\'ll send you a reminder closer to the event date.</p>' if not is_pending else '<p style="background: #dbeafe; border-left: 4px solid #3b82f6; padding: 15px; border-radius: 6px; margin: 20px 0;"><strong>📧 Next Steps:</strong> Watch your email for approval confirmation. If approved, we\'ll send you full event details and instructions.</p>'}
                
                <p style="font-size: 16px; color: #4b5563;">
                    If you have any questions or need to make changes to your registration, 
                    please don't hesitate to contact us.
                </p>
                
                <p style="font-size: 16px; color: #1f2937; margin-top: 30px;">
                    <strong>{'See you there! 🎊' if not is_pending else 'Thank you for your patience! ⏳'}</strong><br>
                    <em>The Kedah Tourism Team</em>
                </p>
                
                <div class="footer">
                    <p>{footer_note}</p>
                    <p>© 2025 Kedah Tourism Analytics Dashboard. All rights reserved.</p>
                </div>
            </div>
        </div>
    </body>
    </html>
    """
    
    # Plain text version
    plain_message = f"""
    Thank You for Registering!
    
    Hi {registration.contact_name},
    
    Thank you for registering for {event.title}! We're excited to have you join us.
    
    EVENT DETAILS:
    --------------
    Event: {event.title}
    Date: {event.start_date.strftime('%A, %B %d, %Y')}
    Time: {event.start_date.strftime('%I:%M %p')}
    Location: {event.location_name}
    Your Name: {registration.contact_name}
    
    Important: Please arrive 15 minutes early. We'll send you a reminder closer to the event date.
    
    If you have any questions or need to make changes to your registration, please don't hesitate to contact us.
    
    See you there!
    The Kedah Tourism Team
    
    ---
    This is an automated confirmation email.
    © 2025 Kedah Tourism Analytics Dashboard
    """
    
    try:
        send_mail(
            subject=subject,
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[registration.contact_email],
            html_message=html_message,
            fail_silently=False,
        )
        return True
    except Exception as e:
        print(f"❌ Failed to send confirmation email to {registration.contact_email}: {e}")
        return False


def send_event_reminder(registrations, event, custom_message=None):
    """
    Send reminder emails to multiple attendees
    """
    sent_count = 0
    failed_count = 0
    
    for registration in registrations:
        if not registration.contact_email:
            continue
            
        subject = f"Reminder: {event.title} is Coming Up!"
        
        # Use custom message or default
        if custom_message:
            message_body = custom_message
        else:
            message_body = f"This is a friendly reminder about the upcoming event!"
        
        html_message = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                .content {{ background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }}
                .event-box {{ background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #10b981; }}
                .footer {{ text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1 style="margin: 0; font-size: 28px;">🔔 Event Reminder</h1>
                    <p style="margin: 10px 0 0 0; opacity: 0.9;">Don't forget about your upcoming event!</p>
                </div>
                
                <div class="content">
                    <p style="font-size: 18px;">Hi {registration.contact_name},</p>
                    
                    <p style="font-size: 16px;">{message_body}</p>
                    
                    <div class="event-box">
                        <h2 style="color: #10b981; margin-top: 0;">📅 {event.title}</h2>
                        <p><strong>Date:</strong> {event.start_date.strftime('%A, %B %d, %Y')}</p>
                        <p><strong>Time:</strong> {event.start_date.strftime('%I:%M %p')}</p>
                        <p><strong>Location:</strong> {event.location_name}</p>
                    </div>
                    
                    <p style="background: #dbeafe; padding: 15px; border-radius: 6px; border-left: 4px solid #3b82f6;">
                        <strong>💡 Tip:</strong> Arrive 15 minutes early to ensure you don't miss anything!
                    </p>
                    
                    <p style="margin-top: 30px;">
                        We look forward to seeing you there!<br>
                        <em>The Kedah Tourism Team</em>
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
        Event Reminder
        
        Hi {registration.contact_name},
        
        {message_body}
        
        EVENT DETAILS:
        {event.title}
        Date: {event.start_date.strftime('%A, %B %d, %Y')}
        Time: {event.start_date.strftime('%I:%M %p')}
        Location: {event.location_name}
        
        We look forward to seeing you there!
        The Kedah Tourism Team
        """
        
        try:
            send_mail(
                subject=subject,
                message=plain_message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[registration.contact_email],
                html_message=html_message,
                fail_silently=False,
            )
            sent_count += 1
            print(f"✅ Reminder sent to {registration.contact_email}")
        except Exception as e:
            failed_count += 1
            print(f"❌ Failed to send reminder to {registration.contact_email}: {e}")
    
    return sent_count, failed_count


def send_approval_email(registration, event):
    """
    Send email when registration is approved
    """
    subject = f"✅ Registration Approved - {event.title}"
    
    html_message = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
            .content {{ background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }}
            .event-details {{ background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; }}
            .footer {{ text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1 style="margin: 0; font-size: 28px;">✅ Registration Approved!</h1>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">You're confirmed for the event</p>
            </div>
            
            <div class="content">
                <p style="font-size: 18px;">Hi {registration.contact_name},</p>
                
                <p style="font-size: 16px; color: #059669;">
                    <strong>Great news!</strong> Your registration for <strong>{event.title}</strong> has been approved! 
                    We're excited to have you join us.
                </p>
                
                <div class="event-details">
                    <h2 style="color: #10b981; margin-top: 0;">📅 Event Details</h2>
                    <p><strong>Event:</strong> {event.title}</p>
                    <p><strong>Date:</strong> {event.start_date.strftime('%A, %B %d, %Y')}</p>
                    <p><strong>Time:</strong> {event.start_date.strftime('%I:%M %p')}</p>
                    <p><strong>Location:</strong> {event.location_name}</p>
                </div>
                
                <p style="background: #fef3c7; padding: 15px; border-radius: 6px; border-left: 4px solid #f59e0b;">
                    <strong>⏰ Important:</strong> Please arrive 15 minutes early. We'll send you a reminder closer to the event date.
                </p>
                
                <p style="margin-top: 30px;">
                    See you there!<br>
                    <em>The Kedah Tourism Team</em>
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
    Registration Approved!
    
    Hi {registration.contact_name},
    
    Great news! Your registration for {event.title} has been approved!
    
    EVENT DETAILS:
    Event: {event.title}
    Date: {event.start_date.strftime('%A, %B %d, %Y')}
    Time: {event.start_date.strftime('%I:%M %p')}
    Location: {event.location_name}
    
    Please arrive 15 minutes early.
    
    See you there!
    The Kedah Tourism Team
    """
    
    try:
        send_mail(
            subject=subject,
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[registration.contact_email],
            html_message=html_message,
            fail_silently=False,
        )
        return True
    except Exception as e:
        print(f"❌ Failed to send approval email to {registration.contact_email}: {e}")
        return False


def send_rejection_email(registration, event, reason):
    """
    Send email when registration is rejected
    """
    subject = f"Registration Update - {event.title}"
    
    html_message = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
            .content {{ background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }}
            .footer {{ text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1 style="margin: 0; font-size: 28px;">Registration Update</h1>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">{event.title}</p>
            </div>
            
            <div class="content">
                <p style="font-size: 18px;">Hi {registration.contact_name},</p>
                
                <p style="font-size: 16px;">
                    Thank you for your interest in <strong>{event.title}</strong>. 
                </p>
                
                <p style="background: #fee2e2; padding: 15px; border-radius: 6px; border-left: 4px solid #ef4444;">
                    {reason}
                </p>
                
                <p style="font-size: 16px;">
                    We appreciate your interest and hope you'll consider joining us for future events.
                    Please check our events page for other upcoming opportunities.
                </p>
                
                <p style="margin-top: 30px;">
                    Best regards,<br>
                    <em>The Kedah Tourism Team</em>
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
    Registration Update - {event.title}
    
    Hi {registration.contact_name},
    
    Thank you for your interest in {event.title}.
    
    {reason}
    
    We appreciate your interest and hope you'll consider joining us for future events.
    
    Best regards,
    The Kedah Tourism Team
    """
    
    try:
        send_mail(
            subject=subject,
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[registration.contact_email],
            html_message=html_message,
            fail_silently=False,
        )
        return True
    except Exception as e:
        print(f"❌ Failed to send rejection email to {registration.contact_email}: {e}")
        return False
