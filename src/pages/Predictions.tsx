import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, Trophy, Target, Users } from "lucide-react"

const predictions = [
  {
    id: 1,
    homeTeam: "Manchester United",
    awayTeam: "Arsenal",
    prediction: "2-1",
    confidence: 78,
    odds: {
      home: 2.1,
      draw: 3.2,
      away: 3.5
    },
    league: "Premier League",
    date: "Tomorrow 15:30"
  },
  {
    id: 2,
    homeTeam: "Real Madrid",
    awayTeam: "Barcelona",
    prediction: "1-2",
    confidence: 65,
    odds: {
      home: 2.8,
      draw: 3.1,
      away: 2.3
    },
    league: "La Liga",
    date: "Saturday 20:00"
  },
  {
    id: 3,
    homeTeam: "Gor Mahia",
    awayTeam: "AFC Leopards",
    prediction: "3-0",
    confidence: 82,
    odds: {
      home: 1.8,
      draw: 3.5,
      away: 4.2
    },
    league: "FKF Premier League",
    date: "Sunday 15:00"
  }
]

const Predictions = () => {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-background" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Match Predictions & Odds</h1>
            <p className="text-muted-foreground">AI-powered predictions with betting odds</p>
          </div>
        </div>

        <div className="grid gap-6">
          {predictions.map((prediction) => (
            <Card key={prediction.id} className="bg-gradient-card border-border">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-primary" />
                    <span className="font-medium text-primary">{prediction.league}</span>
                  </div>
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    {prediction.date}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Match Info */}
                <div className="flex items-center justify-between">
                  <div className="text-center flex-1">
                    <h3 className="font-semibold text-lg">{prediction.homeTeam}</h3>
                  </div>
                  <div className="px-8">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary mb-1">{prediction.prediction}</div>
                      <div className="text-xs text-muted-foreground">PREDICTION</div>
                    </div>
                  </div>
                  <div className="text-center flex-1">
                    <h3 className="font-semibold text-lg">{prediction.awayTeam}</h3>
                  </div>
                </div>

                {/* Confidence & Odds */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-background/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-4 h-4 text-primary" />
                      <span className="font-medium">Confidence</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-secondary rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${prediction.confidence}%` }}
                        />
                      </div>
                      <span className="font-bold text-primary">{prediction.confidence}%</span>
                    </div>
                  </div>
                  
                  <div className="bg-background/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Users className="w-4 h-4 text-accent" />
                      <span className="font-medium">Betting Odds</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">HOME</div>
                        <div className="font-bold text-accent">{prediction.odds.home}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">DRAW</div>
                        <div className="font-bold text-accent">{prediction.odds.draw}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">AWAY</div>
                        <div className="font-bold text-accent">{prediction.odds.away}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">View Analysis</Button>
                  <Button className="flex-1 bg-gradient-primary">Place Bet</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Predictions