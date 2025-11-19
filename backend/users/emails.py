"""
Email notification system for user approvals and rejections.
Sends professional HTML emails via SendGrid.
"""

from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings
from django.utils.html import strip_tags
import logging

logger = logging.getLogger(__name__)


def send_approval_email(user):
    """
    Send approval notification email to a newly approved user.
    
    Args:
        user: User object that was approved
        
    Returns:
        bool: True if email sent successfully, False otherwise
    """
    try:
        subject = '✅ Your Kedah Tourism Account Has Been Approved!'
        
        # Determine role display name
        role_display = {
            'vendor': 'Restaurant Owner',
            'stay_owner': 'Hotel/Stay Owner',
            'admin': 'Administrator'
        }.get(user.role, user.role)
        
        # HTML email content
        html_message = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body {{
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                }}
                .header {{
                    background: linear-gradient(135deg, #059669 0%, #10b981 100%);
                    color: white;
                    padding: 30px;
                    text-align: center;
                    border-radius: 10px 10px 0 0;
                }}
                .header h1 {{
                    margin: 0;
                    font-size: 24px;
                }}
                .content {{
                    background: #ffffff;
                    padding: 30px;
                    border: 1px solid #e5e7eb;
                    border-top: none;
                }}
                .info-box {{
                    background: #f3f4f6;
                    padding: 20px;
                    border-radius: 8px;
                    margin: 20px 0;
                }}
                .info-box strong {{
                    color: #059669;
                }}
                .benefits {{
                    background: #ecfdf5;
                    padding: 20px;
                    border-left: 4px solid #10b981;
                    margin: 20px 0;
                }}
                .benefits ul {{
                    margin: 10px 0;
                    padding-left: 20px;
                }}
                .benefits li {{
                    margin: 8px 0;
                }}
                .cta-button {{
                    display: inline-block;
                    background: linear-gradient(135deg, #059669 0%, #10b981 100%);
                    color: white !important;
                    padding: 15px 40px;
                    text-decoration: none;
                    border-radius: 8px;
                    font-weight: bold;
                    margin: 20px 0;
                    text-align: center;
                }}
                .footer {{
                    background: #1f2937;
                    color: #9ca3af;
                    padding: 20px 30px;
                    text-align: center;
                    border-radius: 0 0 10px 10px;
                    font-size: 14px;
                }}
                .footer strong {{
                    color: #ffffff;
                }}
                .emoji {{
                    font-size: 1.2em;
                }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>🎉 Congratulations! Your Account is Approved</h1>
            </div>
            
            <div class="content">
                <p>Dear <strong>{user.first_name or user.username}</strong>,</p>
                
                <p>Great news! Your Kedah Tourism business account has been <strong>approved</strong> and is now active.</p>
                
                <div class="info-box">
                    <p><strong>Account Details:</strong></p>
                    <p>
                        <span class="emoji">👤</span> <strong>Username:</strong> {user.username}<br>
                        <span class="emoji">📧</span> <strong>Email:</strong> {user.email}<br>
                        <span class="emoji">🏢</span> <strong>Role:</strong> {role_display}
                    </p>
                </div>
                
                <div class="benefits">
                    <p><strong class="emoji">✨ What You Can Do Now:</strong></p>
                    <ul>
                        <li><span class="emoji">✅</span> Login to your business dashboard</li>
                        <li><span class="emoji">📝</span> Manage your business profile and details</li>
                        <li><span class="emoji">📊</span> Access real-time analytics and insights</li>
                        <li><span class="emoji">👥</span> Reach 10,000+ monthly visitors across Kedah</li>
                        <li><span class="emoji">⭐</span> Receive and respond to customer reviews</li>
                    </ul>
                </div>
                
                <center>
                    <a href="{settings.FRONTEND_URL}/login" class="cta-button">
                        🚀 Login to Your Dashboard
                    </a>
                </center>
                
                <p style="margin-top: 30px;">Welcome to the Kedah Tourism family! We're excited to have you on board.</p>
            </div>
            
            <div class="footer">
                <p><strong>Need Help?</strong></p>
                <p>
                    <span class="emoji">📞</span> Phone: +604-123-4567<br>
                    <span class="emoji">📧</span> Email: support@kedahtourism.my
                </p>
                <p style="margin-top: 15px; font-size: 12px;">
                    © 2025 Kedah Tourism Analytics. All rights reserved.
                </p>
            </div>
        </body>
        </html>
        """
        
        # Plain text version (fallback for email clients that don't support HTML)
        plain_message = f"""
        Congratulations! Your Account is Approved
        
        Dear {user.first_name or user.username},
        
        Great news! Your Kedah Tourism business account has been approved and is now active.
        
        Account Details:
        - Username: {user.username}
        - Email: {user.email}
        - Role: {role_display}
        
        What You Can Do Now:
        ✅ Login to your business dashboard
        📝 Manage your business profile and details
        📊 Access real-time analytics and insights
        👥 Reach 10,000+ monthly visitors across Kedah
        ⭐ Receive and respond to customer reviews
        
        Login here: {settings.FRONTEND_URL}/login
        
        Welcome to the Kedah Tourism family! We're excited to have you on board.
        
        Need Help?
        Phone: +604-123-4567
        Email: support@kedahtourism.my
        
        © 2025 Kedah Tourism Analytics. All rights reserved.
        """
        
        # Send email
        send_mail(
            subject=subject,
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            html_message=html_message,
            fail_silently=False,
        )
        
        logger.info(f"Approval email sent successfully to {user.email}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send approval email to {user.email}: {str(e)}")
        return False


def send_rejection_email(user, reason=None):
    """
    Send rejection notification email to a user whose account was rejected.
    
    Args:
        user: User object that was rejected
        reason: Optional string explaining why the account was rejected
        
    Returns:
        bool: True if email sent successfully, False otherwise
    """
    try:
        subject = '❌ Your Kedah Tourism Account Application Status'
        
        # Determine role display name
        role_display = {
            'vendor': 'Restaurant Owner',
            'stay_owner': 'Hotel/Stay Owner',
            'admin': 'Administrator'
        }.get(user.role, user.role)
        
        # Build reason section if provided
        reason_section = ''
        if reason and reason.strip():
            reason_section = f"""
            <div class="info-box" style="background: #fee2e2; border-left: 4px solid #ef4444;">
                <p><strong>Reason:</strong></p>
                <p>{reason}</p>
            </div>
            """
            reason_text = f"\nReason: {reason}\n"
        else:
            reason_text = ""
        
        # HTML email content
        html_message = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body {{
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                }}
                .header {{
                    background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
                    color: white;
                    padding: 30px;
                    text-align: center;
                    border-radius: 10px 10px 0 0;
                }}
                .header h1 {{
                    margin: 0;
                    font-size: 24px;
                }}
                .content {{
                    background: #ffffff;
                    padding: 30px;
                    border: 1px solid #e5e7eb;
                    border-top: none;
                }}
                .info-box {{
                    background: #f3f4f6;
                    padding: 20px;
                    border-radius: 8px;
                    margin: 20px 0;
                }}
                .info-box strong {{
                    color: #dc2626;
                }}
                .footer {{
                    background: #1f2937;
                    color: #9ca3af;
                    padding: 20px 30px;
                    text-align: center;
                    border-radius: 0 0 10px 10px;
                    font-size: 14px;
                }}
                .footer strong {{
                    color: #ffffff;
                }}
                .emoji {{
                    font-size: 1.2em;
                }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Account Application Status</h1>
            </div>
            
            <div class="content">
                <p>Dear <strong>{user.first_name or user.username}</strong>,</p>
                
                <p>Thank you for your interest in joining Kedah Tourism as a business partner.</p>
                
                <p>Unfortunately, we are <strong>unable to approve</strong> your account application at this time.</p>
                
                <div class="info-box">
                    <p><strong>Application Details:</strong></p>
                    <p>
                        <span class="emoji">👤</span> <strong>Username:</strong> {user.username}<br>
                        <span class="emoji">📧</span> <strong>Email:</strong> {user.email}<br>
                        <span class="emoji">🏢</span> <strong>Applied Role:</strong> {role_display}<br>
                        <span class="emoji">📅</span> <strong>Application Date:</strong> {user.date_joined.strftime('%B %d, %Y')}
                    </p>
                </div>
                
                {reason_section}
                
                <p>If you believe this is a mistake or have questions about this decision, please don't hesitate to contact our support team:</p>
                
                <div class="info-box" style="background: #ecfdf5;">
                    <p style="margin: 0;">
                        <span class="emoji">📞</span> <strong>Phone:</strong> +604-123-4567<br>
                        <span class="emoji">📧</span> <strong>Email:</strong> support@kedahtourism.my
                    </p>
                </div>
                
                <p>You are welcome to submit a new application after addressing any issues mentioned above.</p>
                
                <p>Thank you for your understanding.</p>
            </div>
            
            <div class="footer">
                <p style="margin-top: 15px; font-size: 12px;">
                    © 2025 Kedah Tourism Analytics. All rights reserved.
                </p>
            </div>
        </body>
        </html>
        """
        
        # Plain text version
        plain_message = f"""
        Account Application Status
        
        Dear {user.first_name or user.username},
        
        Thank you for your interest in joining Kedah Tourism as a business partner.
        
        Unfortunately, we are unable to approve your account application at this time.
        
        Application Details:
        - Username: {user.username}
        - Email: {user.email}
        - Applied Role: {role_display}
        - Application Date: {user.date_joined.strftime('%B %d, %Y')}
        {reason_text}
        If you believe this is a mistake or have questions about this decision, please contact us:
        
        Phone: +604-123-4567
        Email: support@kedahtourism.my
        
        You are welcome to submit a new application after addressing any issues.
        
        Thank you for your understanding.
        
        © 2025 Kedah Tourism Analytics. All rights reserved.
        """
        
        # Send email
        send_mail(
            subject=subject,
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            html_message=html_message,
            fail_silently=False,
        )
        
        logger.info(f"Rejection email sent successfully to {user.email}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send rejection email to {user.email}: {str(e)}")
        return False
