# OTP Email Not Sending - Diagnostic & Solution

## Root Causes Identified:

### 1. ❌ Celery Worker Not Running
- The signup view calls `send_otp_email.delay()` which is async via Celery
- **If Celery worker is not running**, the task stays in Redis queue and never executes
- No email is sent because the task is never processed

### 2. ❌ Redis Not Running
- Celery requires Redis as a message broker
- Without Redis, Celery cannot queue or process tasks
- Check if Redis is running on `localhost:6379`

### 3. ⚠️ Email Sender Mismatch in tasks.py
- Line 16 in `tasks.py` has hardcoded `email_from = 'sushil@frontbase.com.np'`
- But your Gmail is `shahisushil52@gmail.com` (from .env)
- Gmail might reject emails from a different sender address

### 4. ⚠️ Async Task Not Fallback to Sync
- If Celery fails, the signup still completes but OTP is never sent
- No fallback to synchronous email sending

## Quick Fix - Enable Synchronous Email (FOR DEVELOPMENT):

Replace the Celery async task with synchronous email sending in signup view.

## Step-by-Step Solution:

### Option A: Quick Fix (Use Synchronous Email - RECOMMENDED FOR NOW)

Update `backend/api/views.py` SignupView to send email synchronously:

Find this in SignupView.post():
```python
send_otp_email.delay(email, otp)
```

Replace with:
```python
# Send OTP email synchronously (no Celery dependency)
from django.core.mail import send_mail
send_mail(
    'Your OTP Code',
    f'Your OTP code is: {otp}',
    settings.EMAIL_HOST_USER,
    [email],
    fail_silently=False,
    html_message=f'<p>Your OTP code is: <strong>{otp}</strong></p>'
)
```

### Option B: Proper Fix (Keep Celery but with Fallback)

1. Start Redis: `redis-server`
2. Start Celery worker in a new terminal:
   ```bash
   cd backend
   celery -A backend worker -l info
   ```
3. Fix the hardcoded email in tasks.py - use from settings

### Issues in Current Code:

1. **tasks.py line 16**: Hardcoded `email_from = 'sushil@frontbase.com.np'`
   - Should be: `from_email=settings.EMAIL_HOST_USER`

2. **No sync fallback**: If Celery fails, no email is sent silently

3. **Gmail Security**: May need App Password instead of regular password

## Gmail Configuration Check:

1. Go to: https://myaccount.google.com/apppasswords
2. Select Mail and Windows Computer
3. Generate a new App Password
4. Update `.env` with the new password:
   ```
   EMAIL_HOST_PASSWORD=<16-character-app-password>
   ```

## Verification Steps:

1. Check if email is in Spam folder
2. Check Django logs for errors
3. Test with a simple `send_mail()` call directly
4. Verify `.env` file has correct credentials
5. Check if Redis is running: `redis-cli ping`
