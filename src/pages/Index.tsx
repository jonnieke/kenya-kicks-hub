import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, Activity, Newspaper, TrendingUp, Users, Clock, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { AffiliateRedirect } from "@/components/AffiliateRedirect";
import { BannerAd, SidebarAd } from "@/components/AdSense";
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

  const quickStats: QuickStat[] = [
    {
      label: "Matches Today",
      value: statsData.matchesToday,
      icon: Activity
    },
    {
      label: "Live Now", 
      value: statsData.liveNow,
      icon: Clock
    },
    {
      label: "Active Users",
      value: "2.4k", // Keep static for now
      icon: Users
    },
    {
      label: "Predictions Made",
      value: statsData.predictions,
      icon: TrendingUp
    }
  ];

  useEffect(() => {
    const fetchCurrentMatches = async () => {
      try {
        // Get current time in +3 GMT (EAT - East Africa Time)
        const now = new Date();
        const eatTime = new Date(now.getTime() + (3 * 60 * 60 * 1000)); // Add 3 hours
        const today = eatTime.toISOString().split('T')[0];
        const currentDateTime = eatTime.toISOString();
        
        const { data, error } = await supabase
          .from('matches')
          .select('*')
          .or(`status.in.(live,1H,2H,HT),status.eq.upcoming,start_time.gte.${currentDateTime}`)
          .order('start_time', { ascending: true })
          .limit(5);

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
        const eatTime = new Date(now.getTime() + (3 * 60 * 60 * 1000));
        const today = eatTime.toISOString().split('T')[0];
        const todayStart = `${today}T00:00:00`;
        const todayEnd = `${today}T23:59:59`;
        
        // Count matches today (using EAT timezone)
        const { count: matchesToday } = await supabase
          .from('matches')
          .select('*', { count: 'exact', head: true })
          .gte('start_time', todayStart)
          .lt('start_time', todayEnd);

        // Count live matches
        const { count: liveNow } = await supabase
          .from('matches')
          .select('*', { count: 'exact', head: true })
          .in('status', ['live', '1H', '2H', 'HT']);

        // Count total predictions
        const { count: predictions } = await supabase
          .from('predictions')
          .select('*', { count: 'exact', head: true });

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
      return new Date(startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return new Date(matchDate).toLocaleDateString();
  };

  return <div className="min-h-screen bg-background p-6">
      <AffiliateRedirect />
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/20 via-background to-primary/10 p-6 md:p-12 lg:p-16">
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/70 to-background/40 z-10" />
          <div className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30" style={{
          backgroundImage: `url(${heroImage})`
        }} />
          
          <div className="relative z-20 max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-12 gap-8 items-start">
              {/* Main Content - Left Side */}
              <div className="lg:col-span-7 space-y-8">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-lg">
                    <Trophy className="w-8 h-8 md:w-10 md:h-10 text-background" />
                  </div>
                  <div className="text-xs md:text-sm font-medium text-primary uppercase tracking-wider">
                    🔥 Kenya's #1 Football Hub
                  </div>
                </div>
                
                <div className="space-y-6">
                  <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight">
                    <span className="text-foreground">Ball</span>
                    <span className="bg-gradient-primary bg-clip-text text-transparent">Mtaani</span>
                  </h1>
                  
                  <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl">
                    Experience the passion of Kenyan football like never before. Get live scores, breaking news, match predictions, and connect with thousands of fans in real-time.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <Button asChild size="lg" className="bg-gradient-primary text-lg px-8 py-4 shadow-lg hover:shadow-xl transition-all">
                      <Link to="/live-scores">🏟️ Live Matches</Link>
                    </Button>
                    <Button variant="outline" asChild size="lg" className="text-lg px-8 py-4 border-2">
                      <Link to="/chat">💬 Join 2.4k Fans</Link>
                    </Button>
                  </div>
                </div>

                {/* Mobile Stats - Show on mobile/tablet */}
                <div className="lg:hidden grid grid-cols-2 gap-4 pt-4">
                  <div className="bg-background/60 backdrop-blur-sm rounded-xl p-4 text-center border border-border/50">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-match-live rounded-full animate-pulse"></div>
                      <span className="text-xl font-bold text-foreground">3</span>
                    </div>
                    <div className="text-xs text-muted-foreground">Live Now</div>
                  </div>
                  <div className="bg-background/60 backdrop-blur-sm rounded-xl p-4 text-center border border-border/50">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Users className="w-3 h-3 text-primary" />
                      <span className="text-xl font-bold text-foreground">2.4k</span>
                    </div>
                    <div className="text-xs text-muted-foreground">Active Fans</div>
                  </div>
                </div>
              </div>
              
              {/* Right Side Content - Desktop Only */}
              <div className="hidden lg:block lg:col-span-5 space-y-6">
                {/* CAF CHAN Call-to-Action Banner */}
                <div className="bg-gradient-to-r from-primary/20 to-primary/10 border border-primary/30 rounded-xl p-5 my-[125px] mx-[9px] px-[20px] py-[18px]">
                  <div className="flex items-center gap-3 mb-3">
                    <Trophy className="w-6 h-6 text-primary" />
                    <span className="text-primary font-semibold text-lg">🏆 CAF CHAN</span>
                  </div>
                  <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                    Follow all the action from Africa's premier championship
                  </p>
                  <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold w-full">
                    <Link to="/live-scores">View Matches →</Link>
                  </Button>
                </div>

                {/* Live Stats Grid */}
                

                {/* Featured Match Preview */}
                
              </div>
            </div>
          </div>
        </div>

        {/* Top Banner Ad */}
        <div className="flex justify-center">
          <BannerAd className="w-full max-w-4xl" />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickStats.map((stat, index) => <Card key={index} className="bg-gradient-card border-border text-center">
              <CardContent className="p-6">
                <stat.icon className="w-8 h-8 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>)}
        </div>

        {/* Featured Matches */}
        <Card className="bg-gradient-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Featured Matches
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="text-center py-4 text-muted-foreground">Loading CAF CHAN matches...</div>
            ) : featuredMatches.length > 0 ? (
              featuredMatches.map((match, index) => <div key={match.id || index} className="flex items-center justify-between p-4 bg-background/50 rounded-lg">
                <div className="flex items-center gap-4">
                  <Badge variant={match.status === "live" ? "destructive" : "secondary"} className={match.status === "live" ? "bg-match-live text-white animate-pulse" : "bg-match-upcoming text-background"}>
                    {match.status?.toUpperCase() || "UPCOMING"}
                  </Badge>
                  <div>
                    <div className="font-medium">
                      {match.home_team} vs {match.away_team}
                      {match.status === "live" && match.home_score !== undefined && match.away_score !== undefined && (
                        <span className="ml-2 text-primary font-bold">
                          {match.home_score}-{match.away_score}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">{match.league}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>{formatMatchTime(match.start_time, match.match_date)}</span>
                </div>
              </div>)
            ) : (
              <div className="text-center py-4 text-muted-foreground">No CAF CHAN matches available</div>
            )}
            <Button asChild variant="outline" className="w-full">
              <Link to="/live-scores">View All Matches</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="bg-gradient-card border-border hover:border-primary/50 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Newspaper className="w-5 h-5 text-primary" />
                Latest News
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Stay updated with the latest football news from Kenya and around the world.
              </p>
              <Button asChild variant="outline" className="w-full">
                <Link to="/news">Read News</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border hover:border-primary/50 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Match Predictions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Get AI-powered match predictions with detailed analysis and betting odds.
              </p>
              <Button asChild variant="outline" className="w-full">
                <Link to="/predictions">View Predictions</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border hover:border-primary/50 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Community Chat
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Connect with fellow football fans and discuss matches in real-time.
              </p>
              <Button asChild variant="outline" className="w-full">
                <Link to="/chat">Join Chat</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>;
};
export default Index;