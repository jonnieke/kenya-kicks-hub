import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, Activity, Newspaper, TrendingUp, Users, Clock, Calendar, Flame, Zap, Target, Star, Play, ArrowRight, Crown, Gift } from "lucide-react";
import { Link } from "react-router-dom";
import { AffiliateRedirect } from "@/components/AffiliateRedirect";
import { BannerAd, SidebarAd } from "@/components/AdSense";
import { LiveOddsWidget, LiveMatchWidget } from "@/components/OddspediaWidget";
import BettingInsights from "@/components/BettingInsights";
import PremiumFeatures from "@/components/PremiumFeatures";
import InteractiveDashboard from "@/components/InteractiveDashboard";
import heroImage from "@/assets/hero-footballer-scoring.jpg";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
type Match = {
  id: string;
  home_team: string;
  away_team: string;
  league: string;
  status: string;
  start_time: string;
  match_date: string;
  home_score?: number;
  away_score?: number;
  minute?: string;
};
interface QuickStat {
  label: string;
  value: string | number;
  icon: any;
}
interface StatsData {
  matchesToday: number;
  liveNow: number;
  predictions: number;
}
const Index = () => {
  const [featuredMatches, setFeaturedMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState<StatsData>({
    matchesToday: 0,
    liveNow: 0,
    predictions: 0
  });
  const quickStats: QuickStat[] = [{
    label: "Matches Today",
    value: statsData.matchesToday,
    icon: Activity
  }, {
    label: "Live Now",
    value: statsData.liveNow,
    icon: Clock
  }, {
    label: "Active Users",
    value: "2.4k",
    // Keep static for now
    icon: Users
  }, {
    label: "Predictions Made",
    value: statsData.predictions,
    icon: TrendingUp
  }];
  useEffect(() => {
    const fetchCurrentMatches = async () => {
      try {
        // Get current time in +3 GMT (EAT - East Africa Time)
        const now = new Date();
        const eatTime = new Date(now.getTime() + 3 * 60 * 60 * 1000); // Add 3 hours
        const today = eatTime.toISOString().split('T')[0];
        const currentDateTime = eatTime.toISOString();
        const {
          data,
          error
        } = await supabase.from('matches').select('*').or(`status.in.(live,1H,2H,HT),status.eq.upcoming,start_time.gte.${currentDateTime}`).order('start_time', {
          ascending: true
        }).limit(5);
        if (error) {
          console.error('Error fetching current matches:', error);
          return;
        }
        if (data) {
          // Filter out matches that are more than 2 hours old to avoid showing stale upcoming matches
          const filteredMatches = data.filter(match => {
            const matchTime = new Date(match.start_time);
            const timeDiff = eatTime.getTime() - matchTime.getTime();
            const twoHoursInMs = 2 * 60 * 60 * 1000;

            // Keep live matches and upcoming matches within reasonable time window
            return ['live', '1H', '2H', 'HT'].includes(match.status?.toLowerCase()) || timeDiff < twoHoursInMs;
          });
          setFeaturedMatches(filteredMatches);
        }
      } catch (error) {
        console.error('Error fetching matches:', error);
      } finally {
        setLoading(false);
      }
    };
    const fetchStats = async () => {
      try {
        // Get current time in +3 GMT (EAT - East Africa Time)
        const now = new Date();
        const eatTime = new Date(now.getTime() + 3 * 60 * 60 * 1000);
        const today = eatTime.toISOString().split('T')[0];
        const todayStart = `${today}T00:00:00`;
        const todayEnd = `${today}T23:59:59`;

        // Count matches today (using EAT timezone)
        const {
          count: matchesToday
        } = await supabase.from('matches').select('*', {
          count: 'exact',
          head: true
        }).gte('start_time', todayStart).lt('start_time', todayEnd);

        // Count live matches
        const {
          count: liveNow
        } = await supabase.from('matches').select('*', {
          count: 'exact',
          head: true
        }).in('status', ['live', '1H', '2H', 'HT']);

        // Count total predictions
        const {
          count: predictions
        } = await supabase.from('predictions').select('*', {
          count: 'exact',
          head: true
        });
        setStatsData({
          matchesToday: matchesToday || 0,
          liveNow: liveNow || 0,
          predictions: predictions || 0
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };
    fetchCurrentMatches();
    fetchStats();
  }, []);
  const formatMatchTime = (startTime: string, matchDate: string) => {
    if (startTime) {
      return new Date(startTime).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    return new Date(matchDate).toLocaleDateString();
  };
  return <div className="min-h-screen bg-gradient-hero relative overflow-hidden">
      <AffiliateRedirect />
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-40 right-20 w-48 h-48 bg-accent/5 rounded-full blur-2xl animate-float" style={{
        animationDelay: '1s'
      }}></div>
        <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-primary/3 rounded-full blur-3xl animate-float" style={{
        animationDelay: '2s'
      }}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8 space-y-12">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-background/40 to-accent/5 backdrop-blur-sm border border-primary/20 shadow-elevated">
          <div className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20" style={{
          backgroundImage: `url(${heroImage})`
        }} />
          
          <div className="relative z-20 p-8 md:p-12 lg:p-16">
            <div className="grid lg:grid-cols-12 gap-12 items-center">
              {/* Main Content - Left Side */}
              <div className="lg:col-span-7 space-y-8 animate-slideInUp">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-primary rounded-3xl flex items-center justify-center shadow-glow animate-glow">
                    <Trophy className="w-10 h-10 md:w-12 md:h-12 text-background" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Flame className="w-5 h-5 text-accent animate-pulse" />
                      <span className="text-sm md:text-base font-bold text-accent uppercase tracking-wider">
                        Europe's #1 Football Hub
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">Trusted by 50k+ fans worldwide</div>
                  </div>
                </div>
                
                <div className="space-y-8">
                  <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-none">
                    <span className="text-foreground animate-fadeIn">Ball</span>
                    <span className="bg-gradient-accent bg-clip-text text-transparent animate-fadeIn" style={{
                    animationDelay: '0.3s'
                  }}>Mtaani</span>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="text-xl md:text-2xl text-accent font-normal">⚽</div>
                      <div className="text-lg md:text-xl text-muted-foreground font-light">Live • Predict • Connect</div>
                    </div>
                  </h1>
                  
                  <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-2xl animate-slideInUp" style={{
                  animationDelay: '0.6s'
                }}>
                    Experience football like never before. Real-time scores, AI-powered predictions, and a passionate community of European football enthusiasts.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-6 pt-6 animate-slideInUp" style={{
                  animationDelay: '0.9s'
                }}>
                    <Button asChild size="lg" className="group bg-gradient-primary text-xl px-10 py-6 shadow-glow hover:shadow-elevated transition-all duration-300 hover:scale-105">
                      <Link to="/live-scores" className="flex items-center gap-3">
                        <Play className="w-6 h-6 group-hover:scale-110 transition-transform" />
                        Watch Live
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                    <Button variant="outline" asChild size="lg" className="text-xl px-10 py-6 border-2 border-primary/30 hover:border-primary hover:bg-primary/10 transition-all duration-300">
                      <Link to="/chat" className="flex items-center gap-3">
                        <Users className="w-6 h-6" />
                        Join Community
                      </Link>
                    </Button>
                  </div>
                  
                  {/* Trust Indicators */}
                  <div className="flex items-center gap-8 pt-6 text-sm text-muted-foreground animate-fadeIn" style={{
                  animationDelay: '1.2s'
                }}>
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-accent fill-accent" />
                      <span>4.9/5 Rating</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-primary" />
                      <span>Real-time Updates</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-accent" />
                      <span>95% Accuracy</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Right Side Content - Desktop Only */}
              <div className="hidden lg:block lg:col-span-5 space-y-8 animate-scaleIn" style={{
              animationDelay: '0.6s'
            }}>
                {/* Live Match Card */}
                <div className="bg-gradient-card backdrop-blur-sm border border-primary/20 rounded-2xl p-6 shadow-card hover:shadow-elevated transition-all duration-300 hover:scale-105">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-3 h-3 bg-match-live rounded-full animate-pulse"></div>
                    <span className="text-match-live font-bold text-lg">LIVE NOW</span>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="text-lg font-semibold">Man City</div>
                      <div className="text-2xl font-bold text-primary">2</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-lg font-semibold">Arsenal</div>
                      <div className="text-2xl font-bold text-primary">1</div>
                    </div>
                    <div className="text-center text-sm text-muted-foreground pt-2 border-t border-border">
                      Premier League • 87' ⚽
                    </div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-card backdrop-blur-sm border border-primary/10 rounded-xl p-4 text-center hover:border-primary/30 transition-colors">
                    <div className="text-3xl font-bold text-accent mb-1">{statsData.liveNow}</div>
                    <div className="text-sm text-muted-foreground">Live Matches</div>
                  </div>
                  <div className="bg-gradient-card backdrop-blur-sm border border-primary/10 rounded-xl p-4 text-center hover:border-primary/30 transition-colors">
                    <div className="text-3xl font-bold text-primary mb-1">2.4k</div>
                    <div className="text-sm text-muted-foreground">Online Fans</div>
                  </div>
                </div>

                {/* Quick Action */}
                <div className="bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30 rounded-2xl p-6 hover:scale-105 transition-transform duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <Trophy className="w-8 h-8 text-accent animate-float" />
                    <span className="text-accent font-bold text-xl">Premier League</span>
                  </div>
                  <p className="text-muted-foreground mb-4 leading-relaxed">
                    Follow every goal, every save, every moment that matters in the world's most exciting league.
                  </p>
                  <Button asChild className="w-full bg-gradient-primary hover:bg-gradient-accent transition-all duration-300">
                    <Link to="/leagues" className="flex items-center justify-center gap-2">
                      View All Leagues
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Banner Ad */}
        <div className="flex justify-center">
          <BannerAd className="w-full max-w-4xl" />
        </div>

        {/* Interactive Dashboard for Logged-in Users */}
        <div className="animate-slideInUp" style={{animationDelay: '0.2s'}}>
          <InteractiveDashboard />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-slideInUp" style={{
        animationDelay: '0.3s'
      }}>
          {quickStats.map((stat, index) => <Card key={index} className="group bg-gradient-card border border-primary/20 text-center hover:border-primary/40 hover:scale-105 transition-all duration-300 shadow-card hover:shadow-elevated">
              <CardContent className="p-8">
                <div className="relative">
                  <stat.icon className="w-12 h-12 text-primary mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent/20 rounded-full animate-pulse"></div>
                </div>
                <div className="text-3xl font-black text-foreground mb-2 group-hover:text-primary transition-colors">{stat.value}</div>
                <div className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">{stat.label}</div>
              </CardContent>
            </Card>)}
        </div>

        {/* Featured Matches */}
        <Card className="bg-gradient-card border border-primary/20 shadow-card hover:shadow-elevated transition-all duration-300 animate-slideInUp" style={{
        animationDelay: '0.6s'
      }}>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
                  <Activity className="w-6 h-6 text-background" />
                </div>
                <span className="text-2xl font-bold">Featured Matches</span>
              </div>
              <Badge variant="outline" className="border-primary/30 text-primary">
                Live Updates
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-3 text-muted-foreground">Loading matches...</span>
              </div> : featuredMatches.length > 0 ? featuredMatches.map((match, index) => <div key={match.id || index} className="group flex items-center justify-between p-6 bg-background/30 backdrop-blur-sm rounded-xl border border-primary/10 hover:border-primary/30 hover:bg-background/50 transition-all duration-300">
                  <div className="flex items-center gap-6">
                    <Badge variant={match.status === "live" ? "destructive" : "secondary"} className={match.status === "live" ? "bg-match-live text-white animate-pulse-slow border-0 px-3 py-1" : "bg-match-upcoming text-background border-0 px-3 py-1"}>
                      {match.status?.toUpperCase() || "UPCOMING"}
                    </Badge>
                    <div className="space-y-1">
                      <div className="font-bold text-lg group-hover:text-primary transition-colors">
                        {match.home_team} vs {match.away_team}
                        {match.status === "live" && match.home_score !== undefined && match.away_score !== undefined && <span className="ml-3 text-accent font-black text-xl">
                            {match.home_score}-{match.away_score}
                          </span>}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Trophy className="w-4 h-4" />
                        <span>{match.league}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Clock className="w-5 h-5" />
                    <span className="font-medium">{formatMatchTime(match.start_time, match.match_date)}</span>
                  </div>
                </div>) : <div className="text-center py-12">
                <Activity className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                <div className="text-lg text-muted-foreground">No matches available</div>
                <div className="text-sm text-muted-foreground/70">Check back soon for updates</div>
              </div>}
            <Button asChild className="w-full bg-gradient-primary hover:bg-gradient-accent text-lg py-6 group transition-all duration-300">
              <Link to="/live-scores" className="flex items-center justify-center gap-3">
                <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
                View All Matches
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Live Odds Widget */}
        <LiveOddsWidget 
          title="Live Betting Odds & Market Movements"
          className="w-full animate-slideInUp"
          autoRefresh={true}
          refreshInterval={30000}
        />

        {/* Premium Features Showcase */}
        <Card className="bg-gradient-to-br from-yellow-50/50 to-orange-50/50 border-yellow-200 shadow-card hover:shadow-elevated transition-all duration-300 animate-slideInUp" style={{animationDelay: '0.8s'}}>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold">Premium Features</span>
              </div>
              <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                <Gift className="w-4 h-4 mr-1" />
                Limited Offer
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center mx-auto">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold">Advanced Analytics</h3>
                <p className="text-sm text-muted-foreground">Deep dive into match statistics and player performance data</p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center mx-auto">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold">Exclusive Tips</h3>
                <p className="text-sm text-muted-foreground">Premium betting insights from our expert analysts</p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center mx-auto">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold">VIP Community</h3>
                <p className="text-sm text-muted-foreground">Access to exclusive discussions and premium content</p>
              </div>
            </div>
            <div className="flex justify-center mt-6">
              <Button className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-semibold px-8 py-3 text-lg">
                <Crown className="w-5 h-5 mr-2" />
                Upgrade to Premium
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Betting Insights Preview */}
        <div className="animate-slideInUp" style={{animationDelay: '0.9s'}}>
          <BettingInsights />
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-8 animate-slideInUp" style={{
        animationDelay: '0.9s'
      }}>
          <Card className="group bg-gradient-card border border-primary/20 hover:border-primary/40 hover:scale-105 transition-all duration-300 shadow-card hover:shadow-elevated overflow-hidden relative">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-primary/10 rounded-full -translate-y-10 translate-x-10"></div>
            <CardHeader className="relative">
              <CardTitle className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-primary/20 to-accent/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Newspaper className="w-6 h-6 text-primary" />
                </div>
                <span className="text-xl font-bold">Latest News</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                Breaking news, transfer rumors, and exclusive interviews from the world of European football.
              </p>
              <div className="flex items-center gap-2 text-sm text-accent">
                <Star className="w-4 h-4 fill-accent" />
                <span>Updated every minute</span>
              </div>
              <Button asChild className="w-full bg-gradient-primary hover:bg-gradient-accent group transition-all duration-300">
                <Link to="/news" className="flex items-center justify-center gap-2">
                  Read Latest News
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="group bg-gradient-card border border-primary/20 hover:border-primary/40 hover:scale-105 transition-all duration-300 shadow-card hover:shadow-elevated overflow-hidden relative">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-accent/10 rounded-full -translate-y-10 translate-x-10"></div>
            <CardHeader className="relative">
              <CardTitle className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-accent/20 to-primary/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-6 h-6 text-accent" />
                </div>
                <span className="text-xl font-bold">AI Predictions</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                Advanced machine learning algorithms analyze data to predict match outcomes with 95% accuracy.
              </p>
              <div className="flex items-center gap-2 text-sm text-primary">
                <Target className="w-4 h-4" />
                <span>95% prediction accuracy</span>
              </div>
              <Button asChild className="w-full bg-gradient-accent hover:bg-gradient-primary group transition-all duration-300">
                <Link to="/predictions" className="flex items-center justify-center gap-2">
                  View Predictions
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="group bg-gradient-card border border-primary/20 hover:border-primary/40 hover:scale-105 transition-all duration-300 shadow-card hover:shadow-elevated overflow-hidden relative">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-success/10 rounded-full -translate-y-10 translate-x-10"></div>
            <CardHeader className="relative">
              <CardTitle className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-primary/20 to-accent/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <span className="text-xl font-bold">Live Community</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                Join 2.4k passionate football fans discussing live matches, transfers, and predictions.
              </p>
              <div className="flex items-center gap-2 text-sm text-accent">
                <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
                <span>2,431 fans online now</span>
              </div>
              <Button asChild className="w-full bg-gradient-primary hover:bg-gradient-accent group transition-all duration-300">
                <Link to="/chat" className="flex items-center justify-center gap-2">
                  Join Community
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>;
};
export default Index;