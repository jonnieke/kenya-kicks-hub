// Production Environment Configuration
// Copy these values to your production .env file

export const PRODUCTION_CONFIG = {
  // Supabase Configuration
  SUPABASE_URL: 'https://your-project.supabase.co',
  SUPABASE_ANON_KEY: 'your-anon-key-here',

  // News API Configuration
  NEWS_API_KEY: 'your-news-api-key-here',
  FOOTBALL_DATA_API_KEY: 'your-football-data-api-key-here',

  // Oddspedia Configuration
  ODDSPEDIA_DOMAIN: 'ballmtaani.com',

  // Google Services
  GOOGLE_ANALYTICS_ID: 'GA_MEASUREMENT_ID_HERE',
  GOOGLE_ADSENSE_ID: 'ca-pub-YOUR_PUBLISHER_ID_HERE',

  // Performance & Monitoring
  ENABLE_PERFORMANCE_MONITORING: true,
  ENABLE_ERROR_TRACKING: true,

  // CDN Configuration
  CDN_BASE_URL: 'https://cdn.ballmtaani.com',

  // Feature Flags
  ENABLE_PWA: true,
  ENABLE_OFFLINE_MODE: true,
  ENABLE_PUSH_NOTIFICATIONS: true,

  // Security
  ENABLE_CSP: true,
  ENABLE_HSTS: true,

  // Build Configuration
  NODE_ENV: 'production',
  BUILD_MODE: 'production'
};

// Environment variable mapping
export const getEnvVar = (key: string): string => {
  return import.meta.env[key] || PRODUCTION_CONFIG[key as keyof typeof PRODUCTION_CONFIG] || '';
};

// Production checks
export const isProduction = () => import.meta.env.PROD;
export const isDevelopment = () => import.meta.env.DEV;

// API endpoints
export const API_ENDPOINTS = {
  SUPABASE: getEnvVar('VITE_SUPABASE_URL'),
  NEWS_API: 'https://newsapi.org/v2',
  FOOTBALL_DATA: 'https://api.football-data.org/v4',
  ODDSPEDIA: 'https://widgets.oddspedia.com'
};

// CDN configuration
export const CDN_CONFIG = {
  BASE_URL: getEnvVar('VITE_CDN_BASE_URL'),
  IMAGES: `${getEnvVar('VITE_CDN_BASE_URL')}/images`,
  ASSETS: `${getEnvVar('VITE_CDN_BASE_URL')}/assets`
};
