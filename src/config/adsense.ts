// AdSense Configuration
// Replace these values with your actual AdSense publisher ID and ad slot IDs once approved

export const ADSENSE_CONFIG = {
  // Your AdSense publisher ID (starts with ca-pub-)
  publisherId: 'ca-pub-YOUR_PUBLISHER_ID',
  
  // Ad slot IDs for different placements
  adSlots: {
    banner: 'YOUR_BANNER_AD_SLOT',
    sidebar: 'YOUR_SIDEBAR_AD_SLOT',
    inArticle: 'YOUR_IN_ARTICLE_AD_SLOT',
    mobile: 'YOUR_MOBILE_AD_SLOT',
  },
  
  // Ad sizes (in pixels)
  adSizes: {
    banner: { width: 728, height: 90 },
    leaderboard: { width: 970, height: 250 },
    rectangle: { width: 300, height: 250 },
    sidebar: { width: 300, height: 600 },
    mobile: { width: 320, height: 50 },
  }
}

// Instructions for setup:
// 1. Apply for Google AdSense at https://www.google.com/adsense/
// 2. Once approved, replace 'YOUR_PUBLISHER_ID' with your actual publisher ID
// 3. Create ad units in your AdSense dashboard and replace the slot IDs
// 4. Update the script tag in index.html with your publisher ID