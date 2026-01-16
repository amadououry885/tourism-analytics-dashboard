# 📍 WHERE TO FIND: Sentiment Comparison Dashboard

## 🎯 Location: Overview Page (Top Section)

### Step-by-Step Guide:

1. **Start the servers:**
   ```bash
   # Terminal 1 - Backend
   cd backend
   python3 manage.py runserver 8000
   
   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

2. **Open your browser:**
   ```
   http://localhost:3000
   ```

3. **You'll see it RIGHT AT THE TOP after the metrics!**

---

## 📺 Visual Layout:

```
┌─────────────────────────────────────────────────────────────────┐
│  Kedah Tourism Analytics                        [Header Tabs]   │
│  Real-time insights and performance metrics                     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  [City Selector]                    [Last 7 Days ▼]  [🟢 Live] │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┬──────────────┬──────────────┬──────────────────┐
│ Total        │ Active       │ Avg Rating   │ Growth           │
│ Visitors     │ Places       │ ⭐ 4.2       │ ↗ +12.5%        │
└──────────────┴──────────────┴──────────────┴──────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ 📊 NEW: Sentiment Analysis Dashboard                           │
│ Compare visitor sentiment between most and least visited places │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                                                 │
│ 📊 Sentiment Analysis: Most vs Least Visited Places            │
│ Comparing visitor sentiment between top and bottom 33%         │
│                                                                 │
│ ┌──────────────────────────┐  ┌──────────────────────────┐   │
│ │ 📈 Most Visited          │  │ 📉 Least Visited         │   │
│ │ Places: 7                │  │ Places: 7                │   │
│ │ Avg Rating: 3.0 ⭐       │  │ Avg Rating: 3.0 ⭐       │   │
│ │ Total Posts: 58          │  │ Total Posts: 19          │   │
│ │ Avg Engagement: 106,698  │  │ Avg Engagement: 746      │   │
│ │                          │  │                          │   │
│ │ 😊 Positive: 0%          │  │ 😊 Positive: 0%          │   │
│ │ 😐 Neutral: 100%         │  │ 😐 Neutral: 100%         │   │
│ │ 😞 Negative: 0%          │  │ 😞 Negative: 0%          │   │
│ └──────────────────────────┘  └──────────────────────────┘   │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────┐   │
│ │      Sentiment Distribution Comparison                   │   │
│ │      [Interactive Bar Chart]                             │   │
│ └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│ ┌──────────────┐  ┌──────────────┐                            │
│ │ Most Visited │  │ Least Visited│                            │
│ │ [Pie Chart]  │  │ [Pie Chart]  │                            │
│ └──────────────┘  └──────────────┘                            │
│                                                                 │
│ 💡 Key Insights:                                               │
│ • Sentiment scores are similar across visit levels             │
│ • Most visited places average 106,698 engagement vs 746        │
│                                                                 │
│ 📋 Methodology:                                                │
│ Most Visited: ≥1,724 engagement points (top 33%)              │
│ Least Visited: ≤1,066 engagement points (bottom 33%)          │
└─────────────────────────────────────────────────────────────────┘
         ↑↑↑ THIS IS THE NEW FEATURE ↑↑↑

┌─────────────────────────────────────────────────────────────────┐
│ [Places] [Food] [Stay] [Transport] [Events] [Overview]         │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ Social Media Charts                                             │
│ [Platform breakdown charts]                                     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ Popular Destinations                                            │
│ [List of places with ratings]                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔍 What You Should See:

### **Prominent Blue Banner:**
```
┌─────────────────────────────────────────────────────────────┐
│ 📊 NEW: Sentiment Analysis Dashboard                       │
│ Compare visitor sentiment between most and least visited    │
│ places                                                      │
└─────────────────────────────────────────────────────────────┘
```
**Colors:** Blue gradient background with blue text

### **Then the Full Dashboard:**
- 2 side-by-side comparison cards (Most vs Least Visited)
- Bar chart comparing sentiment percentages
- 2 pie charts showing sentiment distribution
- AI-generated insights (bullet points)
- Methodology explanation

---

## 🎨 What Makes It Stand Out:

✅ **Large blue gradient banner** at the top  
✅ **"NEW:" prefix** to catch attention  
✅ **📊 Icon** for visual appeal  
✅ **Border highlight** (blue border around the section)  
✅ **Placed RIGHT after metrics** (very high on page)  

---

## 🚫 If You Still Don't See It:

### Quick Checks:

1. **Browser cache:**
   ```
   Press Ctrl+Shift+R (hard refresh)
   Or Cmd+Shift+R on Mac
   ```

2. **Check browser console:**
   ```
   F12 → Console tab
   Look for any red errors
   ```

3. **Verify servers are running:**
   ```bash
   # Backend should show:
   Starting development server at http://127.0.0.1:8000/
   
   # Frontend should show:
   Local:   http://localhost:3000/
   ```

4. **Check the URL:**
   ```
   Make sure you're at: http://localhost:3000/
   NOT http://localhost:3000/dashboard
   or any other route
   ```

5. **Scroll position:**
   ```
   The dashboard appears BEFORE you scroll
   It's in the top 1/3 of the page
   Right after the 4 metric cards
   ```

---

## 📱 Responsive Design:

- **Desktop:** 2 columns side by side
- **Tablet:** 2 columns, slightly narrower
- **Mobile:** Stacks to 1 column

---

## 🔗 Direct API Test:

If you still can't see it in the UI, test the API directly:

```bash
# Should return comparison data
curl http://localhost:8000/api/analytics/sentiment/comparison/ | jq

# Should return 200 OK with JSON
```

---

## 📸 Screenshot Locations:

You'll find the dashboard at these scroll positions:

1. **After metrics cards** (no scrolling needed on desktop)
2. **Before navigation tabs** (Places/Food/Stay/etc.)
3. **Before social media charts**

**Pixel position:** Approximately 300-400px from top of page

---

## ✅ Success Indicators:

You know it's working when you see:

1. ✅ Blue gradient banner with "NEW:" text
2. ✅ Two side-by-side cards (Most Visited vs Least Visited)
3. ✅ Numbers showing engagement (746,889 vs 5,222)
4. ✅ Bar chart with colored bars
5. ✅ Two pie charts below
6. ✅ "Key Insights" section with bullet points

---

## 🆘 Still Not Visible?

Run this command:

```bash
cd /home/amadou-oury-diallo/tourism-analytics-dashboard
grep -n "SentimentComparison" frontend/src/pages/Overview.tsx
```

Should show:
```
8:import { SentimentComparison } from '../components/SentimentComparison';
[line number]: <SentimentComparison />
```

If you see both lines, the component IS integrated! 

Just refresh your browser with **Ctrl+Shift+R** 🔄
