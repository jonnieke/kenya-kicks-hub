import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { TrendingUp, Trophy, Target, Users, RefreshCw } from "lucide-react"
import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"

const Predictions = () => {
  const [predictions, setPredictions] = useState([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchPredictions = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.functions.invoke('generate-predictions')
      
      if (error) {
        console.error('Prediction generation error:', error)
        // Show sample data instead of failing completely
        const samplePredictions = [
          {
            id: "1",
            homeTeam: "Kenya",
            awayTeam: "Uganda", 
            prediction: "2-1",
            confidence: 75,
            reasoning: "Kenya has strong home advantage and Uganda is missing key players due to injuries.",
            league: "African Nations Championship (CHAN)",
            date: "Tomorrow, 3:00 PM",
            odds: { home: "2.1", draw: "3.2", away: "3.8" }
          },
          {
            id: "2",
            homeTeam: "Nigeria",
            awayTeam: "Ghana",
            prediction: "1-1", 
            confidence: 60,
            reasoning: "Both teams are evenly matched with solid defensive records in recent matches.",
            league: "African Nations Championship (CHAN)",
            date: "Saturday, 6:00 PM",
            odds: { home: "2.5", draw: "3.0", away: "2.9" }
          },
          {
            id: "3", 
            homeTeam: "Morocco",
            awayTeam: "Algeria",
            prediction: "3-0",
            confidence: 85,
            reasoning: "Morocco's attacking form has been exceptional, while Algeria struggles defensively.",
            league: "African Nations Championship (CHAN)",
            date: "Sunday, 4:30 PM", 
            odds: { home: "1.8", draw: "3.5", away: "4.2" }
          }
        ]
        setPredictions(samplePredictions)
        toast({
          title: "Demo Mode",
          description: "Showing sample predictions. API integration in progress.",
          variant: "default"
        })
        return
      }

      setPredictions(data?.predictions || [])
      if (data?.predictions?.length > 0) {
        toast({
          title: "Success",
          description: `Generated ${data.predictions.length} predictions`,
          variant: "default"
        })
      }
    } catch (error) {
      console.error('Prediction fetch error:', error)
      toast({
        title: "Error", 
        description: "Failed to load predictions",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPredictions()
  }, [])

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-background" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Match Predictions & Odds</h1>
              <p className="text-muted-foreground">AI-powered predictions with betting odds</p>
            </div>
          </div>
          <Button 
            onClick={fetchPredictions} 
            disabled={loading}
            variant="outline"
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <div className="grid gap-6">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="bg-gradient-card border-border">
                <CardHeader className="pb-4">
                  <Skeleton className="h-6 w-1/3" />
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-6 w-1/4" />
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-6 w-1/4" />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : predictions.length === 0 ? (
            <Card className="bg-gradient-card border-border text-center p-8">
              <CardContent>
                <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No predictions available</h3>
                <p className="text-muted-foreground mb-4">Try refreshing to generate new predictions</p>
                <Button onClick={fetchPredictions} className="bg-gradient-primary">
                  Generate Predictions
                </Button>
              </CardContent>
            </Card>
          ) : (
            predictions.map((prediction: any) => (
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
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default Predictions