# 🚀 AWS Elastic Beanstalk Deployment Guide

## ✅ Your Project is Ready for AWS!

### Current Configuration:
- **Application:** tourism-analytics
- **Environment:** tourism-analytics-env  
- **Region:** ap-southeast-1 (Singapore)
- **Platform:** Python 3.13 on Amazon Linux 2023

### Files Ready:
✅ Procfile - Gunicorn configuration
✅ .ebextensions/ - EB config files
✅ .elasticbeanstalk/config.yml - Environment settings
✅ backend/tourism_api/settings.py - Updated with AWS domains

---

## 📋 Deployment Steps

### 1. Install EB CLI (if not already done)
```bash
pip3 install awsebcli --user
export PATH=$PATH:~/.local/bin
```

### 2. Verify AWS Credentials
```bash
aws configure list
```
If not configured:
```bash
aws configure
# AWS Access Key ID: [Your AWS Key]
# AWS Secret Access Key: [Your AWS Secret]
# Default region: ap-southeast-1
# Default output format: json
```

### 3. Check Your EB Environment Status
```bash
cd /home/amadou-oury-diallo/tourism-analytics-dashboard
eb status
```

### 4. Deploy to AWS
```bash
eb deploy
```

### 5. Monitor Deployment
```bash
eb health --refresh    # Live health monitoring
eb logs                # View application logs
```

### 6. Get Your Backend URL
```bash
eb status | grep "CNAME"
```
Your backend will be at: `https://[CNAME]/api/`

---

## 🔧 Update Frontend After Deployment

Once deployed, update `frontend/src/services/api.ts`:

```typescript
const API_BASE_URL = import.meta.env.DEV 
  ? '/api' 
  : 'https://YOUR-EB-APP.ap-southeast-1.elasticbeanstalk.com/api';
```

Then deploy frontend to Vercel:
```bash
cd frontend
vercel --prod
```

---

## 🔍 Troubleshooting

**If deployment fails:**
```bash
eb logs                 # Check error logs
eb ssh                  # SSH into instance
eb config               # View/edit environment config
```

**Common Issues:**
1. Missing environment variables → Add via EB Console or `eb setenv`
2. Database migration needed → Enable .ebextensions/01_migrate.config
3. Static files → Run `python manage.py collectstatic`

**Set environment variables:**
```bash
eb setenv ENV=production \
          DJANGO_DEBUG=false \
          SECRET_KEY="your-secret-key" \
          ALLOWED_HOSTS=".elasticbeanstalk.com,.amazonaws.com" \
          CORS_ALLOWED_ORIGINS="https://tourism-analytics-dashboard.vercel.app"
```

---

## ✅ Post-Deployment Checklist

- [ ] Backend deployed to AWS EB
- [ ] Test backend URL: `https://your-app.elasticbeanstalk.com/api/overview-metrics/`
- [ ] Update frontend API_BASE_URL
- [ ] Deploy frontend to Vercel
- [ ] Test full application
- [ ] Check all routes working (28 endpoints)
- [ ] Verify CORS settings
- [ ] Monitor logs for errors

---

## 📊 Test Your Deployed Backend

```bash
curl https://your-app.elasticbeanstalk.com/api/overview-metrics/
curl https://your-app.elasticbeanstalk.com/api/analytics/places/popular/
curl https://your-app.elasticbeanstalk.com/api/sentiment/summary/
```

---

**Need help?** Check AWS EB Console or run `eb open` to open your app in browser.
