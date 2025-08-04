# AdSense Setup Guide

## Step 1: Apply for Google AdSense

1. Visit [Google AdSense](https://www.google.com/adsense/)
2. Sign up with your Google account
3. Add your website URL: `https://your-domain.com`
4. Wait for approval (can take 1-14 days)

## Step 2: Get Your Publisher ID

Once approved:
1. Go to your AdSense dashboard
2. Find your Publisher ID (starts with `ca-pub-`)
3. Replace `ca-pub-YOUR_PUBLISHER_ID` in these files:
   - `index.html` (line 21)
   - `src/components/AdSense.tsx` (line 35)
   - `src/config/adsense.ts` (line 6)

## Step 3: Create Ad Units

In your AdSense dashboard, create these ad units:

### Banner Ad (728x90)
- Name: "Homepage Banner"
- Size: 728x90 Leaderboard
- Copy the Ad Slot ID to replace `YOUR_BANNER_AD_SLOT`

### Sidebar Ad (300x600)
- Name: "Sidebar Skyscraper"  
- Size: 300x600 Half Page
- Copy the Ad Slot ID to replace `YOUR_SIDEBAR_AD_SLOT`

### In-Article Ad (300x250)
- Name: "In-Article Rectangle"
- Size: 300x250 Rectangle
- Copy the Ad Slot ID to replace `YOUR_IN_ARTICLE_AD_SLOT`

### Mobile Ad (320x50)
- Name: "Mobile Banner"
- Size: 320x50 Mobile Banner
- Copy the Ad Slot ID to replace `YOUR_MOBILE_AD_SLOT`

## Step 4: Update Configuration

Replace the placeholder values in `src/config/adsense.ts` with your actual:
- Publisher ID
- Ad Slot IDs

## Current Ad Placements

- **Homepage**: Banner ad below hero section
- **News Page**: Banner ad below news header
- **Live Scores**: Banner ad below header
- **All Pages**: Sidebar ads (when space available)

## Revenue Optimization Tips

1. **Ad Placement**: Ads are placed in high-visibility areas
2. **Responsive**: All ads adapt to mobile/desktop
3. **User Experience**: Ads don't disrupt core functionality
4. **Performance**: Ads load asynchronously to maintain speed

## Testing

- In development mode, you'll see placeholder ads
- Real ads only show in production with valid AdSense codes
- Use AdSense preview tool to test before going live

## Expected Revenue

With 5K+ monthly visitors:
- **Low Traffic**: $10-50/month
- **Medium Traffic**: $50-200/month  
- **High Engagement**: $200-500/month

Revenue depends on:
- Traffic volume
- User engagement
- Click-through rates
- Geographic location of visitors