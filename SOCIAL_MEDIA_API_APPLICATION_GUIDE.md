# Social Media API Application Guide
**Complete guide for applying to Facebook, Instagram, and TikTok APIs**

---

## 📋 Overview

Your Tourism Analytics Dashboard currently has:
- ✅ **Twitter/X API** - Already integrated and working
- ❌ **Facebook API** - Not yet applied
- ❌ **Instagram API** - Not yet applied (uses Facebook API)
- ❌ **TikTok API** - Not yet applied

**Estimated Time:** 2-4 weeks for all approvals combined  
**Cost:** All platforms offer free tiers for research/educational projects

---

## 1️⃣ Facebook & Instagram API (Meta Platform)

### Why Apply?
- Instagram uses Facebook's Graph API (same platform)
- Access to public posts, hashtags, and engagement metrics
- Essential for tourism analytics (most visual content on Instagram)

### 📝 Application Steps

#### Step 1: Create Meta Developer Account
1. Go to [https://developers.facebook.com/](https://developers.facebook.com/)
2. Click **"Get Started"** (top right)
3. Log in with your Facebook account
4. Complete the registration form:
   - Full Name
   - Email (use your university email for better approval chances)
   - Category: **"Academic/Research"** or **"Business"**

#### Step 2: Create a New App
1. From Meta Developer Dashboard, click **"Create App"**
2. Select use case: **"Business"** or **"Other"**
3. App Details:
   - **App Name:** "Tourism Analytics Dashboard" or "Kedah Tourism Research"
   - **App Contact Email:** Your university email
   - **Business Manager Account:** Create new or skip for now
4. Click **"Create App"**

#### Step 3: Add Products to Your App
1. In app dashboard, find **"Add Products"** section
2. Add these products:
   - **Facebook Login** (required)
   - **Instagram Graph API** (for Instagram data)
   - **Instagram Basic Display** (for public content)

#### Step 4: Configure App Settings
1. Go to **Settings → Basic**
2. Fill in:
   - **Privacy Policy URL:** Create a simple page (example below)
   - **Terms of Service URL:** Optional but recommended
   - **App Domain:** `localhost` (for development) or your domain
   - **Category:** "Education" or "Business/Productivity"

#### Step 5: Get Access Tokens

**For Development (Temporary Token):**
1. Go to **Tools → Graph API Explorer**
2. Select your app from dropdown
3. Click **"Generate Access Token"**
4. Select permissions:
   - `pages_read_engagement`
   - `pages_show_list`
   - `instagram_basic`
   - `instagram_manage_insights`
   - `public_profile`
5. Copy the token → Add to `backend/config.py`

**For Production (Long-lived Token):**
```bash
curl -i -X GET "https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=YOUR_APP_ID&client_secret=YOUR_APP_SECRET&fb_exchange_token=SHORT_LIVED_TOKEN"
```

#### Step 6: Request App Review (Optional but Recommended)
1. Go to **App Review → Permissions and Features**
2. Request these permissions:
   - `pages_read_engagement` - For Facebook page insights
   - `instagram_basic` - For Instagram public content
   - `instagram_manage_insights` - For Instagram analytics
3. Provide:
   - **Use Case:** "Academic research project analyzing tourism trends in Kedah, Malaysia"
   - **Screenshots:** Dashboard screenshots showing how data is used
   - **Screen Recording:** 2-minute demo video showing the feature
   - **Privacy Policy:** Link to your privacy page

### 🔑 What You'll Get
- **App ID:** Your application identifier
- **App Secret:** Secret key (keep private!)
- **Access Token:** Token for API requests

### 📋 Privacy Policy Template
Create a simple HTML page at `privacy.html`:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Privacy Policy - Tourism Analytics Dashboard</title>
</head>
<body>
    <h1>Privacy Policy</h1>
    <p>Last updated: November 28, 2025</p>
    
    <h2>Data Collection</h2>
    <p>This application collects publicly available social media data for academic research purposes only. We analyze tourism-related posts to understand travel trends in Kedah, Malaysia.</p>
    
    <h2>Data Usage</h2>
    <ul>
        <li>Public posts are analyzed for sentiment and engagement metrics</li>
        <li>No personal data is stored or shared with third parties</li>
        <li>Data is used solely for tourism trend analysis</li>
    </ul>
    
    <h2>Data Storage</h2>
    <p>Aggregated statistics are stored in a secure database. Individual posts are not permanently stored.</p>
    
    <h2>Contact</h2>
    <p>Email: your-email@student.university.edu.my</p>
</body>
</html>
```

Host this on:
- GitHub Pages (free): `https://yourusername.github.io/privacy.html`
- Vercel/Netlify (free)
- Your university's server

---

## 2️⃣ TikTok API (TikTok for Developers)

### Why Apply?
- Fastest growing social media platform
- Rich short-form video content about tourism
- Younger demographic insights

### 📝 Application Steps

#### Step 1: Create TikTok Developer Account
1. Go to [https://developers.tiktok.com/](https://developers.tiktok.com/)
2. Click **"Register"** or **"Get Started"**
3. Log in with:
   - TikTok account (create one if needed)
   - OR email/phone number
4. Verify your email/phone

#### Step 2: Create an App
1. From developer portal, click **"Manage Apps"**
2. Click **"+ Connect an app"** or **"Create New App"**
3. Fill in app details:
   - **App Name:** "Tourism Analytics Dashboard"
   - **App Type:** **"Web App"** or **"Desktop App"**
   - **Category:** "Education" or "Business Tools"
   - **Description:** "Academic research project analyzing tourism trends through social media data"

#### Step 3: Configure App Settings
1. **Basic Information:**
   - App Icon: Upload your project logo (512x512px)
   - Privacy Policy URL: Use same as Facebook
   - Terms of Service URL: Optional

2. **Callback URLs:**
   - Development: `http://localhost:3000/callback`
   - Production: `https://yourdomain.com/callback`

#### Step 4: Request API Access
1. Go to **Products** tab
2. Apply for these APIs:
   - **Login Kit** (required for authentication)
   - **Display API** (for public video data)
   - **Research API** (for academic research - HIGHLY RECOMMENDED)

3. For **Research API Application:**
   - Institution: Your university name
   - Research Title: "Tourism Trend Analysis in Kedah, Malaysia"
   - Research Description: 
     ```
     This research project analyzes social media content to understand 
     tourism patterns, visitor sentiments, and popular attractions in 
     Kedah, Malaysia. The system collects publicly available TikTok 
     videos tagged with location-specific hashtags (#Langkawi, 
     #AlorSetar, etc.) and performs sentiment analysis to help local 
     tourism boards make data-driven decisions.
     ```
   - Expected Start Date: Current date
   - Expected End Date: 6-12 months later
   - Attach: Research proposal or FYP documentation

#### Step 5: Get API Credentials
Once approved:
1. Go to **Manage Apps → Your App**
2. Find **Client Key** and **Client Secret**
3. Copy to `backend/config.py`:
   ```python
   TIKTOK_CLIENT_KEY = "your_client_key_here"
   TIKTOK_CLIENT_SECRET = "your_client_secret_here"
   ```

### 🎯 TikTok Research API (Best for Academic Projects)
If approved for Research API, you get:
- Access to historical data (up to 30 days)
- Higher rate limits (1000 requests/day vs 100/day)
- No authentication required for public data
- Better for academic research

**Application Requirements:**
- University email address (.edu domain)
- Research proposal or FYP documentation
- Professor/supervisor endorsement (optional but helpful)

---

## 📊 API Comparison Table

| Platform | Approval Time | Rate Limits | Best For | Educational Support |
|----------|--------------|-------------|----------|---------------------|
| **Twitter/X** | ✅ Instant | 10-100 tweets/request | Real-time trends, text analysis | ⭐⭐⭐ Free tier |
| **Facebook** | 1-2 weeks | 200 calls/hour | Page insights, demographics | ⭐⭐ App review needed |
| **Instagram** | 1-2 weeks | 200 calls/hour | Visual content, hashtags | ⭐⭐⭐ Good for tourism |
| **TikTok** | 2-4 weeks | 100-1000/day | Short videos, younger audience | ⭐⭐⭐ Research API available |

---

## 🚀 Quick Start After Approval

### 1. Update `backend/config.py`
```python
# ✅ Facebook & Instagram API Keys
FACEBOOK_ACCESS_TOKEN = "YOUR_FACEBOOK_TOKEN_HERE"
FACEBOOK_APP_ID = "YOUR_APP_ID"
FACEBOOK_APP_SECRET = "YOUR_APP_SECRET"

# ✅ TikTok API Keys
TIKTOK_CLIENT_KEY = "YOUR_CLIENT_KEY_HERE"
TIKTOK_CLIENT_SECRET = "YOUR_CLIENT_SECRET_HERE"
```

### 2. Install Required Libraries
```bash
cd backend
pip install facebook-sdk tiktokapipy
```

### 3. Test API Connections
```bash
cd backend
python check_scraping_status.py
```

Expected output:
```
✅ Twitter API connected successfully!
✅ Facebook API connected successfully!
✅ TikTok API connected successfully!
```

---

## 💡 Tips for Faster Approval

### General Tips
1. ✅ **Use university email** (.edu domain) - shows academic legitimacy
2. ✅ **Provide detailed use case** - explain the tourism research clearly
3. ✅ **Upload screenshots** - show working dashboard with demo data
4. ✅ **Create privacy policy** - required by all platforms
5. ✅ **Mention FYP/thesis** - academic projects get priority

### Facebook/Instagram Specific
- Mention "Public Content Access" in use case
- Emphasize "publicly available data only"
- Provide university supervisor's name if asked
- Show you're NOT collecting personal user data

### TikTok Specific
- Apply for **Research API** (not commercial API)
- Attach FYP proposal or research abstract
- Mention "tourism analytics" and "sentiment analysis"
- Reference academic publications if available

---

## ⚠️ Common Issues & Solutions

### Issue: Facebook App Review Rejected
**Solution:**
- Provide clearer use case description
- Add detailed screen recording (2-3 minutes)
- Explain you're only using PUBLIC data
- Mention it's for educational/research purposes

### Issue: TikTok Application Pending for Weeks
**Solution:**
- Email TikTok support: developer@tiktok.com
- Reference your application ID
- Attach university verification letter
- Ask for Research API (faster approval)

### Issue: Instagram API Not Working
**Solution:**
- Instagram uses Facebook Graph API
- Need to connect Instagram Business/Creator account
- Use Facebook Login first, then access Instagram
- Check app is in "Live" mode, not "Development"

---

## 📧 Application Email Templates

### For University Supervisor Support Letter

**Subject:** Request for Research Project Support Letter

```
Dear Professor [Name],

I am working on my Final Year Project titled "Tourism Analytics Dashboard 
for Kedah, Malaysia" which involves analyzing social media data to understand 
tourism trends.

To access TikTok's Research API and Facebook's Graph API for academic purposes, 
I need a brief support letter confirming:
- My student status
- The research project title
- Your supervision of this project

Would you be able to provide a short letter (on university letterhead if possible)?

Thank you for your support.

Best regards,
[Your Name]
[Student ID]
```

### For TikTok Research API Support

**Send to:** developer@tiktok.com  
**Subject:** Research API Application - Tourism Analytics Project

```
Dear TikTok Developer Support,

I have submitted an application for the TikTok Research API (Application ID: XXXXX) 
for my Final Year Project at [University Name].

Project Details:
- Title: Tourism Analytics Dashboard for Kedah, Malaysia
- Purpose: Analyzing public social media content to understand tourism trends
- Duration: [Start Date] to [End Date]
- Supervisor: [Professor Name]

I have attached:
1. Research proposal
2. University verification letter
3. Dashboard screenshots

Could you please expedite the review process or provide an estimated timeline?

Best regards,
[Your Name]
[University Email]
[Student ID]
```

---

## 🎯 Implementation Roadmap

### Phase 1: Facebook & Instagram (Week 1-2)
- [ ] Create Meta Developer account
- [ ] Create app and configure settings
- [ ] Get temporary access token
- [ ] Test API with demo queries
- [ ] Submit app for review (optional)

### Phase 2: TikTok (Week 2-4)
- [ ] Create TikTok Developer account
- [ ] Create app and configure
- [ ] Apply for Research API
- [ ] Get supervisor support letter
- [ ] Wait for approval (2-4 weeks)

### Phase 3: Integration (After Approvals)
- [ ] Update `config.py` with all API keys
- [ ] Install required Python libraries
- [ ] Update `scraper.py` with new platform methods
- [ ] Test all platforms
- [ ] Update frontend to show all 4 platforms
- [ ] Run full data collection

---

## 📚 Helpful Resources

### Documentation
- **Facebook Graph API:** https://developers.facebook.com/docs/graph-api/
- **Instagram Graph API:** https://developers.facebook.com/docs/instagram-api/
- **TikTok Research API:** https://developers.tiktok.com/doc/research-api-get-started/
- **TikTok Display API:** https://developers.tiktok.com/doc/display-api-get-started/

### Tutorials
- Meta for Developers YouTube: https://www.youtube.com/@MetaforDevelopers
- TikTok Developer Portal: https://developers.tiktok.com/
- Graph API Explorer (testing): https://developers.facebook.com/tools/explorer/

### Community Support
- Meta Developer Community: https://developers.facebook.com/community/
- TikTok Developer Forum: https://developers.tiktok.com/community
- Stack Overflow: Tag your questions with [facebook-graph-api] or [tiktok-api]

---

## ✅ Next Steps

1. **Start with Facebook/Instagram** (easier approval):
   ```bash
   # Open in browser
   https://developers.facebook.com/
   ```

2. **Apply for TikTok Research API** (takes longer):
   ```bash
   # Open in browser
   https://developers.tiktok.com/
   ```

3. **Prepare documents:**
   - Privacy policy page
   - Research proposal/FYP abstract
   - Dashboard screenshots
   - Demo video (2-3 minutes)

4. **Get supervisor support:**
   - Request support letter
   - Get email confirmation
   - Include in applications

5. **Monitor applications:**
   - Check email daily
   - Respond to requests within 24-48 hours
   - Follow up after 1 week if no response

---

## 💰 Cost Breakdown (All FREE for Research)

| Platform | Free Tier | Paid Tier | Academic Pricing |
|----------|-----------|-----------|------------------|
| Twitter/X | 100 tweets/request | $100/month for more | Free (Essential tier) |
| Facebook | 200 calls/hour | Enterprise only | Free (App Review) |
| Instagram | 200 calls/hour | Enterprise only | Free (same as Facebook) |
| TikTok | 100 videos/day | 1000 videos/day | FREE Research API |

**Total Cost for Your Project: $0** 🎉

---

## 📞 Need Help?

If you encounter issues during application:

1. **Check developer forums** - Most issues already answered
2. **Email platform support** - Response time: 2-5 business days
3. **Update me** - I can help troubleshoot configuration issues

**Good luck with your applications! 🚀**

---

*Last Updated: November 28, 2025*
*Tourism Analytics Dashboard - FYP Project*
