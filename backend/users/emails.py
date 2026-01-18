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


def send_approval_email(user, assigned_business=None):
    """
    Send approval notification email to a newly approved user.
    
    Args:
        user: User object that was approved
        assigned_business: Name of the business assigned to the user (optional)
        
    Returns:
        bool: True if email sent successfully, False otherwise
    """
    try:
        subject = '✅ Your Kedah Tourism Account Has Been Approved!'
        
        # Determine role display name
        role_display = {
            'vendor': 'Restaurant Owner',
            'stay_owner': 'Hotel/Stay Owner',
            'place_owner': 'Attraction/Place Owner',
            'admin': 'Administrator'
        }.get(user.role, user.role)
        
        # Business assignment message
        business_message = ''
        if assigned_business:
            # Customize message based on role
            portal_name = 'vendor portal' if user.role == 'vendor' else 'stay owner portal' if user.role == 'stay_owner' else 'place owner portal'
            business_message = f"""
            <div style="background: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; border-radius: 6px; margin: 20px 0;">
                <strong>🏢 Your Business:</strong> You have been assigned as the owner of <strong>{assigned_business}</strong>.<br>
                You can now manage all aspects of your business through the {portal_name}.
            </div>
            """
        
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
                
                {business_message}
                
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
            'place_owner': 'Attraction/Place Owner',
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


