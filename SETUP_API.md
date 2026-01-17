# 🔑 Quick Setup Guide - OpenWeather API

## You're Almost There! Just 3 Steps:

### Step 1: Open the Configuration File
Open: `c:\Users\Royston\Desktop\Vaayu Saathi 2\js\config.js`

### Step 2: Add Your API Key
Find **line 5** (around there):
```javascript
API_KEY: 'YOUR_API_KEY_HERE',
```

Replace `'YOUR_API_KEY_HERE'` with your actual OpenWeather API key:
```javascript
API_KEY: 'abc123def456ghi789',  // ✅ Your real key here
```

### Step 3: Enable the API
Find **line 11** (around there):
```javascript
ENABLED: false
```

Change to:
```javascript
ENABLED: true
```

### Step 4: Save and Refresh
1. **Save** the `config.js` file (Ctrl+S)
2. **Refresh** your browser (F5 or Ctrl+F5)

## ✅ How to Verify It's Working

Open the browser's **Developer Console** (Press F12), then look for:

### If it's working correctly, you'll see:
```
✅ API Integration Wrapper loaded
📊 API Status: {enabled: true, configured: true, ...}
🌍 Fetching real-time air quality for Central Delhi...
✅ Real-time data loaded for Central Delhi (AQI: 185)
📡 Using REAL-TIME data for delhi
```

### If you see this, the API key isn't added yet:
```
⚠️ OpenWeather API not configured. Using simulated data.
🎲 Using SIMULATED data for delhi
```

## 🎯 What Gets Updated with Real Data

When the API is working, you'll see:
- ✅ **Real AQI values** from actual sensors
- ✅ **Real pollutant levels** (PM2.5, PM10, NO2, SO2, CO, O3)
- ✅ **Real weather data** (temperature, humidity, wind)
- ✅ **Real timestamps** showing when data was measured
- ✅ **Data updates every 5 minutes** automatically

## 🆓 Your Free API Limits

OpenWeather Free Tier:
- **60 calls per minute**
- **1,000,000 calls per month**
- **100% FREE** - no credit card required

With our smart caching (5 minutes):
- You'll use about **12 calls/hour**
- That's only **~9,000 calls/month**
- You have plenty of room!

## 🔧 Quick Troubleshooting

**Problem:** Still seeing simulated data?
- ✅ Check: Did you save config.js after editing?
- ✅ Check: Did you set ENABLED to true?
- ✅ Check: Did you hard refresh the browser? (Ctrl+F5)
- ✅ Check: Is your API key correct (no extra spaces)?

**Problem:** "Invalid API key" error?
- ⏰ New API keys take 10-15 minutes to activate
- ☕ Take a coffee break and try again!

**Problem:** CORS error?
-  OpenWeather supports CORS for browser requests
- This shouldn't happen with OpenWeather API

## 🎉 You're All Set!

Once you see the green checkmarks in the console, your dashboard is now running on **REAL, LIVE AIR QUALITY DATA** from OpenWeather! 

The system will automatically:
- ✅ Fetch fresh data every 5 minutes
- ✅ Fall back to simulated data if API is temporarily unavailable
- ✅ Cache data to minimize API calls
- ✅ Show you in the console when it's using real vs simulated data

---

**Questions?** Check the browser console - it shows detailed logs of what's happening!
