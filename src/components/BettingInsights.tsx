import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Zap, 
  DollarSign, 
  Users, 
  AlertTriangle,
  CheckCircle,
  Crown,
  ExternalLink
} from "lucide-react";
import { useState, useEffect } from "react";
import { OddspediaClient } from "@/integrations/oddspedia/client";

interface BettingTip {
  id: string;
  match: string;
  tip: string;
  confidence: number;
  odds: number;
  potential_return: number;
  reasoning: string;
  category: 'safe' | 'medium' | 'risky';
  league: string;
  match_time: string;
}

interface MarketMovement {
  match: string;
  market: string;
  previous_odds: number;
  current_odds: number;
  movement: 'up' | 'down';
  percentage_change: number;
  volume: number;
}

const BettingInsights = () => {
  const [activeTab, setActiveTab] = useState("tips");
  const [bettingTips, setBettingTips] = useState<BettingTip[]>([]);
  const [marketMovements, setMarketMovements] = useState<MarketMovement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBettingInsights();
  }, []);

  const fetchBettingInsights = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual Oddspedia API calls
      const mockTips: BettingTip[] = [
        {
          id: "1",
          match: "Arsenal vs Chelsea",
          tip: "Over 2.5 Goals",
          confidence: 85,
          odds: 1.75,
          potential_return: 175,
          reasoning: "Both teams average 2.8 goals per game in recent fixtures. Arsenal's attacking form at home is excellent.",
          category: 'safe',
          league: "Premier League",
          match_time: "2024-01-15 15:00"
        },
        {
          id: "2",
          match: "Manchester City vs Liverpool",
          tip: "Both Teams to Score",
          confidence: 92,
          odds: 1.50,
          potential_return: 150,
          reasoning: "Historical head-to-head shows 89% of matches have both teams scoring. Both have strong attacking records.",
          category: 'safe',
          league: "Premier League",
          match_time: "2024-01-15 17:30"
        },
        {
          id: "3",
          match: "Gor Mahia vs AFC Leopards",
          tip: "Gor Mahia Win",
          confidence: 78,
          odds: 2.10,
          potential_return: 210,
          reasoning: "Gor Mahia unbeaten at home in last 8 matches. Strong squad depth and recent form advantage.",
          category: 'medium',
          league: "FKF Premier League",
          match_time: "2024-01-14 15:00"
        }
      ];

      const mockMovements: MarketMovement[] = [
        {
          match: "Arsenal vs Chelsea",
          market: "Match Winner - Arsenal",
          previous_odds: 2.20,
          current_odds: 1.95,
          movement: 'down',
          percentage_change: -11.4,
          volume: 85000
        },
        {
          match: "Barcelona vs Real Madrid",
          market: "Over 2.5 Goals",
          previous_odds: 1.60,
          current_odds: 1.75,
          movement: 'up',
          percentage_change: 9.4,
          volume: 120000
        }
      ];

      setBettingTips(mockTips);
      setMarketMovements(mockMovements);
    } catch (error) {
      console.error('Error fetching betting insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'safe': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'risky': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'safe': return <CheckCircle className="w-4 h-4" />;
      case 'medium': return <Target className="w-4 h-4" />;
      case 'risky': return <AlertTriangle className="w-4 h-4" />;
      default: return <Zap className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Betting Insights</h2>
            <p className="text-muted-foreground">Expert tips powered by Oddspedia data</p>
          </div>
        </div>
        <Badge variant="secondary" className="gap-2">
          <Crown className="w-4 h-4" />
          Premium Feature
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tips">Betting Tips</TabsTrigger>
          <TabsTrigger value="movements">Market Movements</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="tips" className="space-y-4">
          <div className="grid gap-4">
            {bettingTips.map((tip) => (
              <Card key={tip.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className={getCategoryColor(tip.category)}>
                        {getCategoryIcon(tip.category)}
                        {tip.category.toUpperCase()}
                      </Badge>
                      <Badge variant="outline">{tip.league}</Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Odds</div>
                      <div className="font-semibold text-lg">{tip.odds}</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg">{tip.match}</h3>
                    <p className="text-muted-foreground text-sm">{tip.match_time}</p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-blue-900">Recommended Bet</h4>
                      <Badge variant="secondary">{tip.confidence}% Confidence</Badge>
                    </div>
                    <p className="text-blue-800 font-medium text-lg">{tip.tip}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Confidence Level</span>
                      <span>{tip.confidence}%</span>
                    </div>
                    <Progress value={tip.confidence} className="h-2" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-green-50 p-3 rounded-lg">
                      <div className="text-green-600 font-medium">Potential Return</div>
                      <div className="text-green-800 font-semibold">KES {tip.potential_return}</div>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="text-blue-600 font-medium">Stake</div>
                      <div className="text-blue-800 font-semibold">KES 100</div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h5 className="font-medium text-gray-900 mb-1">Analysis</h5>
                    <p className="text-gray-700 text-sm">{tip.reasoning}</p>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Place Bet
                    </Button>
                    <Button size="sm" variant="outline">
                      Share Tip
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="movements" className="space-y-4">
          <div className="grid gap-4">
            {marketMovements.map((movement, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{movement.match}</h3>
                      <p className="text-sm text-muted-foreground">{movement.market}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        {movement.movement === 'up' ? (
                          <TrendingUp className="w-4 h-4 text-green-600" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-600" />
                        )}
                        <span className={`font-semibold ${
                          movement.movement === 'up' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {movement.percentage_change > 0 ? '+' : ''}{movement.percentage_change}%
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {movement.previous_odds} → {movement.current_odds}
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Volume: {movement.volume.toLocaleString()} bets
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Success Rate</p>
                    <p className="text-2xl font-semibold text-green-600">78%</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg. Odds</p>
                    <p className="text-2xl font-semibold">1.85</p>
                  </div>
                  <Target className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">ROI</p>
                    <p className="text-2xl font-semibold text-green-600">+23%</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BettingInsights;
