// News API Configuration
// This file contains configuration for various news sources

export const NEWS_CONFIG = {
  // NewsAPI.org - Free tier with 1000 requests/day
  // Get your API key from: https://newsapi.org/
  NEWS_API: {
    baseUrl: 'https://newsapi.org/v2',
    apiKey: import.meta.env.VITE_NEWS_API_KEY || '',
    endpoints: {
      topHeadlines: '/top-headlines',
      everything: '/everything',
      sources: '/sources'
    }
  },

  // RSS Feed Sources (Free)
  RSS_SOURCES: [
    {
      name: 'BBC Sport Football',
      url: 'https://feeds.bbci.co.uk/sport/football/rss.xml',
      category: 'International'
    },
    {
      name: 'ESPN Football',
      url: 'https://www.espn.com/espn/rss/soccer/news.rss',
      category: 'International'
    },
    {
      name: 'Goal.com',
      url: 'https://www.goal.com/en/feeds/news/news',
      category: 'International'
    },
    {
      name: 'CAF Media',
      url: 'https://www.cafonline.com/news',
      category: 'African'
    }
  ],

  // Football Keywords for Content Filtering
  FOOTBALL_KEYWORDS: [
    // International Leagues
    'Premier League', 'La Liga', 'Serie A', 'Bundesliga', 'Champions League',
    'Europa League', 'World Cup', 'Euro', 'Conference League',
    
    // African Football
    'AFCON', 'CAF', 'CHAN', 'African Champions League',
    
    // Kenyan Teams
    'Kenya', 'Gor Mahia', 'AFC Leopards', 'Tusker', 'Sofapaka', 
    'Kariobangi Sharks', 'Bandari', 'Wazito', 'Mathare United',
    
    // Major Clubs
    'Arsenal', 'Chelsea', 'Manchester United', 'Manchester City', 'Liverpool',
    'Real Madrid', 'Barcelona', 'Bayern Munich', 'PSG', 'Juventus', 'AC Milan',
    'Inter Milan', 'Atletico Madrid', 'Borussia Dortmund', 'Ajax', 'Porto',
    
    // Football Terms
    'transfer', 'signing', 'injury', 'suspension', 'goal', 'assist',
    'red card', 'yellow card', 'penalty', 'free kick', 'corner'
  ],

  // Content Categories
  CATEGORIES: {
    'Premier League': 'English Premier League news and updates',
    'La Liga': 'Spanish La Liga news and updates',
    'Serie A': 'Italian Serie A news and updates',
    'Bundesliga': 'German Bundesliga news and updates',
    'UEFA': 'Champions League, Europa League, and UEFA competitions',
    'African': 'CAF competitions and African football news',
    'Kenyan': 'Kenyan Premier League and local football news',
    'Transfer News': 'Player transfers and signing updates',
    'Player News': 'Player injuries, suspensions, and personal updates',
    'Match Report': 'Match results and analysis',
    'General': 'General football news and updates'
  },

  // Source Credibility Scores
  SOURCE_CREDIBILITY: {
    'BBC Sport': 95,
    'ESPN': 90,
    'Goal.com': 85,
    'Sky Sports': 90,
    'The Guardian': 88,
    'CAF Media': 80,
    'NewsAPI': 75
  },

  // Update Intervals (in minutes)
  UPDATE_INTERVALS: {
    breaking: 5,    // Breaking news
    live: 15,       // Live updates
    regular: 60,    // Regular updates
    daily: 1440     // Daily digest
  }
};

// How to get free API keys:
export const API_SETUP_GUIDE = {
  NEWS_API: {
    url: 'https://newsapi.org/',
    steps: [
      '1. Visit https://newsapi.org/',
      '2. Click "Get API Key"',
      '3. Sign up for free account',
      '4. Copy your API key',
      '5. Add to .env file: VITE_NEWS_API_KEY=your_key_here'
    ],
    limits: 'Free tier: 1,000 requests/day',
    features: 'Top headlines, everything endpoint, sources'
  },
  
  FOOTBALL_DATA: {
    url: 'https://www.football-data.org/',
    steps: [
      '1. Visit https://www.football-data.org/',
      '2. Click "Get API Key"',
      '3. Sign up for free account',
      '4. Copy your API key',
      '5. Add to .env file: VITE_FOOTBALL_DATA_API_KEY=your_key_here'
    ],
    limits: 'Free tier: 10 requests/minute',
    features: 'Live scores, fixtures, standings, team data'
  },
  
  MEDIASTACK: {
    url: 'https://mediastack.com/',
    steps: [
      '1. Visit https://mediastack.com/',
      '2. Click "Get Free API Key"',
      '3. Sign up for free account',
      '4. Copy your API key',
      '5. Add to .env file: VITE_MEDIASTACK_API_KEY=your_key_here'
    ],
    limits: 'Free tier: 500 requests/month',
    features: 'News headlines, sports news, multiple languages'
  }
};

export default NEWS_CONFIG;
