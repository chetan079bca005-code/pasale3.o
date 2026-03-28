# 🔧 OTP EMAIL TROUBLESHOOTING GUIDE

## 📋 What I Fixed:

### 1. ✅ Updated `tasks.py` - Fixed Email Sender
- **Before**: Used hardcoded `email_from = 'sushil@frontbase.com.np'`
- **After**: Uses `settings.EMAIL_HOST_USER` from `.env` file
- **Impact**: Emails will now be sent from your configured Gmail account

### 2. ✅ Added Synchronous Email Fallback in `views.py`
- **Added**: New function `send_otp_email_sync()` for fallback
- **Why**: If Celery/Redis is not running, OTP will still be sent synchronously
- **Impact**: OTP emails work even if Celery is down

### 3. ✅ Improved Email HTML Format
- Added proper HTML email template
- Added expiration time message
- Better email styling

### 4. ✅ Fixed LoginView Email Sending
- Now uses `EmailMessage` instead of basic `send_mail()`
- Uses configured email from settings
- Includes HTML template

---

## ⚙️ HOW TO RUN - 3 METHODS:

### METHOD 1: Quick Test (RECOMMENDED FOR NOW) ✅
Just run Django server - emails will be sent synchronously:

```bash
cd backend
python manage.py runserver
```

**What happens:**
- When user signs up, OTP is sent immediately (synchronous)
- No need for Celery or Redis
- Emails appear in Gmail instantly

---

### METHOD 2: Production Setup (With Celery + Redis)
For async email sending with queue management:

**Terminal 1 - Start Redis:**
```bash
redis-server
```

**Terminal 2 - Start Django:**
```bash
cd backend
python manage.py runserver
```

**Terminal 3 - Start Celery Worker:**
```bash
cd backend
celery -A backend worker -l info
```

**What happens:**
- Email tasks are queued in Redis
- Celery worker processes them asynchronously
- Better for production with many users

---

### METHOD 3: For Windows Users (Redis Issues)
If Redis doesn't work on Windows:

**Option A: Use WSL2**
```bash
wsl
redis-server
```

**Option B: Use Memurai (Redis for Windows)**
Download from: https://github.com/microsoftarchive/memurai-benchmark/releases

**Option C: Skip Celery (Current Setup)**
- Just run `python manage.py runserver`
- Emails work synchronously
- Perfect for development

---

## ✅ GMAIL CONFIGURATION - IMPORTANT!

### Using Gmail App Password (Recommended):

1. **Enable 2-Factor Authentication on your Gmail:**
   - Go to: https://myaccount.google.com/security
   - Find "2-Step Verification" and enable it

2. **Generate App Password:**
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Windows Computer"
   - Click "Generate"
   - Copy the 16-character password

3. **Update `.env` file:**
   ```
   EMAIL_HOST_USER=shahisushil52@gmail.com
   EMAIL_HOST_PASSWORD=<paste-16-character-password-here>
   ```

4. **Restart Django:**
   ```bash
   python manage.py runserver
   ```

### Using Regular Gmail Password (Less Secure):

1. **Enable Less Secure App Access:**
   - Go to: https://myaccount.google.com/lesssecureapps
   - Turn ON "Allow less secure apps"

2. **Use your Gmail password in `.env`:**
   ```
   EMAIL_HOST_USER=shahisushil52@gmail.com
   EMAIL_HOST_PASSWORD=your-regular-gmail-password
   ```

---

## 🧪 TEST IF EMAILS ARE WORKING:

### Test 1: Check Email Configuration
Create a test script `test_email.py` in the backend folder:

```python
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.core.mail import EmailMessage
from django.conf import settings

# Test email
email_from = settings.EMAIL_HOST_USER
recipient_email = "your-test-email@gmail.com"

mail = EmailMessage(
    subject='Test Email from Pasale',
    body='This is a test email',
    from_email=email_from,
    to=[recipient_email],
)
mail.send()
print("✅ Test email sent successfully!")
```

Run it:
```bash
cd backend
python test_email.py
```

### Test 2: Check Django Logs
Look for these messages in terminal:

**Success message:**
```
OTP email sent synchronously to user@example.com
```

**Error message:**
```
Failed to send OTP email synchronously to user@example.com: [error details]
```

### Test 3: Check Email Settings
Create `check_email_config.py`:

```python
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.conf import settings

print(f"EMAIL_BACKEND: {settings.EMAIL_BACKEND}")
print(f"EMAIL_HOST: {settings.EMAIL_HOST}")
print(f"EMAIL_PORT: {settings.EMAIL_PORT}")
print(f"EMAIL_USE_TLS: {settings.EMAIL_USE_TLS}")
print(f"EMAIL_HOST_USER: {settings.EMAIL_HOST_USER}")
print(f"EMAIL_HOST_PASSWORD: {'***' if settings.EMAIL_HOST_PASSWORD else 'NOT SET'}")
```

Run it:
```bash
cd backend
python check_email_config.py
```

---

## 🔍 COMMON ISSUES & SOLUTIONS:

### ❌ Issue: "SMTPAuthenticationError"
**Cause:** Wrong email credentials
**Solution:** 
- Check `.env` file for correct email/password
- Use App Password instead of regular Gmail password
- Verify EMAIL_HOST_USER format

### ❌ Issue: "Connection refused to Redis"
**Cause:** Redis not running
**Solution:** 
- Just run Django without Celery
- Emails will be sent synchronously
- Or start Redis: `redis-server`

### ❌ Issue: "Email appears in Spam"
**Cause:** Gmail thinks it's spam
**Solution:**
- Mark as "Not Spam" in Gmail
- After marking several emails, Gmail learns it's legitimate

### ❌ Issue: "Connection timed out to smtp.gmail.com"
**Cause:** Network or Gmail blocking connection
**Solution:**
- Check internet connection
- Try using App Password
- Try from different network/VPN

### ❌ Issue: "SMTPNotSupportedError"
**Cause:** EMAIL_USE_TLS not set properly
**Solution:** 
- Ensure in settings: `EMAIL_USE_TLS = True`
- Port should be 587 for Gmail

---

## 📊 FLOW DIAGRAM:

```
User Signs Up
       ↓
Generate OTP & Save to Database
       ↓
Try Celery Task (if Redis running)
       ↓ (Celery fails or not running)
       └→ Fall back to sync email
       ↓
Send email via SMTP
       ↓
Gmail receives email
       ↓
User sees OTP in inbox ✅
```

---

## ✨ SUMMARY OF CHANGES:

| File | Change | Benefit |
|------|--------|---------|
| `backend/api/tasks.py` | Use `settings.EMAIL_HOST_USER` | Email sent from correct account |
| `backend/api/views.py` | Add sync fallback | Works even if Celery down |
| `backend/api/views.py` | Improve email template | Better user experience |
| `backend/.env` | Already configured | Just needs correct Gmail App Password |

---

## 🚀 NEXT STEPS:

1. **Update Gmail password:**
   - Generate App Password as described above
   - Update `.env` file

2. **Restart Django:**
   ```bash
   python manage.py runserver
   ```

3. **Test signup:**
   - Create an account
   - Check your Gmail for OTP

4. **If still not working:**
   - Run `test_email.py` to debug
   - Check Django logs for errors
   - Verify `.env` file has correct credentials

---

**Questions? Check the logs or run the test scripts above!** 🎯
