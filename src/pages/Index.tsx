import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trophy, Activity, Newspaper, TrendingUp, Users, Clock, Calendar } from "lucide-react"
import { Link } from "react-router-dom"

const featuredMatches = [
  {
    homeTeam: "Arsenal",
    awayTeam: "Chelsea",
    time: "15:30",
    status: "LIVE",
    league: "Premier League"
  },
  {
    homeTeam: "Gor Mahia",
    awayTeam: "AFC Leopards",
    time: "16:00",
    status: "UPCOMING",
    league: "FKF Premier League"
  }
]

const quickStats = [
  { label: "Matches Today", value: "12", icon: Activity },
  { label: "Live Now", value: "3", icon: Clock },
  { label: "Active Users", value: "2.4k", icon: Users },
  { label: "Predictions Made", value: "156", icon: TrendingUp }
]

const Index = () => {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4 py-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center">
              <Trophy className="w-10 h-10 text-background" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-foreground bg-gradient-primary bg-clip-text text-transparent">
            FootballKE
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Your ultimate destination for Kenyan football. Live scores, news, predictions, and community chat all in one place.
          </p>
          <div className="flex gap-4 justify-center mt-8">
            <Button asChild className="bg-gradient-primary">
              <Link to="/live-scores">View Live Scores</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/chat">Join Community</Link>
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickStats.map((stat, index) => (
            <Card key={index} className="bg-gradient-card border-border text-center">
              <CardContent className="p-6">
                <stat.icon className="w-8 h-8 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
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
            {featuredMatches.map((match, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-background/50 rounded-lg">
                <div className="flex items-center gap-4">
                  <Badge 
                    variant={match.status === "LIVE" ? "destructive" : "secondary"}
                    className={match.status === "LIVE" ? "bg-match-live text-white animate-pulse" : "bg-match-upcoming text-background"}
                  >
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
              </div>
            ))}
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
    </div>
  );
};

export default Index;
