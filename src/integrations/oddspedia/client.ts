// Oddspedia API Client and Widget Integration
// Documentation: https://widgets.oddspedia.com/

export interface OddspediaWidget {
  id: string;
  type: 'match' | 'league' | 'team' | 'odds' | 'live';
  config: Record<string, any>;
}

export interface OddspediaMatch {
  id: string;
  home_team: string;
  away_team: string;
  league: string;
  start_time: string;
  status: string;
  odds: {
    home: number;
    draw: number;
    away: number;
    over_under?: number;
  };
  predictions?: {
    home_win: number;
    draw: number;
    away_win: number;
  };
}

export interface OddspediaLeague {
  id: string;
  name: string;
  country: string;
  season: string;
  current_round?: number;
  total_rounds?: number;
}

export class OddspediaClient {
  private baseUrl = 'https://widgets.oddspedia.com';
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || '';
  }

  // Load Oddspedia widget script
  static loadWidgetScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.OddspediaWidgets) {
        resolve();
        return;
      }

      // Check if script is already being loaded
      if (document.querySelector('script[src*="oddspedia.com"]')) {
        // Wait for existing script to load
        const checkInterval = setInterval(() => {
          if (window.OddspediaWidgets) {
            clearInterval(checkInterval);
            resolve();
          }
        }, 100);
        
        // Timeout after 10 seconds
        setTimeout(() => {
          clearInterval(checkInterval);
          reject(new Error('Script loading timeout'));
        }, 10000);
        
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://widgets.oddspedia.com/widgets.js';
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Oddspedia widgets'));
      
      // Add timeout for script loading
      const timeout = setTimeout(() => {
        reject(new Error('Script loading timeout'));
      }, 10000);
      
      script.onload = () => {
        clearTimeout(timeout);
        resolve();
      };
      
      script.onerror = () => {
        clearTimeout(timeout);
        reject(new Error('Failed to load Oddspedia widgets'));
      };
      
      document.head.appendChild(script);
    });
  }

  // Initialize widget
  static initWidget(widgetId: string, config: Record<string, any>): void {
    if (window.OddspediaWidgets) {
      window.OddspediaWidgets.init(widgetId, config);
    }
  }

  // Get live matches with odds
  async getLiveMatches(): Promise<OddspediaMatch[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/live-matches`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.matches || [];
    } catch (error) {
      console.error('Error fetching live matches from Oddspedia:', error);
      return [];
    }
  }

  // Get match odds
  async getMatchOdds(matchId: string): Promise<OddspediaMatch | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/match-odds/${matchId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.match || null;
    } catch (error) {
      console.error('Error fetching match odds from Oddspedia:', error);
      return null;
    }
  }

  // Get league standings with odds
  async getLeagueStandings(leagueId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/league-standings/${leagueId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.standings || [];
    } catch (error) {
      console.error('Error fetching league standings from Oddspedia:', error);
      return [];
    }
  }

  // Get betting predictions
  async getBettingPredictions(matchId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/predictions/${matchId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.predictions || [];
    } catch (error) {
      console.error('Error fetching predictions from Oddspedia:', error);
      return [];
    }
  }
}

// Widget configurations for different use cases
export const OddspediaWidgets = {
  // Live match widget
  liveMatch: (matchId: string) => ({
    type: 'match',
    matchId,
    theme: 'dark',
    language: 'en',
    showOdds: true,
    showPredictions: true,
    showStatistics: true
  }),

  // League table widget
  leagueTable: (leagueId: string) => ({
    type: 'league',
    leagueId,
    theme: 'dark',
    language: 'en',
    showOdds: true,
    showForm: true,
    showGoals: true
  }),

  // Team statistics widget
  teamStats: (teamId: string) => ({
    type: 'team',
    teamId,
    theme: 'dark',
    language: 'en',
    showForm: true,
    showGoals: true,
    showOdds: true
  }),

  // Live odds widget
  liveOdds: () => ({
    type: 'odds',
    theme: 'dark',
    language: 'en',
    showLive: true,
    showUpcoming: true,
    refreshInterval: 30
  }),

  // Match prediction widget
  matchPrediction: (matchId: string) => ({
    type: 'prediction',
    matchId,
    theme: 'dark',
    language: 'en',
    showConfidence: true,
    showReasoning: true,
    showHistoricalData: true
  })
};

// Global type declaration for Oddspedia widgets
declare global {
  interface Window {
    OddspediaWidgets?: {
      init: (widgetId: string, config: Record<string, any>) => void;
    };
  }
}

export default OddspediaClient;
