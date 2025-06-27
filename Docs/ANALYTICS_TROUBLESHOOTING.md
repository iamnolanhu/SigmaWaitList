# Google Analytics Troubleshooting Guide

## Quick Diagnostics

### Step 1: Check Environment Variable
Open your browser console on the live site and run:
```javascript
console.log('GA_MEASUREMENT_ID:', import.meta.env.VITE_GA_MEASUREMENT_ID)
```

### Step 2: Check Analytics Status
Run this in the browser console:
```javascript
window.sigmaAnalytics?.getStatus()
```

This will show you:
- ✅ Production mode status
- ✅ GA Measurement ID presence
- ✅ Initialization status
- ✅ Script loading status

### Step 3: Test Event Tracking
Run this to test if events are working:
```javascript
window.sigmaAnalytics?.trackTest()
```

## Common Issues & Solutions

### Issue 1: Environment Variable Not Set
**Symptoms:** GA_MEASUREMENT_ID shows as "Not set"

**Solution:**
1. Add to your deployment environment variables (Vercel/Netlify):
   ```
   VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   ```
2. Redeploy your site
3. Verify the variable is available in production

### Issue 2: Not in Production Mode
**Symptoms:** `isProduction: false` in status check

**Solution:**
- Only works on deployed sites (not localhost)
- Check that your domain doesn't contain 'localhost', '127.0.0.1', or '.local'

### Issue 3: GA Script Not Loading
**Symptoms:** `hasGtagFunction: false` and `hasDataLayer: false`

**Solution:**
1. Check browser network tab for blocked requests
2. Disable ad blockers temporarily
3. Check if your domain is on any blocklists

### Issue 4: Real-time Data Not Showing
**Symptoms:** Events tracked but no data in GA4

**Possible Causes:**
- **Data delay:** GA4 can take 24-48 hours for some reports
- **Real-time only:** Check GA4 "Realtime" reports immediately after testing
- **Filters:** Check if you have filters that exclude your traffic

## Testing Checklist

### ✅ Pre-deployment
- [ ] GA4 property created
- [ ] Measurement ID copied (format: G-XXXXXXXXXX)
- [ ] Environment variable added to deployment platform
- [ ] Site redeployed after adding variable

### ✅ Post-deployment
- [ ] Open live site (not localhost)
- [ ] Open browser console and check status
- [ ] Submit waitlist form
- [ ] Check GA4 Realtime reports within 5 minutes
- [ ] Look for "sign_up" events in GA4

## Manual Testing Steps

1. **Visit your live site**
2. **Open browser console**
3. **Run status check:**
   ```javascript
   window.sigmaAnalytics.getStatus()
   ```
4. **Verify output:**
   ```javascript
   {
     isProduction: true,        // ✅ Should be true
     hasGAId: true,            // ✅ Should be true  
     gaIdValue: "G-XXXXXXXXXX", // ✅ Should show your ID
     isInitialized: true,      // ✅ Should be true
     hasGtagFunction: true,    // ✅ Should be true
     hasDataLayer: true        // ✅ Should be true
   }
   ```

5. **Test event tracking:**
   ```javascript
   window.sigmaAnalytics.trackTest()
   ```

6. **Submit waitlist form** (triggers sign_up event)

7. **Check GA4 Realtime reports** within 5 minutes

## GA4 Dashboard Setup

### Where to Check for Data:
1. **Realtime Reports** - Shows activity in last 30 minutes
   - Go to Reports > Realtime
   - Look for "Event count by Event name"
   - Should see: page_view, sign_up, video_interaction

2. **Events Report** - Shows all events (may have delay)
   - Go to Reports > Engagement > Events
   - Look for custom events we're tracking

3. **Debug View** (if needed)
   - Enable debug mode in GA4
   - See events as they happen

## Still Not Working?

### Double-check these:
1. **Correct Measurement ID format:** Must start with `G-`
2. **Environment variable name:** Must be exactly `VITE_GA_MEASUREMENT_ID`
3. **Deployment platform:** Variable added to production environment
4. **Ad blockers:** Temporarily disable to test
5. **Browser extensions:** Some extensions block analytics

### Contact Information:
If analytics still isn't working after following this guide:
1. Run the diagnostic commands above
2. Screenshot the console output
3. Check your GA4 property configuration
4. Verify your domain is correctly set up in GA4

---

**Note:** Analytics events in development (localhost) are only logged to console and not sent to GA4. This is intentional to avoid polluting your production data.