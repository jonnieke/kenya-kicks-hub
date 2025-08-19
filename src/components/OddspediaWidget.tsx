import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw, ExternalLink, TrendingUp, Target, Zap } from 'lucide-react';
import { OddspediaClient, OddspediaWidgets, OddspediaMatch } from '@/integrations/oddspedia/client';
import { toast } from 'sonner';
import FallbackBettingWidget from './FallbackBettingWidget';

interface OddspediaWidgetProps {
  type: 'live-match' | 'league-table' | 'team-stats' | 'live-odds' | 'match-prediction';
  matchId?: string;
  leagueId?: string;
  teamId?: string;
  title?: string;
  className?: string;
  showRefresh?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function OddspediaWidget({
  type,
  matchId,
  leagueId,
  teamId,
  title,
  className = '',
  showRefresh = true,
  autoRefresh = false,
  refreshInterval = 30000 // 30 seconds
}: OddspediaWidgetProps) {
  const widgetRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [widgetData, setWidgetData] = useState<any>(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 2;

  // Generate unique widget ID
  const widgetId = `oddspedia-${type}-${matchId || leagueId || teamId || Date.now()}`;

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    let timeoutId: NodeJS.Timeout;

    const loadWidget = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Set a timeout to prevent infinite loading
        timeoutId = setTimeout(() => {
          if (isLoading) {
            setError('Connection timeout - widget took too long to load');
            setIsLoading(false);
          }
        }, 15000); // 15 second timeout

        // Load Oddspedia script if not already loaded
        await OddspediaClient.loadWidgetScript();

        // Wait for DOM to be ready
        await new Promise(resolve => setTimeout(resolve, 100));

        // Initialize widget based on type
        let config;
        switch (type) {
          case 'live-match':
            if (!matchId) throw new Error('Match ID required for live match widget');
            config = OddspediaWidgets.liveMatch(matchId);
            break;
          case 'league-table':
            if (!leagueId) throw new Error('League ID required for league table widget');
            config = OddspediaWidgets.leagueTable(leagueId);
            break;
          case 'team-stats':
            if (!teamId) throw new Error('Team ID required for team stats widget');
            config = OddspediaWidgets.teamStats(teamId);
            break;
          case 'live-odds':
            config = OddspediaWidgets.liveOdds();
            break;
          case 'match-prediction':
            if (!matchId) throw new Error('Match ID required for match prediction widget');
            config = OddspediaWidgets.matchPrediction(matchId);
            break;
          default:
            throw new Error(`Unknown widget type: ${type}`);
        }

        // Initialize the widget
        OddspediaClient.initWidget(widgetId, config);

        // Set up auto-refresh if enabled
        if (autoRefresh) {
          intervalId = setInterval(() => {
            refreshWidget();
          }, refreshInterval);
        }

        clearTimeout(timeoutId);
        setIsLoading(false);
        setLastUpdated(new Date());
        toast.success(`${title || 'Widget'} loaded successfully`);

      } catch (err) {
        console.error('Error loading Oddspedia widget:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load widget';
        setError(errorMessage);
        
        // Retry logic
        if (retryCount < maxRetries) {
          setRetryCount(prev => prev + 1);
          setTimeout(() => {
            loadWidget();
          }, 2000 * (retryCount + 1)); // Exponential backoff
          return;
        }
        
        clearTimeout(timeoutId);
        setIsLoading(false);
        // Don't show toast error to avoid spam - just log it
        console.warn(`Widget failed to load after ${maxRetries} retries:`, errorMessage);
      }
    };

    const refreshWidget = () => {
      if (widgetRef.current) {
        // Re-initialize widget to refresh data
        loadWidget();
      }
    };

    loadWidget();

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [type, matchId, leagueId, teamId, widgetId, autoRefresh, refreshInterval, title]);

