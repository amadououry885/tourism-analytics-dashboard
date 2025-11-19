# 📧 Gmail Email Setup Guide (Development)

## ✅ Why Gmail for Development?

- ✅ **FREE** - No account needed beyond your existing Gmail
- ✅ **Simple** - Just 2 steps to set up
- ✅ **Fast** - Ready in 5 minutes
- ✅ **Reliable** - Emails arrive immediately
- ✅ **No verification** - No domain verification needed

Perfect for testing and development!

---

## 🚀 Quick Setup (5 Minutes)

### **Step 1: Create Gmail App Password**

Gmail requires an "App Password" (special password for applications, NOT your regular Gmail password).

**How to get it:**

1. **Go to:** https://myaccount.google.com/apppasswords
   
2. **Sign in** with your Gmail account

3. **You might need to enable 2-Step Verification first:**
   - If you see "2-Step Verification is not turned on", click to enable it
   - Follow the steps to enable 2-Step Verification
   - Come back to https://myaccount.google.com/apppasswords

4. **Create App Password:**
   - App name: `Kedah Tourism` (or any name you want)
   - Click **"Create"**
   
5. **Copy the 16-character password**
   - It will look like: `abcd efgh ijkl mnop`
   - Remove spaces when pasting: `abcdefghijklmnop`
   - **Save it somewhere** - you won't see it again!

---

### **Step 2: Create .env File**

In your `backend/` directory:

```bash
cd /home/amadou-oury-diallo/tourism-analytics-dashboard/backend
cp .env.example .env
```

Then edit the `.env` file and add:

```bash
# Email Configuration (Gmail)
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=abcdefghijklmnop
DEFAULT_FROM_EMAIL=Kedah Tourism <your-email@gmail.com>
FRONTEND_URL=http://localhost:3000
```

**Replace:**
- `your-email@gmail.com` → Your actual Gmail address
- `abcdefghijklmnop` → Your 16-character App Password (no spaces!)

---

### **Step 3: Restart Django Server**

```bash
cd backend/
python manage.py runserver 8000
```

---

## ✅ **THAT'S IT!** You're done! 🎉

---

## 🧪 Testing

### **Test the Email System:**

1. **Register a new user:**
   - Go to http://localhost:3000/register
   - Fill the form and submit
   - Use a **real email address** you can check

2. **Login as admin:**
   - Go to http://localhost:3000/login
   - Login with admin credentials

3. **Approve the user:**
   - Go to Admin Dashboard → User Approvals
   - Click "✅ Approve" on the pending user

4. **Check email inbox:**
   - Check the email inbox of the user you approved
   - You should receive a professional approval email!
   - Check spam folder if not in inbox

---

## 📧 What the Emails Look Like

### **Approval Email:**
```
Subject: ✅ Your Kedah Tourism Account Has Been Approved!

- Professional green gradient design
- Welcome message with account details
- Benefits list with emojis
- "Login to Dashboard" button
- Support contact info
```

### **Rejection Email:**
```
Subject: ❌ Your Kedah Tourism Account Application Status

- Professional red gradient design
- Polite explanation
- Optional rejection reason
- Support contact info
- Encouragement to reapply
```

---

## 🔧 Troubleshooting

### **Problem: "Username and Password not accepted"**

**Cause:** Using regular Gmail password instead of App Password

**Solution:** 
1. Generate App Password at https://myaccount.google.com/apppasswords
2. Use that 16-character password in `.env`
3. Remove spaces from the password

---

### **Problem: "2-Step Verification required"**

**Cause:** Gmail requires 2-Step Verification to create App Passwords

**Solution:**
1. Go to https://myaccount.google.com/security
2. Enable "2-Step Verification"
3. Then create App Password

---

### **Problem: Emails not sending**

**Solution:**
1. Check `.env` file has correct email and App Password
2. Make sure `.env` is in `backend/` directory
3. Restart Django server after editing `.env`
4. Check Django terminal for error messages

---

### **Problem: Can't find App Password page**

**Quick Link:** https://myaccount.google.com/apppasswords

**Or manually:**
1. Go to https://myaccount.google.com
2. Click "Security" on left
3. Scroll to "2-Step Verification"
4. Scroll down to "App passwords"

---

## 📊 Gmail Limits

**Gmail SMTP Limits:**
- ✅ 500 emails per day (plenty for development!)
- ✅ 100-150 emails per hour
- ✅ FREE forever

Perfect for development and testing!

**For Production:**
- Consider SendGrid (100 emails/day free)
- Or Mailgun (5,000 emails/month free)
- Or AWS SES (very cheap)

---

## 🔒 Security Notes

✅ **App Password is NOT your regular password**
- It's a special password just for this app
- If compromised, revoke it and create a new one
- Your regular Gmail password stays safe

✅ **Never commit .env to git**
- Already in `.gitignore`
- Contains your App Password
- Keep it secret!

✅ **Revoke App Password anytime:**
- Go to https://myaccount.google.com/apppasswords
- Click the X next to "Kedah Tourism"
- Create a new one if needed

---

## 🎯 Quick Checklist

Before testing, make sure you have:

- [ ] Gmail account with 2-Step Verification enabled
- [ ] Generated App Password from https://myaccount.google.com/apppasswords
- [ ] Created `backend/.env` file (copy from `.env.example`)
- [ ] Added your Gmail and App Password to `.env`
- [ ] Removed spaces from App Password
- [ ] Restarted Django server
- [ ] Ready to test!

---

## 📝 Example .env File

Here's what your `backend/.env` should look like:

```bash
# Email Configuration (Gmail)
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=amadou@gmail.com
EMAIL_HOST_PASSWORD=abcdefghijklmnop
DEFAULT_FROM_EMAIL=Kedah Tourism <amadou@gmail.com>
FRONTEND_URL=http://localhost:3000
```

*(Replace with your actual email and App Password)*

---

## 🆘 Still Having Issues?

If emails still aren't working:

1. **Check Django logs** in the terminal for error messages
2. **Test with console backend** first:
   ```bash
   # In .env, temporarily use:
   EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
   ```
   This prints emails to terminal to verify logic works

3. **Verify App Password** is correct (16 characters, no spaces)

4. **Check Gmail security settings** at https://myaccount.google.com/security

5. **Let me know** and I'll help debug!

---

## ✨ Next Steps

Once emails are working:

1. ✅ Test approval emails
2. ✅ Test rejection emails (with optional reason)
3. ✅ Customize email templates if needed
4. ✅ Consider upgrading to SendGrid for production

---

**Ready to set up?** Follow the steps above and let me know when you're ready to test! 📧
