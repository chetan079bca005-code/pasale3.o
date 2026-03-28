from celery import shared_task
from django.core.mail import EmailMessage
from django.conf import settings
import logging

logger = logging.getLogger(__name__)


@shared_task
def send_otp_email(email, otp):
    """
    Send OTP email asynchronously via Celery.
    Uses the configured EMAIL_HOST_USER from settings (.env file).
    """
    try:
        subject = 'Your OTP Code'
        text_message = f'Your OTP code is: {otp}\n\nThis code will expire in 5 minutes.'
        html_message = f'''
        <html>
            <body>
                <p>Your OTP code is: <strong style="font-size: 24px; color: #2563eb;">{otp}</strong></p>
                <p>This code will expire in 5 minutes.</p>
                <p>If you did not request this code, please ignore this email.</p>
            </body>
        </html>
        '''
        
        # Use configured email from settings (from .env file)
        email_from = settings.EMAIL_HOST_USER
        recipient_list = [email]

        mail = EmailMessage(
            subject=subject,
            body=text_message,
            from_email=email_from,
            to=recipient_list,
        )
        mail.attach_alternative(html_message, "text/html")
        mail.send(fail_silently=False)
        
        logger.info(f"OTP email sent successfully to {email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send OTP email to {email}: {str(e)}")
        raise
        return False