  const handleRefresh = () => {
    if (widgetRef.current) {
      setIsLoading(true);
      setError(null);
      setRetryCount(0);
      // Re-initialize widget
      OddspediaClient.loadWidgetScript().then(() => {
        let config;
        switch (type) {
          case 'live-match':
            config = OddspediaWidgets.liveMatch(matchId!);
            break;
          case 'league-table':
            config = OddspediaWidgets.leagueTable(leagueId!);
            break;
          case 'team-stats':
            config = OddspediaWidgets.teamStats(teamId!);
            break;
          case 'live-odds':
            config = OddspediaWidgets.liveOdds();
            break;
          case 'match-prediction':
            config = OddspediaWidgets.matchPrediction(matchId!);
            break;
        }
        OddspediaClient.initWidget(widgetId, config);
        setIsLoading(false);
        setLastUpdated(new Date());
        toast.success('Widget refreshed successfully');
      }).catch((error) => {
        console.error('Error refreshing widget:', error);
        setError('Failed to refresh widget');
        setIsLoading(false);
      });
    }
  };

  const getWidgetIcon = () => {
    switch (type) {
      case 'live-match':
        return <Target className="w-5 h-5" />;
      case 'league-table':
        return <TrendingUp className="w-5 h-5" />;
      case 'team-stats':
        return <Zap className="w-5 h-5" />;
      case 'live-odds':
        return <TrendingUp className="w-5 h-5" />;
      case 'match-prediction':
        return <Target className="w-5 h-5" />;
      default:
        return <Target className="w-5 h-5" />;
    }
  };

  const getWidgetDescription = () => {
    switch (type) {
      case 'live-match':
        return 'Live match statistics and odds';
      case 'league-table':
        return 'League standings with betting insights';
      case 'team-stats':
        return 'Team performance and statistics';
      case 'live-odds':
        return 'Real-time betting odds and updates';
      case 'match-prediction':
        return 'AI-powered match predictions';
      default:
        return 'Football data and insights';
    }
  };

  if (error) {
    return (
      <FallbackBettingWidget 
        title={title || 'Live Betting Data'}
        className={className}
        onRetry={handleRefresh}
      />
    );
  }

  return (
    <Card className={`bg-gradient-card border-primary/20 ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
              {getWidgetIcon()}
            </div>
            <div>
              <CardTitle className="text-lg font-bold">
                {title || getWidgetDescription()}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Powered by Oddspedia
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {showRefresh && (
              <Button
                onClick={handleRefresh}
                disabled={isLoading}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            )}
            <Badge variant="secondary" className="text-xs">
              {lastUpdated.toLocaleTimeString()}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gradient-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <TrendingUp className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Loading Live Betting Data</h3>
              <p className="text-muted-foreground mb-4">
                Connecting to Oddspedia for real-time odds and predictions...
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Establishing connection...</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Widget Container */}
            <div
              ref={widgetRef}
              id={widgetId}
              className="min-h-[300px] bg-background/50 rounded-lg border border-border p-4"
            >
              {/* Widget will be rendered here by Oddspedia */}
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <Target className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">Loading Oddspedia widget...</p>
                </div>
              </div>
            </div>

            {/* Footer with attribution */}
            <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
              <span>Data provided by Oddspedia</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-1 text-xs"
                onClick={() => window.open('https://widgets.oddspedia.com/', '_blank')}
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                Visit Oddspedia
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Specialized widget components for common use cases
export function LiveMatchWidget({ matchId, ...props }: { matchId: string } & Omit<OddspediaWidgetProps, 'type'>) {
  return (
    <OddspediaWidget
      type="live-match"
      matchId={matchId}
      title="Live Match Analysis"
      {...props}
    />
  );
}

export function LeagueTableWidget({ leagueId, ...props }: { leagueId: string } & Omit<OddspediaWidgetProps, 'type'>) {
  return (
    <OddspediaWidget
      type="league-table"
      leagueId={leagueId}
      title="League Standings"
      {...props}
    />
  );
}

export function LiveOddsWidget(props: Omit<OddspediaWidgetProps, 'type'>) {
  return (
    <OddspediaWidget
      type="live-odds"
      title="Live Betting Odds"
      autoRefresh={true}
      refreshInterval={30000}
      {...props}
    />
  );
}

export function MatchPredictionWidget({ matchId, ...props }: { matchId: string } & Omit<OddspediaWidgetProps, 'type'>) {
  return (
    <OddspediaWidget
      type="match-prediction"
      matchId={matchId}
      title="Match Predictions"
      {...props}
    />
  );
}
