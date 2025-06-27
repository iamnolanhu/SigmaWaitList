# Analytics Setup Guide

## Vercel Analytics Setup

Vercel Analytics is now automatically configured and will work on Vercel deployments. No additional setup required.

### Features Enabled:
- **Page views tracking** - Automatic
- **User interaction tracking** - Automatic  
- **Performance monitoring** - Automatic via Speed Insights

## Google Analytics 4 Setup

### Step 1: Create GA4 Property

1. Go to [Google Analytics](https://analytics.google.com/)
2. Create a new GA4 property for your website
3. Copy your **Measurement ID** (format: `G-XXXXXXXXXX`)

### Step 2: Add GA4 to Environment Variables

Add to your `.env` file:
```env
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### Step 3: Deploy and Test

1. Deploy your site to production
2. Visit your live site (not localhost)
3. Check GA4 Real-time reports to see traffic

## What's Being Tracked

### Automatic Tracking:
- **Page views** - When users visit the site
- **Scroll depth** - How far users scroll
- **Site engagement** - Time on site, bounce rate

### Custom Events:
- **Waitlist signups** - When users join the waitlist
- **Video interactions** - Play, pause, mute, unmute
- **Navigation clicks** - Features, Team sections
- **Form errors** - Waitlist form validation errors

### Vercel Analytics Events:
- **Page performance** - Load times, web vitals
- **User location** - Country/region data
- **Device information** - Mobile vs desktop usage

## Testing Analytics

### Development Mode:
- Analytics events are logged to browser console
- No data sent to GA4 (localhost excluded)
- Vercel Analytics disabled in development

### Production Mode:
- All events tracked to GA4
- Vercel Analytics active
- Real-time data visible in dashboards

## Troubleshooting

### GA4 Not Working:
1. Check if `VITE_GA_MEASUREMENT_ID` is set correctly
2. Ensure you're testing on the live site (not localhost)
3. Check browser dev tools for GA4 script loading
4. Verify Measurement ID format: `G-XXXXXXXXXX`

### Vercel Analytics Not Working:
1. Ensure site is deployed to Vercel
2. Check Vercel dashboard for analytics data
3. May take 24-48 hours for initial data to appear

### Debug Mode:
Open browser console on live site to see:
- Analytics initialization messages
- Event tracking confirmations
- Any error messages

## Privacy Compliance

- GA4 configured with privacy-friendly defaults
- No personal data collected in custom events
- Vercel Analytics is GDPR compliant by default
- Consider adding cookie consent banner for EU users

---

**Need Help?** Check the browser console for debug messages or contact support.