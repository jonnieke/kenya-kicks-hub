import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, Calendar } from "lucide-react"

const liveMatches = [
  {
    id: 1,
    homeTeam: "Arsenal",
    awayTeam: "Chelsea",
    homeScore: 2,
    awayScore: 1,
    status: "LIVE",
    minute: "78'",
    league: "Premier League"
  },
  {
    id: 2,
    homeTeam: "Manchester City",
    awayTeam: "Liverpool",
    homeScore: 1,
    awayScore: 3,
    status: "FT",
    minute: "90'",
    league: "Premier League"
  },
  {
    id: 3,
    homeTeam: "Real Madrid",
    awayTeam: "Barcelona",
    homeScore: 0,
    awayScore: 0,
    status: "UPCOMING",
    minute: "20:00",
    league: "La Liga"
  }
]

const LiveScores = () => {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
            <Clock className="w-6 h-6 text-background" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Live Scores</h1>
            <p className="text-muted-foreground">Real-time football match updates</p>
          </div>
        </div>

        <div className="grid gap-4">
          {liveMatches.map((match) => (
            <Card key={match.id} className="bg-gradient-card border-border hover:border-primary/50 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm text-muted-foreground">{match.league}</CardTitle>
                  <Badge 
                    variant={match.status === "LIVE" ? "destructive" : match.status === "FT" ? "secondary" : "default"}
                    className={
                      match.status === "LIVE" 
                        ? "bg-match-live text-white animate-pulse" 
                        : match.status === "FT" 
                        ? "bg-match-finished text-white" 
                        : "bg-match-upcoming text-background"
                    }
                  >
                    {match.status === "LIVE" ? `${match.status} ${match.minute}` : match.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex-1 text-center">
                    <h3 className="font-semibold text-lg text-foreground">{match.homeTeam}</h3>
                  </div>
                  <div className="flex items-center gap-4 px-8">
                    {match.status !== "UPCOMING" ? (
                      <>
                        <span className="text-3xl font-bold text-foreground">{match.homeScore}</span>
                        <span className="text-2xl text-muted-foreground">-</span>
                        <span className="text-3xl font-bold text-foreground">{match.awayScore}</span>
                      </>
                    ) : (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>{match.minute}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 text-center">
                    <h3 className="font-semibold text-lg text-foreground">{match.awayTeam}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

export default LiveScores