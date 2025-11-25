# 🎯 PRODUCTION DEPLOYMENT GUIDE

**Tourism Analytics Dashboard - Kedah**  
**Status:** ✅ Ready for Production  
**Last Updated:** November 25, 2025

---

## 🚀 Quick Deploy

### Option 1: AWS Elastic Beanstalk (Recommended)

**Prerequisites:**
- AWS Account
- EB CLI installed (`pip install awsebcli`)

**Steps:**
```bash
# 1. Initialize EB (if not done)
cd /home/amadou-oury-diallo/tourism-analytics-dashboard
eb init

# 2. Create environment
eb create tourism-analytics-prod --database.engine postgres

# 3. Set environment variables
eb setenv SECRET_KEY="your-secret-key-here" \
  DJANGO_DEBUG="false" \
  DATABASE_URL="postgres://user:pass@host:5432/dbname"

# 4. Deploy
eb deploy

# 5. Open app
eb open
```

**Cost:** ~$35-60/month (t3.small + RDS)

---

### Option 2: Docker Compose (Self-Hosted)

**Prerequisites:**
- Docker & Docker Compose installed
- Server with Ubuntu 20.04+

**Steps:**
```bash
# 1. Clone repository
git clone https://github.com/your-repo/tourism-analytics-dashboard.git
cd tourism-analytics-dashboard

# 2. Create production .env
cp backend/.env.example backend/.env
# Edit backend/.env with production values

# 3. Build and run
docker-compose up -d --build

# 4. Run migrations
docker-compose exec backend python manage.py migrate

# 5. Create superuser
docker-compose exec backend python manage.py createsuperuser

# 6. Load sample data
docker-compose exec backend python seed.py
```

**Access:** `http://your-server-ip:8000`

---

### Option 3: Separate Hosting (Frontend + Backend)

**Frontend (Vercel):**
```bash
cd frontend
npm run build
vercel --prod
```

**Backend (Render/Railway):**
- Connect GitHub repo
- Set environment variables
- Deploy with `gunicorn tourism_api.wsgi`

---

## 🔐 Environment Variables (CRITICAL)

### Backend `.env` (Production)

```bash
# SECURITY - GENERATE NEW KEY!
SECRET_KEY="django-insecure-GENERATE-A-STRONG-KEY-HERE"

# ENVIRONMENT
ENV=production
DJANGO_DEBUG=false

# DATABASE (PostgreSQL)
DATABASE_URL=postgres://username:password@host:5432/tourism_db

# ALLOWED HOSTS
ALLOWED_HOSTS=your-domain.com,your-eb-app.elasticbeanstalk.com

# CORS
CORS_ALLOWED_ORIGINS=https://your-frontend-domain.com,https://www.your-domain.com

# AWS S3 (Optional - for media files)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_STORAGE_BUCKET_NAME=tourism-analytics-media
AWS_S3_REGION_NAME=us-east-1

# EMAIL (Optional - for password reset)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
EMAIL_USE_TLS=true
```

### Generate SECRET_KEY

```python
# Run this in Django shell
from django.core.management.utils import get_random_secret_key
print(get_random_secret_key())
```

---

## 📦 Database Setup

### PostgreSQL (Production)

**AWS RDS:**
1. Create PostgreSQL instance (db.t3.micro for free tier)
2. Set security group to allow backend access
3. Copy connection string to `DATABASE_URL`

**Local PostgreSQL:**
```bash
# Install
sudo apt-get install postgresql postgresql-contrib postgis

# Create database
sudo -u postgres psql
CREATE DATABASE tourism_db;
CREATE USER tourism_user WITH PASSWORD 'strong_password';
ALTER ROLE tourism_user SET client_encoding TO 'utf8';
ALTER ROLE tourism_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE tourism_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE tourism_db TO tourism_user;
\q

# Update DATABASE_URL
DATABASE_URL=postgres://tourism_user:strong_password@localhost:5432/tourism_db
```

---

## 🔧 Post-Deployment Checklist

### After First Deploy

- [ ] Run migrations: `python manage.py migrate`
- [ ] Create superuser: `python manage.py createsuperuser`
- [ ] Load sample data: `python seed.py`
- [ ] Collect static files: `python manage.py collectstatic`
- [ ] Test all endpoints: `curl https://your-domain.com/healthz/`
- [ ] Test frontend: Open `https://your-frontend-domain.com`
- [ ] Test login: Create account and login
- [ ] Test admin panel: `https://your-domain.com/admin/`

### Security

- [ ] `DEBUG=False` in production
- [ ] Strong `SECRET_KEY` (50+ random characters)
- [ ] HTTPS enabled (SSL certificate)
- [ ] CORS restricted to frontend domain only
- [ ] Database password is strong (16+ chars)
- [ ] Environment variables not in git
- [ ] `.env` file in `.gitignore`

### Performance

- [ ] Enable gzip compression (WhiteNoise does this)
- [ ] Set up CloudFront CDN (for static files)
- [ ] Configure S3 for media uploads
- [ ] Add database indexes (already done in models)
- [ ] Enable Redis caching (optional)

