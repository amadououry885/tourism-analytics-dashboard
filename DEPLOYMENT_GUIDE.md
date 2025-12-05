# 🚀 DEPLOYMENT GUIDE - Tourism Analytics Dashboard

## ✅ Why Vercel + Render?

**Perfect for your case:**
- ✅ **Professional stable URL** (great for feedback)
- ✅ **100% Free tier** (no credit card initially)
- ✅ **Auto-deployment** (push code = instant update)
- ✅ **Django + React** optimized
- ✅ **PostgreSQL included** (production-ready database)
- ✅ **SSL/HTTPS automatic**

---

## 📋 STEP-BY-STEP DEPLOYMENT

### 🔧 Prerequisites (Already Done ✅)
- [x] Code ready with recurring events feature
- [x] GitHub repository connected
- [x] Production config files created
- [x] Django settings updated for production

---

### 1️⃣ COMMIT & PUSH TO GITHUB (5 minutes)

```bash
# Add all changes
git add .

# Commit with message
git commit -m "Production ready: Recurring events + deployment config"

# Push to GitHub
git push origin main
```

**Verify:** Visit https://github.com/amadououry885/tourism-analytics-dashboard and confirm latest code is there.

---

### 2️⃣ DEPLOY BACKEND ON RENDER (10 minutes)

**2.1 Sign Up & Connect GitHub**
1. Go to: https://dashboard.render.com/register
2. Sign up with GitHub (fastest)
3. Authorize Render to access your repos

**2.2 Create Web Service**
1. Click **"New +"** → **"Web Service"**
2. Find and select: `tourism-analytics-dashboard`
3. Configure:
   - **Name:** `tourism-analytics-backend`
   - **Region:** Singapore (closest to Malaysia)
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Runtime:** Python 3
   - **Build Command:** 
     ```
     pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate
     ```
   - **Start Command:**
     ```
     gunicorn tourism_api.wsgi:application
     ```

**2.3 Add Environment Variables**
Click "Advanced" → Add these:
- `ENV` = `production`
- `DJANGO_DEBUG` = `false`
- `SECRET_KEY` = (click "Generate" button)
- `ALLOWED_HOSTS` = `.onrender.com,.vercel.app`
- `CORS_ALLOWED_ORIGINS` = `https://your-frontend-url.vercel.app` (update after step 3)

**2.4 Add Database**
- Scroll to "Add Database"
- Click "PostgreSQL"
- It auto-creates `DATABASE_URL` environment variable

**2.5 Deploy!**
- Click **"Create Web Service"**
- Wait 3-5 minutes for build
- Copy your backend URL: `https://tourism-analytics-backend.onrender.com`

---

### 3️⃣ DEPLOY FRONTEND ON VERCEL (5 minutes)

**3.1 Sign Up**
1. Go to: https://vercel.com/signup
2. Sign up with GitHub

**3.2 Import Project**
1. Click **"Add New..."** → **"Project"**
2. Import: `tourism-analytics-dashboard`
3. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

**3.3 Add Environment Variable**
- Click "Environment Variables"
- Add:
  ```
  VITE_API_URL = https://tourism-analytics-backend.onrender.com
  ```
  (Use YOUR backend URL from step 2)

**3.4 Deploy!**
- Click **"Deploy"**
- Wait 2-3 minutes
- Your URL: `https://tourism-analytics-dashboard.vercel.app`

---

### 4️⃣ UPDATE BACKEND CORS (2 minutes)

**Back in Render dashboard:**
1. Go to your web service
2. Click "Environment"
3. Update `CORS_ALLOWED_ORIGINS`:
   ```
   https://tourism-analytics-dashboard.vercel.app
   ```
   (Use YOUR Vercel URL from step 3)
4. Click "Save Changes"
5. Backend auto-redeploys (30 seconds)

---

### 5️⃣ CREATE ADMIN USER (1 minute)

**In Render dashboard:**
1. Click "Shell" tab (or SSH)
2. Run:
   ```bash
   python manage.py createsuperuser
   ```
3. Enter username, email, password
4. Now you can login at: `https://your-app.vercel.app/admin/dashboard`

---

## 🎉 YOU'RE LIVE!

**Your URLs:**
- **Frontend (share this!):** https://tourism-analytics-dashboard.vercel.app
- **Backend API:** https://tourism-analytics-backend.onrender.com
- **Admin Panel:** https://tourism-analytics-dashboard.vercel.app/admin/dashboard

---

## 📱 TESTING CHECKLIST

Before sharing for feedback:

### Essential Tests:
- [ ] Visit frontend URL - loads correctly
- [ ] Login works
- [ ] Events page shows data
- [ ] "Happening Now" section visible (if you have live events)
- [ ] Admin Dashboard accessible
- [ ] Create a recurring event (weekly market)
- [ ] Verify recurring badge shows
- [ ] Test on mobile device

### Create Test Data:
```bash
# In Render Shell:
cd backend
python seed.py  # Populate demo data
```

---

## 🔄 FUTURE UPDATES

**Every time you update code:**

1. Local changes:
   ```bash
   git add .
   git commit -m "Add new feature"
   git push origin main
   ```

2. **AUTO-MAGIC! 🎩✨**
   - Vercel rebuilds frontend automatically
   - Render rebuilds backend automatically
   - Takes 2-3 minutes
   - Changes live!

---

## 💡 TIPS FOR GATHERING FEEDBACK

**Share Your Link With:**
1. **Non-technical users** (test UX clarity)
2. **Mobile users** (responsive design)
3. **Tourism industry people** (feature relevance)
4. **Potential clients/investors**

**Ask Specific Questions:**
- "Is the recurring event feature clear?"
- "Can you easily find happening now events?"
- "Is the admin panel intuitive?"
- "What's confusing or missing?"

---

## 🆘 TROUBLESHOOTING

**Frontend can't reach backend:**
- Check CORS settings in Render
- Verify `VITE_API_URL` in Vercel

**Database errors:**
- Run migrations in Render Shell: `python manage.py migrate`
- Check PostgreSQL is connected

**Static files not loading:**
- Run in Render Shell: `python manage.py collectstatic --noinput`

**Need help?**
- Render logs: Dashboard → Logs tab
- Vercel logs: Dashboard → Deployments → Latest → Logs

---

## 📊 MONITORING

**Check Health:**
- Frontend: https://your-app.vercel.app
- Backend: https://your-backend.onrender.com/api/events/
- Admin: https://your-app.vercel.app/admin/dashboard

**Free Tier Limits:**
- Render: Spins down after 15 min idle (first request slow)
- Vercel: Unlimited bandwidth for hobby projects
- Both: 100% free for your use case!

---

## 🎯 NEXT FEATURES (After Feedback)

Based on feedback, you might add:
- Email notifications for event registrations
- SMS reminders (Twilio integration)
- Payment integration for paid events
- Analytics dashboard improvements
- Mobile app (React Native)

---

**Ready to deploy? Run:**
```bash
git add .
git commit -m "Production ready with recurring events"
git push origin main
```

**Then follow steps 2-5 above!** 🚀
