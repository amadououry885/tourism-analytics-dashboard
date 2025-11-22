# Deploying Frontend to Vercel

## Option 1: Quick Deploy (Recommended)

1. **Install Vercel CLI**:
```bash
npm install -g vercel
```

2. **Login to Vercel**:
```bash
vercel login
```

3. **Deploy from frontend directory**:
```bash
cd frontend
vercel
```

Follow the prompts:
- Set up and deploy? **Y**
- Which scope? Choose your account
- Link to existing project? **N** (first time)
- What's your project's name? **tourism-analytics-dashboard**
- In which directory is your code located? **./frontend**
- Want to override the settings? **N**

4. **Set environment variable** (if needed):
```bash
vercel env add VITE_API_URL
# Enter: http://your-backend-ip:8000
```

## Option 2: GitHub Integration (Best for continuous deployment)

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository `tourism-analytics-dashboard`
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Environment Variables**:
     - `VITE_API_URL` = `http://YOUR_BACKEND_IP:8000`

5. Click "Deploy"

## After Deployment

Your frontend will be at: `https://tourism-analytics-dashboard.vercel.app`

**Update your backend CORS settings** in `backend/tourism_api/settings.py`:

```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "https://tourism-analytics-dashboard.vercel.app",  # Add this
]
```

## New Local Development Workflow

**Instead of running both servers locally**, just run backend:

```bash
# Only run backend locally
cd backend
python manage.py runserver

# Access frontend at: https://tourism-analytics-dashboard.vercel.app
# It will connect to your local backend at localhost:8000
```

**Memory Usage**:
- Before: ~3.5GB (backend + frontend + VS Code)
- After: ~2.9GB (backend + VS Code only)
- **Savings**: 600MB! ✅

## Hybrid Development Approach

**For quick CSS/UI changes**:
- Edit frontend code locally
- Push to GitHub
- Vercel auto-deploys in 30 seconds
- Refresh browser

**For testing with local data**:
- Keep backend running locally on port 8000
- Frontend on Vercel calls your local backend
- (You'll need to expose port 8000 or use ngrok for remote testing)

**For heavy backend changes**:
- Run backend locally
- Frontend stays on Vercel
- Test API endpoints directly

## Alternative: Use Vercel Dev (Local Preview)

If you still want to test locally sometimes:

```bash
cd frontend
vercel dev  # Runs local preview with Vercel environment
```

This uses **less memory** than `npm run dev` because Vercel optimizes the build.

---

**Recommendation**: Deploy to Vercel **NOW** and stop running `npm run dev` locally. You'll immediately notice VS Code being more stable!
