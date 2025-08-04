import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, Activity, Newspaper, TrendingUp, Users, Clock, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-footballer-scoring.jpg";
const featuredMatches = [{
  homeTeam: "Arsenal",
  awayTeam: "Chelsea",
  time: "15:30",
  status: "LIVE",
  league: "Premier League"
}, {
  homeTeam: "Gor Mahia",
  awayTeam: "AFC Leopards",
  time: "16:00",
  status: "UPCOMING",
  league: "FKF Premier League"
}];
const quickStats = [{
  label: "Matches Today",
  value: "12",
  icon: Activity
}, {
  label: "Live Now",
  value: "3",
  icon: Clock
}, {
  label: "Active Users",
  value: "2.4k",
  icon: Users
}, {
  label: "Predictions Made",
  value: "156",
  icon: TrendingUp
}];
const Index = () => {
  return <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/20 via-background to-primary/10 p-8 md:p-16">
          <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/60 to-transparent z-10" />
          <div className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40" style={{
          backgroundImage: `url(${heroImage})`
        }} />
          
          <div className="relative z-20 grid md:grid-cols-2 gap-8 items-center max-w-6xl mx-auto">
            <div className="text-left space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-lg">
                  <Trophy className="w-10 h-10 text-background" />
                </div>
                <div className="text-sm font-medium text-primary uppercase tracking-wider">
                  🔥 Kenya's #1 Football Hub
                </div>
              </div>
              
              <h1 className="text-6xl md:text-7xl font-bold leading-tight">
                <span className="text-foreground">Ball</span>
                <span className="bg-gradient-primary bg-clip-text text-transparent">Mtaani</span>
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed">
                Experience the passion of Kenyan football like never before. Get live scores, breaking news, match predictions, and connect with thousands of fans in real-time.
              </p>

              {/* CAF CHAN Call-to-Action Banner */}
              <div className="bg-gradient-to-r from-primary/20 to-primary/10 border border-primary/30 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <Trophy className="w-6 h-6 text-primary" />
                  <span className="text-primary font-semibold text-lg">🏆 CAF African Cup of Nations CHAN</span>
                </div>
                <p className="text-muted-foreground text-sm mb-3">
                  Follow all the action from Africa's premier football championship - live scores, fixtures & tables
                </p>
                <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                  <Link to="/live-scores">View CHAN Matches & Tables →</Link>
                </Button>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button asChild size="lg" className="bg-gradient-primary text-lg px-8 py-4 shadow-lg hover:shadow-xl transition-all">
                  <Link to="/live-scores">🏟️ Live Matches</Link>
                </Button>
                <Button variant="outline" asChild size="lg" className="text-lg px-8 py-4 border-2">
                  <Link to="/chat">💬 Join 2.4k Fans</Link>
                </Button>
              </div>
              
              <div className="flex items-center gap-6 pt-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-match-live rounded-full animate-pulse"></div>
                  <span>3 Live matches</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>156 Predictions today</span>
                </div>
              </div>
            </div>
            
            <div className="hidden md:block relative">
              <div className="absolute inset-0 bg-gradient-primary opacity-20 rounded-2xl blur-3xl transform rotate-6"></div>
              
            </div>
          </div>
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
            {featuredMatches.map((match, index) => <div key={index} className="flex items-center justify-between p-4 bg-background/50 rounded-lg">
                <div className="flex items-center gap-4">
                  <Badge variant={match.status === "LIVE" ? "destructive" : "secondary"} className={match.status === "LIVE" ? "bg-match-live text-white animate-pulse" : "bg-match-upcoming text-background"}>
                    {match.status}
                  </Badge>
                  <div>
                    <div className="font-medium">{match.homeTeam} vs {match.awayTeam}</div>
                    <div className="text-sm text-muted-foreground">{match.league}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>{match.time}</span>
                </div>
              </div>)}
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