### Monitoring

- [ ] Set up error tracking (Sentry recommended)
- [ ] Configure logging (CloudWatch for AWS)
- [ ] Set up uptime monitoring (UptimeRobot free tier)
- [ ] Database backup schedule (daily recommended)

---

## 🌐 Domain Setup

### DNS Configuration

**A Records:**
```
@ -> Your backend IP/Load Balancer
www -> Your backend IP/Load Balancer
api -> Your backend IP/Load Balancer
```

**CNAME (if using AWS):**
```
www -> your-app.elasticbeanstalk.com
api -> your-app.elasticbeanstalk.com
```

### SSL Certificate

**Let's Encrypt (Free):**
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

**AWS Certificate Manager:**
- Request certificate in ACM
- Add to Load Balancer
- Enable HTTPS listener

---

## 🔄 CI/CD Pipeline (Optional)

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to EB
        run: |
          pip install awsebcli
          eb deploy tourism-analytics-prod

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        run: |
          npm install -g vercel
          cd frontend && vercel --prod --token ${{ secrets.VERCEL_TOKEN }}
```

---

## 📊 Monitoring Endpoints

### Health Check
```bash
curl https://your-domain.com/healthz/
# Should return: OK
```

### API Status
```bash
curl https://your-domain.com/
# Should return: JSON with endpoint list
```

### Database Connection
```bash
python manage.py dbshell
# Should connect to PostgreSQL
```

---

## 🆘 Troubleshooting

### Backend 500 Error

**Check logs:**
```bash
# AWS EB
eb logs

# Docker
docker-compose logs backend

# Direct
tail -f /var/log/app.log
```

**Common causes:**
- `DEBUG=True` (should be False)
- Missing environment variables
- Database connection failed
- Static files not collected

### Frontend Can't Connect to Backend

**Check:**
- CORS settings in `backend/settings.py`
- API URL in `frontend/src/services/api.ts`
- Network tab in browser DevTools
- Backend is running and accessible

### Database Migration Errors

```bash
# Reset migrations (DANGER - dev only)
python manage.py migrate --fake-initial

# Or manually fix
python manage.py showmigrations
python manage.py migrate app_name migration_name
```

---

## 💰 Cost Optimization

### Free Tier Options

**Backend:**
- Render (Free tier: 750 hours/month)
- Railway ($5 credit/month)
- Fly.io (Free tier available)

**Frontend:**
- Vercel (Free for personal projects)
- Netlify (Free tier)
- Cloudflare Pages (Free)

**Database:**
- Supabase PostgreSQL (Free 500MB)
- ElephantSQL (Free 20MB)
- Neon.tech (Free tier)

### Paid Optimization

**AWS:**
- Use Reserved Instances (up to 75% savings)
- Enable S3 lifecycle policies
- Use CloudFront for caching
- Auto-scaling for traffic spikes

---

## 📝 Deployment Log Template

```
Date: _____________
Version: _____________
Deployed By: _____________

PRE-DEPLOYMENT CHECKS:
[ ] Migrations created
[ ] Tests passed
[ ] Environment variables set
[ ] SSL certificate valid
[ ] Database backup created

DEPLOYMENT STEPS:
[ ] Git tag created
[ ] Backend deployed
[ ] Frontend deployed
[ ] Migrations run
[ ] Static files collected
[ ] Smoke tests passed

POST-DEPLOYMENT:
[ ] Health check OK
[ ] Login works
[ ] API endpoints tested
[ ] Performance acceptable
[ ] No error logs

ROLLBACK PLAN:
If issues occur: eb deploy --version previous-version

NOTES:
_____________________________________
_____________________________________
```

---

## ✅ Final Production Checklist

**Security:**
- [ ] `DEBUG=False`
- [ ] Strong `SECRET_KEY`
- [ ] HTTPS enabled
- [ ] CORS restricted
- [ ] Database password strong
- [ ] No sensitive data in git

**Performance:**
- [ ] Static files on CDN
- [ ] Database indexed
- [ ] Caching enabled
- [ ] Gzip compression on

**Reliability:**
- [ ] Database backups configured
- [ ] Error tracking enabled
- [ ] Logging configured
- [ ] Health checks passing

**Compliance:**
- [ ] Privacy policy added
- [ ] Terms of service added
- [ ] Cookie consent (if EU users)
- [ ] GDPR compliance (if applicable)

---

## 🎉 You're Ready to Deploy!

**Your system is production-ready.** Follow the deployment option that fits your budget and requirements.

**Recommended for FYP:**
1. Deploy backend to **AWS Elastic Beanstalk** (student credit available)
2. Deploy frontend to **Vercel** (free)
3. Use **PostgreSQL** on AWS RDS (free tier db.t3.micro)
4. Set up **CloudWatch** for monitoring

**Support:** Check `SYSTEM_COMPREHENSIVE_AUDIT_FYP.md` for full system details.

---

**Last Updated:** November 25, 2025  
**Status:** ✅ Production Ready  
**Next:** Deploy and test!
