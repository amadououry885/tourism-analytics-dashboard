# 📧 Email Notification System - Setup Guide

## ✅ What's Been Implemented

The email notification system is **fully implemented** and ready to use! Here's what was added:

### **Files Created:**
1. ✅ `backend/.env.example` - Template for environment variables
2. ✅ `backend/users/emails.py` - Email sending functions with HTML templates
3. ✅ Updated `backend/tourism_api/settings.py` - Email configuration
4. ✅ Updated `backend/users/views.py` - Integration with approval/rejection
5. ✅ Updated `backend/.gitignore` - Protect sensitive credentials

### **Features:**
- ✅ Professional HTML emails with Kedah Tourism branding
- ✅ Automatic emails sent when admin approves a user
- ✅ Automatic emails sent when admin rejects a user
- ✅ Optional rejection reason field
- ✅ Plain text fallback for all email clients
- ✅ Proper error handling and logging
- ✅ SendGrid integration ready

---

## 🚀 How to Activate Email Notifications

### **Step 1: Get Your SendGrid API Key**

1. Go to https://signup.sendgrid.com/ (Free account - 100 emails/day)
2. Verify your email address
3. Go to Settings → API Keys → Create API Key
4. Choose "Full Access" (recommended) or "Restricted Access" (minimum: Mail Send)
5. Copy the API key (you'll only see it once!)

### **Step 2: Create .env File**

In the `backend/` directory, create a file named `.env`:

```bash
cd backend/
cp .env.example .env
```

### **Step 3: Add Your SendGrid API Key**

Edit `backend/.env` and add your actual SendGrid API key:

```bash
# Email Configuration (SendGrid)
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=apikey
EMAIL_HOST_PASSWORD=SG.PASTE_YOUR_SENDGRID_API_KEY_HERE
DEFAULT_FROM_EMAIL=Kedah Tourism <noreply@kedahtourism.my>
FRONTEND_URL=http://localhost:3000
```

**Replace `SG.PASTE_YOUR_SENDGRID_API_KEY_HERE` with your actual API key!**

### **Step 4: Verify Sender Email (SendGrid Requirement)**

SendGrid requires you to verify the sender email address:

1. Go to SendGrid Dashboard → Settings → Sender Authentication
2. Click "Verify a Single Sender"
3. Fill in the form:
   - **From Name:** Kedah Tourism
   - **From Email Address:** noreply@kedahtourism.my (or use your verified email)
   - **Reply To:** support@kedahtourism.my (or your email)
   - Fill in other required fields
4. Check your email and click the verification link

**Note:** For testing, you can use your personal email address instead of `noreply@kedahtourism.my`

Example for testing:
```bash
DEFAULT_FROM_EMAIL=Kedah Tourism <youremail@gmail.com>
```

### **Step 5: Restart Django Server**

After creating `.env`, restart your Django server so it picks up the new environment variables:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
cd backend/
python manage.py runserver 8000
```

---

## 🧪 Testing the Email System

### **Test 1: Console Backend (Without SendGrid)**

To test email functionality WITHOUT sending real emails (prints to console instead):

In `backend/.env`, use:
```bash
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
```

This will print emails to your terminal instead of sending them.

### **Test 2: Real Emails (With SendGrid)**

1. Register a new test user at http://localhost:3000/register
2. Login as admin at http://localhost:3000/admin/dashboard
3. Approve or reject the pending user
4. **Check the user's email inbox!**
5. Also check spam/junk folder (first emails sometimes go there)

---

## 📧 Email Templates

### **Approval Email Preview:**

**Subject:** ✅ Your Kedah Tourism Account Has Been Approved!

- Professional green gradient header
- Account details (username, email, role)
- Benefits list with emojis
- "Login to Dashboard" button
- Support contact info in footer

### **Rejection Email Preview:**

**Subject:** ❌ Your Kedah Tourism Account Application Status

- Red gradient header
- Application details
- Optional rejection reason (if admin provided one)
- Support contact info
- Friendly message encouraging to reapply

---

## 🔧 Advanced Configuration

### **Add Rejection Reason (Frontend)**

To add a rejection reason field in the admin panel, modify the reject handler in `AdminDashboard.tsx`:

```typescript
const handleRejectUser = async (userId: number) => {
  const reason = prompt('Optional: Provide a reason for rejection');
  
  if (window.confirm('Are you sure you want to reject this user?')) {
    try {
      await request(
        `/auth/admin/users/${userId}/reject/`,
        { 
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason: reason || '' })
        },
        '✅ User rejected successfully!'
      );
      fetchPendingUsers();
    } catch (error) {
      console.error('Failed to reject user:', error);
    }
  }
};
```

### **Customize Email Templates**

Edit `backend/users/emails.py` to customize:
- Colors and styling
- Email content and wording
- Logo/images (add as base64 or hosted URLs)
- Footer information

---

## 🐛 Troubleshooting

### **Problem: Emails not sending**

**Solution:**
1. Check `backend/.env` has correct SendGrid API key
2. Verify sender email in SendGrid dashboard
3. Check Django logs: `python manage.py runserver 8000` (look for email errors)
4. Test with console backend first to verify logic works

### **Problem: Emails go to spam**

**Solution:**
1. Complete SendGrid sender verification
2. Set up SPF/DKIM records (SendGrid provides instructions)
3. Avoid spam trigger words in subject/content
4. Start with small volume, build reputation

### **Problem: ImportError or module not found**

**Solution:**
```bash
cd backend/
pip install django djangorestframework
```

### **Problem: Environment variables not loading**

**Solution:**
1. Make sure `.env` is in `backend/` directory (not root)
2. Restart Django server after creating `.env`
3. Check file is named exactly `.env` (not `.env.txt`)

---

## 📊 Monitoring Email Sending

Check SendGrid dashboard to monitor:
- ✅ Emails sent successfully
- ❌ Emails bounced/failed
- 📧 Delivery rates
- 🔍 Individual email status

Dashboard: https://app.sendgrid.com/statistics

---

## 🔒 Security Reminders

- ✅ `.env` is in `.gitignore` - never commit it!
- ✅ Use environment variables for all secrets
- ✅ Keep SendGrid API key private
- ✅ Regenerate API key if accidentally exposed
- ✅ Use "Restricted Access" API keys in production

---

## ✨ What Happens Now

When an admin approves or rejects a user:

1. **Backend** (`users/views.py`):
   - Updates user status in database
   - Calls email function from `users/emails.py`
   
2. **Email System** (`users/emails.py`):
   - Builds HTML and plain text email
   - Sends via SendGrid SMTP
   - Logs success/failure
   
3. **User**:
   - Receives professional email notification
   - Clicks login link (approval) or contacts support (rejection)

---

## 📝 Next Steps

1. **Get SendGrid API key** (5 minutes)
2. **Create `.env` file** (2 minutes)
3. **Verify sender email** (5 minutes)
4. **Test with real user** (2 minutes)
5. **Customize templates** (optional)

**Total time:** ~15 minutes to go live! 🚀

---

## 🆘 Need Help?

If you encounter any issues:

1. Check this guide's troubleshooting section
2. Review Django logs for specific errors
3. Test with console backend first
4. Verify SendGrid dashboard for API errors
5. Let me know and I'll help debug!

---

**Ready to test?** Send me your SendGrid API key when you have it, and I'll help you set it up! 📧
