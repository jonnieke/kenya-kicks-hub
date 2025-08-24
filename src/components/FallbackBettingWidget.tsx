import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, Target, Zap, Star, ExternalLink, RefreshCw, Globe2 as Globe } from 'lucide-react';
import { motion } from 'framer-motion';

interface FallbackBettingWidgetProps {
  title?: string;
  className?: string;
  onRetry?: () => void;
}

export const FallbackBettingWidget = ({ 
  title = "Live Betting Insights", 
  className = "",
  onRetry 
}: FallbackBettingWidgetProps) => {
  // Mock betting data for demonstration
  const mockOdds = [
    { match: "Arsenal vs Chelsea", home: 2.10, draw: 3.40, away: 3.20, popular: "Over 2.5 Goals" },
    { match: "Man City vs Liverpool", home: 1.85, draw: 3.60, away: 4.10, popular: "Both Teams Score" },
    { match: "Gor Mahia vs AFC Leopards", home: 2.30, draw: 3.10, away: 3.50, popular: "Under 2.5 Goals" }
  ];

  const popularBets = [
    { type: "Over 2.5 Goals", odds: 1.85, confidence: "High" },
    { type: "Both Teams Score", odds: 1.95, confidence: "Medium" },
    { type: "Home Win", odds: 2.10, confidence: "High" },
    { type: "Draw", odds: 3.40, confidence: "Low" }
  ];

  return (
    <Card className={`bg-gradient-card border-primary/20 shadow-card ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-background" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold">{title}</CardTitle>
              <p className="text-sm text-muted-foreground">
                Live odds and betting insights
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="text-xs">
            Demo Mode
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Live Match Odds */}
        <div>
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            Live Match Odds
          </h4>
          <div className="space-y-3">
            {mockOdds.map((match, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-background/50 p-3 rounded-lg border border-border/20"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{match.match}</span>
                  <Badge variant="outline" className="text-xs">
                    {match.popular}
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-primary/10 p-2 rounded">
                    <div className="text-xs text-muted-foreground">Home</div>
                    <div className="font-bold text-primary">{match.home}</div>
                  </div>
                  <div className="bg-accent/10 p-2 rounded">
                    <div className="text-xs text-muted-foreground">Draw</div>
                    <div className="font-bold text-accent">{match.draw}</div>
                  </div>
                  <div className="bg-primary/10 p-2 rounded">
                    <div className="text-xs text-muted-foreground">Away</div>
                    <div className="font-bold text-primary">{match.away}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Popular Bets */}
        <div>
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-500" />
            Popular Bets Today
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {popularBets.map((bet, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="bg-background/50 p-3 rounded-lg border border-border/20 text-center"
              >
                <div className="font-semibold text-sm mb-1">{bet.type}</div>
                <div className="text-lg font-bold text-primary mb-1">{bet.odds}</div>
                <Badge 
                  variant={bet.confidence === "High" ? "default" : bet.confidence === "Medium" ? "secondary" : "outline"}
                  className="text-xs"
                >
                  {bet.confidence} Confidence
                </Badge>
              </motion.div>
            ))}
          </div>
        </div>

                            {/* Betting Tips */}
                    <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-4 rounded-lg border border-blue-200/20">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-blue-500" />
                        Today's Betting Tips
                      </h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• Arsenal vs Chelsea: High-scoring match expected</li>
                        <li>• Man City strong at home this season</li>
                        <li>• Gor Mahia vs AFC Leopards: Local derby intensity</li>
                        <li>• Consider accumulator bets for better value</li>
                      </ul>
                    </div>

                    {/* Domain Requirement Notice */}
                    <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 p-4 rounded-lg border border-orange-200/20">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Globe className="w-4 h-4 text-orange-500" />
                        Oddspedia Widget Requirements
                      </h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Oddspedia widgets only work on registered domains. For development and testing, 
                        you're seeing this fallback content. When deployed to <strong>ballmtaani.com</strong>, 
                        the live widgets will automatically load.
                      </p>
                      <p className="text-xs text-muted-foreground">
                        <strong>Note:</strong> The domain must be registered with Oddspedia and comply with their logo requirements.
                      </p>
                    </div>

                            {/* Action Buttons */}
                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <div className="text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                          Domain: ballmtaani.com required
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {onRetry && (
                          <Button onClick={onRetry} variant="outline" size="sm">
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Retry
                          </Button>
                        )}
                        <Button 
                          variant="default" 
                          size="sm"
                          onClick={() => window.open('https://widgets.oddspedia.com/obligations#logo', '_blank')}
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View Requirements
                        </Button>
                      </div>
                    </div>
      </CardContent>
    </Card>
  );
};

export default FallbackBettingWidget;
