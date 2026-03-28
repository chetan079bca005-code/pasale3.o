#!/usr/bin/env python
"""
Quick test script to verify Gmail/Email configuration
Run this to debug email sending issues
"""

import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.conf import settings
from django.core.mail import EmailMessage

def print_section(title):
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}\n")

def check_configuration():
    print_section("EMAIL CONFIGURATION CHECK")
    
    print(f"✓ EMAIL_BACKEND: {settings.EMAIL_BACKEND}")
    print(f"✓ EMAIL_HOST: {settings.EMAIL_HOST}")
    print(f"✓ EMAIL_PORT: {settings.EMAIL_PORT}")
    print(f"✓ EMAIL_USE_TLS: {settings.EMAIL_USE_TLS}")
    print(f"✓ EMAIL_HOST_USER: {settings.EMAIL_HOST_USER}")
    
    if settings.EMAIL_HOST_PASSWORD:
        password_masked = settings.EMAIL_HOST_PASSWORD[:4] + '*' * (len(settings.EMAIL_HOST_PASSWORD) - 8) + settings.EMAIL_HOST_PASSWORD[-4:]
        print(f"✓ EMAIL_HOST_PASSWORD: {password_masked}")
    else:
        print(f"❌ EMAIL_HOST_PASSWORD: NOT SET!")
        return False
    
    return True

def test_email_sending():
    print_section("SENDING TEST EMAIL")
    
    test_recipient = settings.EMAIL_HOST_USER  # Send to self
    
    print(f"Sending test email to: {test_recipient}\n")
    
    try:
        mail = EmailMessage(
            subject='🧪 Pasale OTP System Test Email',
            body='This is a test email from the Pasale system.\n\nIf you received this, the email configuration is working correctly!',
            from_email=settings.EMAIL_HOST_USER,
            to=[test_recipient],
        )
        
        html_message = '''
        <html>
            <body style="font-family: Arial, sans-serif;">
                <div style="max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #2563eb;">🧪 Pasale OTP System Test</h2>
                    <p>If you received this email, the configuration is working correctly!</p>
                    <div style="background-color: #f0f9ff; border-left: 4px solid #2563eb; padding: 15px; margin: 20px 0;">
                        <p><strong>Test Status:</strong> ✅ SUCCESS</p>
                        <p><strong>From:</strong> {}</p>
                        <p><strong>Timestamp:</strong> {}</p>
                    </div>
                </div>
            </body>
        </html>
        '''.format(settings.EMAIL_HOST_USER, __import__('datetime').datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
        
        mail.attach_alternative(html_message, "text/html")
        mail.send(fail_silently=False)
        
        print("✅ TEST EMAIL SENT SUCCESSFULLY!")
        print("\n📧 Check your Gmail inbox (and spam folder) for the test email.")
        print("   If you received it, your email configuration is working!\n")
        return True
        
    except Exception as e:
        print(f"❌ FAILED TO SEND EMAIL!")
        print(f"\nError Details:")
        print(f"  Type: {type(e).__name__}")
        print(f"  Message: {str(e)}\n")
        return False

def test_otp_function():
    print_section("TESTING OTP EMAIL FUNCTION")
    
    try:
        from api.tasks import send_otp_email_sync
        
        test_email = settings.EMAIL_HOST_USER
        test_otp = "123456"
        
        print(f"Sending OTP '{test_otp}' to: {test_email}\n")
        
        result = send_otp_email_sync(test_email, test_otp)
        
        if result:
            print("✅ OTP EMAIL SENT SUCCESSFULLY!")
            print("\n📧 Check your Gmail for an OTP test email.\n")
            return True
        else:
            print("❌ OTP EMAIL FAILED!")
            print("\n❌ Check the error logs above.\n")
            return False
            
    except Exception as e:
        print(f"❌ ERROR TESTING OTP FUNCTION!")
        print(f"  {type(e).__name__}: {str(e)}\n")
        return False

def main():
    print("\n")
    print("╔" + "="*58 + "╗")
    print("║" + " "*58 + "║")
    print("║" + "  PASALE OTP EMAIL CONFIGURATION TEST SCRIPT".center(58) + "║")
    print("║" + " "*58 + "║")
    print("╚" + "="*58 + "╝")
    
    # Check configuration
    config_ok = check_configuration()
    
    if not config_ok:
        print("\n❌ EMAIL CONFIGURATION INCOMPLETE!")
        print("\n⚠️  Please set EMAIL_HOST_PASSWORD in .env file")
        print("   Get an App Password from: https://myaccount.google.com/apppasswords")
        return False
    
    # Ask user which test to run
    print_section("SELECT TEST TO RUN")
    
    print("1. Send test email to yourself")
    print("2. Test OTP function")
    print("3. Run both tests")
    print("4. Exit\n")
    
    choice = input("Enter choice (1-4): ").strip()
    
    results = {}
    
    if choice in ['1', '3']:
        results['test_email'] = test_email_sending()
    
    if choice in ['2', '3']:
        results['test_otp'] = test_otp_function()
    
    if choice == '4':
        print("Exiting...\n")
        return True
    
    # Summary
    print_section("TEST SUMMARY")
    
    if 'test_email' in results:
        status = "✅ PASSED" if results['test_email'] else "❌ FAILED"
        print(f"Test Email: {status}")
    
    if 'test_otp' in results:
        status = "✅ PASSED" if results['test_otp'] else "❌ FAILED"
        print(f"OTP Function: {status}")
    
    all_passed = all(results.values()) if results else False
    
    if all_passed:
        print("\n🎉 ALL TESTS PASSED! Your email configuration is working correctly.")
        print("\nYou can now:")
        print("  1. Sign up a new user")
        print("  2. Check your Gmail for the OTP")
        print("  3. Verify the OTP to complete signup\n")
    elif results:
        print("\n⚠️  Some tests failed. Check the error messages above.")
        print("\nCommon issues:")
        print("  1. Wrong Gmail password - Use App Password instead")
        print("  2. 2FA not enabled - Enable it at https://myaccount.google.com/security")
        print("  3. Less Secure Apps disabled - Enable at https://myaccount.google.com/lesssecureapps\n")
    
    return all_passed

if __name__ == '__main__':
    try:
        success = main()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n\nTest cancelled by user.\n")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}\n")
        sys.exit(1)
