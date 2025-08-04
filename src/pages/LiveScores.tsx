import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, Calendar, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"

interface Match {
  id: number
  homeTeam: string
  awayTeam: string
  homeScore: number
  awayScore: number
  status: string
  minute: string
  league: string
}

const LiveScores = () => {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)

  const fetchLiveScores = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.functions.invoke('get-live-scores')
      
      if (error) {
        throw error
      }

      setMatches(data.matches || [])
      toast.success(`Updated ${data.matches?.length || 0} live matches`)
    } catch (error) {
      console.error('Error fetching live scores:', error)
      toast.error('Failed to fetch live scores')
    } finally {
      setLoading(false)
    }
  }

  const scrapeCAFMatches = async () => {
    try {
      setLoading(true)
      toast.info('Scraping latest CAF matches...')
      
      const { data, error } = await supabase.functions.invoke('scrape-caf-matches')
      
      if (error) {
        throw error
      }

      // After scraping, fetch updated live scores
      await fetchLiveScores()
      toast.success(`Scraped ${data.matches?.length || 0} CAF matches`)
    } catch (error) {
      console.error('Error scraping CAF matches:', error)
      toast.error('Failed to scrape CAF matches')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLiveScores()
  }, [])

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-background" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Live Scores</h1>
              <p className="text-muted-foreground">Real-time football match updates</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={scrapeCAFMatches} 
              disabled={loading}
              variant="default"
              size="sm"
            >
              <Calendar className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Scrape CAF
            </Button>
            <Button 
              onClick={fetchLiveScores} 
              disabled={loading}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {loading && matches.length === 0 ? (
          <div className="text-center py-8">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Loading live scores...</p>
          </div>
        ) : matches.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No live matches available</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {matches.map((match) => (
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
        )}
      </div>
    </div>
  )
}

export default LiveScores