def send_password_reset_email(user, token, frontend_url):
    """
    Send password reset email with secure link.
    
    Args:
        user: User object requesting password reset
        token: The password reset token
        frontend_url: Base URL for the frontend app
        
    Returns:
        bool: True if email sent successfully, False otherwise
    """
    try:
        reset_link = f"{frontend_url}/reset-password?token={token}"
        subject = '🔐 Reset Your Kedah Tourism Password'
        
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
                    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
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
                    border-radius: 0 0 10px 10px;
                }}
                .button {{
                    display: inline-block;
                    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
                    color: white !important;
                    padding: 15px 30px;
                    text-decoration: none;
                    border-radius: 8px;
                    font-weight: bold;
                    margin: 20px 0;
                }}
                .warning {{
                    background: #fef3c7;
                    border-left: 4px solid #f59e0b;
                    padding: 15px;
                    margin: 20px 0;
                    border-radius: 4px;
                }}
                .footer {{
                    text-align: center;
                    padding: 20px;
                    color: #6b7280;
                    font-size: 12px;
                }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>🔐 Password Reset Request</h1>
            </div>
            <div class="content">
                <p>Hi <strong>{user.first_name or user.username}</strong>,</p>
                
                <p>We received a request to reset your password for your Kedah Tourism account.</p>
                
                <p style="text-align: center;">
                    <a href="{reset_link}" class="button">Reset My Password</a>
                </p>
                
                <p>Or copy and paste this link into your browser:</p>
                <p style="word-break: break-all; background: #f3f4f6; padding: 10px; border-radius: 4px; font-size: 12px;">
                    {reset_link}
                </p>
                
                <div class="warning">
                    <strong>⚠️ Important:</strong>
                    <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                        <li>This link will expire in <strong>1 hour</strong></li>
                        <li>If you didn't request this reset, please ignore this email</li>
                        <li>Your password won't change until you create a new one</li>
                    </ul>
                </div>
                
                <p>If you need help, contact us at <a href="mailto:support@kedahtourism.my">support@kedahtourism.my</a></p>
            </div>
            <div class="footer">
                <p>© 2025 Kedah Tourism Analytics. All rights reserved.</p>
            </div>
        </body>
        </html>
        """
        
        plain_message = f"""
        Password Reset Request
        
        Hi {user.first_name or user.username},
        
        We received a request to reset your password for your Kedah Tourism account.
        
        Click this link to reset your password:
        {reset_link}
        
        This link will expire in 1 hour.
        
        If you didn't request this reset, please ignore this email.
        
        © 2025 Kedah Tourism Analytics
        """
        
        send_mail(
            subject=subject,
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            html_message=html_message,
            fail_silently=False,
        )
        
        logger.info(f"Password reset email sent successfully to {user.email}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send password reset email to {user.email}: {str(e)}")
        return False


def send_registration_pending_email(user):
    """
    Send registration confirmation email to a newly registered user.
    Confirms email address validity and explains the pending approval process.
    
    Args:
        user: User object that was just registered
        
    Returns:
        bool: True if email sent successfully, False otherwise
    """
    try:
        subject = 'Registration Received – Account Pending Verification'
        
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
                    background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
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
                    color: #3b82f6;
                }}
                .pending-notice {{
                    background: #fef3c7;
                    padding: 20px;
                    border-left: 4px solid #f59e0b;
                    border-radius: 6px;
                    margin: 20px 0;
                }}
                .next-steps {{
                    background: #eff6ff;
                    padding: 20px;
                    border-left: 4px solid #3b82f6;
                    margin: 20px 0;
                }}
                .next-steps ul {{
                    margin: 10px 0;
                    padding-left: 20px;
                }}
                .next-steps li {{
                    margin: 8px 0;
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
                <h1>📬 Registration Received</h1>
            </div>
            
            <div class="content">
                <p>Hello <strong>{user.first_name or user.username}</strong>,</p>
                
                <p>Thank you for registering on the <strong>Kedah Tourism Analytics</strong> platform.</p>
                
                <p>We have successfully received your application using this email address.</p>
                
                <div class="info-box">
                    <p><strong>Your Registration Details:</strong></p>
                    <p>
                        <span class="emoji">👤</span> <strong>Username:</strong> {user.username}<br>
                        <span class="emoji">📧</span> <strong>Email:</strong> {user.email}<br>
                        <span class="emoji">🏢</span> <strong>Role:</strong> {role_display}
                    </p>
                </div>
                
                <div class="pending-notice">
                    <p><strong><span class="emoji">⏳</span> Account Under Review</strong></p>
                    <p>Your account is currently under review by our team. This verification process helps us ensure the quality and security of our platform.</p>
                </div>
                
                <div class="next-steps">
                    <p><strong><span class="emoji">📋</span> What Happens Next:</strong></p>
                    <ul>
                        <li><span class="emoji">1️⃣</span> Our team will review your registration details</li>
                        <li><span class="emoji">2️⃣</span> Verification typically takes 1-2 business days</li>
                        <li><span class="emoji">3️⃣</span> You will receive another email once your account is approved or if we need more information</li>
                    </ul>
                </div>
                
                <p>Please wait while we review your information. We appreciate your patience!</p>
                
                <p style="margin-top: 30px;">Thank you for your interest in joining the Kedah Tourism platform.</p>
                
                <p>Best regards,<br>
                <strong>The Kedah Tourism Team</strong></p>
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
        Registration Received – Account Pending Verification
        
        Hello {user.first_name or user.username},
        
        Thank you for registering on the Kedah Tourism Analytics platform.
        We have successfully received your application using this email address.
        
        Your Registration Details:
        - Username: {user.username}
        - Email: {user.email}
        - Role: {role_display}
        
        Account Under Review
        --------------------
        Your account is currently under review by our team. 
        This verification process helps us ensure the quality and security of our platform.
        
        What Happens Next:
        1. Our team will review your registration details
        2. Verification typically takes 1-2 business days
        3. You will receive another email once your account is approved or if we need more information
        
        Please wait while we review your information. We appreciate your patience!
        
        Thank you for your interest in joining the Kedah Tourism platform.
        
        Best regards,
        The Kedah Tourism Team
        
        ---
        Need Help?
        Phone: +604-123-4567
        Email: support@kedahtourism.my
        
        © 2025 Kedah Tourism Analytics
        """
        
        send_mail(
            subject=subject,
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            html_message=html_message,
            fail_silently=False,
        )
        
        logger.info(f"Registration pending email sent successfully to {user.email}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send registration pending email to {user.email}: {str(e)}")
        return False