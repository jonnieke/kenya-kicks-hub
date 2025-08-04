import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Calendar, RefreshCw, Trophy, Target, Timer, Play, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
interface Match {
  id: string;
  home_team: string;
  away_team: string;
  home_score: number | null;
  away_score: number | null;
  status: string;
  minute: string | null;
  league: string;
  start_time: string;
  venue?: string;
}
interface LeagueTable {
  id: string;
  league: string;
  team_name: string;
  position: number;
  matches_played: number;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  points: number;
}
interface MatchDetails extends Match {
  goal_scorers?: string[];
  yellow_cards?: string[];
  red_cards?: string[];
  possession?: {
    home: number;
    away: number;
  };
}
const LiveScores = () => {
  const [selectedMatch, setSelectedMatch] = useState<MatchDetails | null>(null);
  const [activeTab, setActiveTab] = useState("live");

  // Fetch matches with real-time updates
  const {
    data: matches = [],
    isLoading: matchesLoading,
    refetch: refetchMatches
  } = useQuery({
    queryKey: ['matches'],
    queryFn: async () => {
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const {
        data,
        error
      } = await supabase.from('matches').select('*').gte('start_time', sevenDaysAgo.toISOString()).lte('start_time', sevenDaysFromNow.toISOString()).order('start_time', {
        ascending: true
      });
      if (error) throw error;
      return data as Match[];
    },
    refetchInterval: 30000 // Refetch every 30 seconds
  });

  // Fetch league tables
  const {
    data: leagueTables = [],
    isLoading: tablesLoading,
    refetch: refetchTables
  } = useQuery({
    queryKey: ['league_tables'],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('league_tables').select('*').order('league', {
        ascending: true
      }).order('position', {
        ascending: true
      });
      if (error) throw error;
      return data as LeagueTable[];
    }
  });

  // Set up real-time subscriptions
  useEffect(() => {
    const matchesChannel = supabase.channel('matches-changes').on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'matches'
    }, payload => {
      console.log('Match update:', payload);
      refetchMatches();
      if (payload.eventType === 'UPDATE' && payload.new) {
        toast.success(`Match updated: ${payload.new.home_team} vs ${payload.new.away_team}`);
      }
    }).subscribe();
    const tablesChannel = supabase.channel('tables-changes').on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'league_tables'
    }, () => {
      refetchTables();
    }).subscribe();
    return () => {
      supabase.removeChannel(matchesChannel);
      supabase.removeChannel(tablesChannel);
    };
  }, [refetchMatches, refetchTables]);

  // Filter matches by status with better categorization
  const liveMatches = matches.filter(match => ['LIVE', '1H', '2H', 'HT'].includes(match.status));
  const upcomingMatches = matches.filter(match => ['UPCOMING', 'TIMED', 'NS'].includes(match.status));
  const recentResults = matches.filter(match => ['FT', 'FINISHED'].includes(match.status));

  // Group league tables by league
  const groupedTables = leagueTables.reduce((acc, team) => {
    if (!acc[team.league]) acc[team.league] = [];
    acc[team.league].push(team);
    return acc;
  }, {} as Record<string, LeagueTable[]>);
  const handleMatchClick = (match: Match) => {
    // Simulate additional match details
    const matchDetails: MatchDetails = {
      ...match,
      goal_scorers: match.home_score || match.away_score ? ['J. Smith 15\'', 'K. Johnson 67\''] : [],
      yellow_cards: ['M. Brown 23\'', 'L. Davis 78\''],
      red_cards: [],
      possession: {
        home: 58,
        away: 42
      }
    };
    setSelectedMatch(matchDetails);
  };
  const scrapeCAFMatches = async () => {
    try {
      toast.info('Scraping latest CAF matches...');
      const {
        data,
        error
      } = await supabase.functions.invoke('scrape-caf-matches');
      if (error) throw error;
      await refetchMatches();
      toast.success(`Scraped ${data.matches?.length || 0} CAF matches`);
    } catch (error) {
      console.error('Error scraping CAF matches:', error);
      toast.error('Failed to scrape CAF matches');
    }
  };
  const MatchCard = ({
    match,
    showAnimation = false
  }: {
    match: Match;
    showAnimation?: boolean;
  }) => {
    const isLive = ['LIVE', '1H', '2H', 'HT'].includes(match.status);
    const isFinished = ['FT', 'FINISHED'].includes(match.status);
    
    return (
      <Card 
        key={match.id} 
        className={`transition-all cursor-pointer duration-300 hover:shadow-lg ${
          isLive 
            ? 'bg-gradient-to-r from-red-500/10 to-orange-500/10 border-red-500/30 shadow-md' 
            : 'bg-gradient-card border-border hover:border-primary/50'
        } ${showAnimation ? 'animate-pulse' : ''}`} 
        onClick={() => handleMatchClick(match)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Trophy className="w-3 h-3" />
              {match.league}
            </CardTitle>
            <div className="flex items-center gap-2">
              {match.venue && <span className="text-xs text-muted-foreground">📍 {match.venue}</span>}
              <Badge 
                variant={isLive ? "destructive" : isFinished ? "secondary" : "default"} 
                className={`${
                  isLive 
                    ? "bg-red-500 text-white animate-pulse" 
                    : isFinished 
                      ? "bg-gray-500 text-white" 
                      : "bg-blue-500 text-white"
                }`}
              >
                {isLive ? (
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-white rounded-full animate-ping"></span>
                    {match.status === 'LIVE' ? `LIVE ${match.minute || ''}` : match.status}
                  </div>
                ) : match.status}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex-1 text-center">
              <h3 className={`font-semibold text-lg ${isLive ? 'text-red-700 dark:text-red-400' : 'text-foreground'}`}>
                {match.home_team}
              </h3>
            </div>
            <div className="flex items-center gap-4 px-8">
              {!['UPCOMING', 'TIMED', 'NS'].includes(match.status) ? (
                <>
                  <span className={`text-3xl font-bold ${
                    isLive ? 'text-red-600 dark:text-red-400' : 'text-foreground'
                  }`}>
                    {match.home_score ?? 0}
                  </span>
                  <span className={`text-2xl ${isLive ? 'text-red-500' : 'text-muted-foreground'}`}>
                    -
                  </span>
                  <span className={`text-3xl font-bold ${
                    isLive ? 'text-red-600 dark:text-red-400' : 'text-foreground'
                  }`}>
                    {match.away_score ?? 0}
                  </span>
                </>
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Timer className="w-4 h-4" />
                  <span>
                    {new Date(match.start_time).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              )}
            </div>
            <div className="flex-1 text-center">
              <h3 className={`font-semibold text-lg ${isLive ? 'text-red-700 dark:text-red-400' : 'text-foreground'}`}>
                {match.away_team}
              </h3>
            </div>
          </div>
          <div className="mt-2 text-center text-xs text-muted-foreground">
            {new Date(match.start_time).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric'
            })}
          </div>
        </CardContent>
      </Card>
    );
  };
  return <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-background" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Scores</h1>
              <p className="text-muted-foreground">Real-time football match updates</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={scrapeCAFMatches} disabled={matchesLoading} variant="default" size="sm">
              <Calendar className={`w-4 h-4 mr-2 ${matchesLoading ? 'animate-spin' : ''}`} />
              Scrape CAF
            </Button>
            <Button onClick={() => refetchMatches()} disabled={matchesLoading} variant="outline" size="sm">
              <RefreshCw className={`w-4 h-4 mr-2 ${matchesLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="live" className="flex items-center gap-2">
              <Play className="w-4 h-4" />
              Live ({liveMatches.length})
            </TabsTrigger>
            <TabsTrigger value="fixtures" className="flex items-center gap-2">
              <Timer className="w-4 h-4" />
              Fixtures ({upcomingMatches.length})
            </TabsTrigger>
            <TabsTrigger value="results" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Results ({recentResults.length})
            </TabsTrigger>
            <TabsTrigger value="tables" className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Tables
            </TabsTrigger>
          </TabsList>

          {/* Live Matches */}
          <TabsContent value="live" className="space-y-4">
            {matchesLoading ? <div className="text-center py-8">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Loading live matches...</p>
              </div> : liveMatches.length === 0 ? <div className="text-center py-8">
                <Play className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No live matches at the moment</p>
              </div> : <div className="grid gap-4">
                {liveMatches.map(match => <MatchCard key={match.id} match={match} showAnimation />)}
              </div>}
          </TabsContent>

          {/* Upcoming Fixtures */}
          <TabsContent value="fixtures" className="space-y-4">
            {upcomingMatches.length === 0 ? <div className="text-center py-8">
                <Timer className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No upcoming fixtures</p>
              </div> : <div className="grid gap-4">
                {upcomingMatches.map(match => <MatchCard key={match.id} match={match} />)}
              </div>}
          </TabsContent>

          {/* Recent Results */}
          <TabsContent value="results" className="space-y-4">
            {recentResults.length === 0 ? <div className="text-center py-8">
                <Target className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No recent results</p>
              </div> : <div className="grid gap-4">
                {recentResults.map(match => <MatchCard key={match.id} match={match} />)}
              </div>}
          </TabsContent>

          {/* League Tables */}
          <TabsContent value="tables" className="space-y-6">
            {tablesLoading ? <div className="text-center py-8">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Loading league tables...</p>
              </div> : Object.keys(groupedTables).length === 0 ? <div className="text-center py-8">
                <Trophy className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No league tables available</p>
              </div> : Object.entries(groupedTables).map(([league, teams]) => <Card key={league} className="bg-gradient-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="w-5 h-5" />
                      {league}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">Pos</TableHead>
                          <TableHead>Team</TableHead>
                          <TableHead className="text-center w-12">MP</TableHead>
                          <TableHead className="text-center w-12">W</TableHead>
                          <TableHead className="text-center w-12">D</TableHead>
                          <TableHead className="text-center w-12">L</TableHead>
                          <TableHead className="text-center w-16">GD</TableHead>
                          <TableHead className="text-center w-12">Pts</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {teams.map(team => <TableRow key={team.id}>
                            <TableCell className="font-medium">{team.position}</TableCell>
                            <TableCell>{team.team_name}</TableCell>
                            <TableCell className="text-center">{team.matches_played}</TableCell>
                            <TableCell className="text-center">{team.wins}</TableCell>
                            <TableCell className="text-center">{team.draws}</TableCell>
                            <TableCell className="text-center">{team.losses}</TableCell>
                            <TableCell className="text-center">
                              <span className={team.goal_difference > 0 ? "text-green-600" : team.goal_difference < 0 ? "text-red-600" : ""}>
                                {team.goal_difference > 0 ? '+' : ''}{team.goal_difference}
                              </span>
                            </TableCell>
                            <TableCell className="text-center font-bold">{team.points}</TableCell>
                          </TableRow>)}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>)}
          </TabsContent>
        </Tabs>

        {/* Match Details Modal */}
        <Dialog open={!!selectedMatch} onOpenChange={() => setSelectedMatch(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>{selectedMatch?.home_team} vs {selectedMatch?.away_team}</span>
                <Badge variant={selectedMatch?.status === "LIVE" ? "destructive" : "secondary"}>
                  {selectedMatch?.status}
                </Badge>
              </DialogTitle>
            </DialogHeader>
            {selectedMatch && <div className="space-y-6">
                {/* Score Display */}
                <div className="text-center py-6 bg-gradient-card rounded-lg">
                  <div className="flex items-center justify-center gap-8">
                    <div className="text-center">
                      <h3 className="text-xl font-bold">{selectedMatch.home_team}</h3>
                      <span className="text-4xl font-bold text-primary">{selectedMatch.home_score ?? 0}</span>
                    </div>
                    <span className="text-2xl text-muted-foreground">-</span>
                    <div className="text-center">
                      <h3 className="text-xl font-bold">{selectedMatch.away_team}</h3>
                      <span className="text-4xl font-bold text-primary">{selectedMatch.away_score ?? 0}</span>
                    </div>
                  </div>
                  {selectedMatch.minute && <p className="text-sm text-muted-foreground mt-2">{selectedMatch.minute}'</p>}
                </div>

                {/* Match Stats */}
                {selectedMatch.possession && <div className="space-y-4">
                    <h4 className="font-semibold">Match Statistics</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Possession</span>
                        <span>{selectedMatch.possession.home}% - {selectedMatch.possession.away}%</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full transition-all duration-300" style={{
                    width: `${selectedMatch.possession.home}%`
                  }} />
                      </div>
                    </div>
                  </div>}

                {/* Goal Scorers */}
                {selectedMatch.goal_scorers && selectedMatch.goal_scorers.length > 0 && <div className="space-y-2">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Goal Scorers
                    </h4>
                    <ul className="space-y-1">
                      {selectedMatch.goal_scorers.map((scorer, index) => <li key={index} className="text-sm text-muted-foreground">⚽ {scorer}</li>)}
                    </ul>
                  </div>}

                {/* Cards */}
                {selectedMatch.yellow_cards && selectedMatch.yellow_cards.length > 0 && <div className="space-y-2">
                    <h4 className="font-semibold">Yellow Cards</h4>
                    <ul className="space-y-1">
                      {selectedMatch.yellow_cards.map((card, index) => <li key={index} className="text-sm text-yellow-600">🟨 {card}</li>)}
                    </ul>
                  </div>}
              </div>}
          </DialogContent>
        </Dialog>
      </div>
    </div>;
};
export default LiveScores;