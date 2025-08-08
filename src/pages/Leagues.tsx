import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trophy, Users, Calendar, TrendingUp, Target, Star, Shield, Zap, Circle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

interface Competition {
  id: string;
  name: string;
  short_name: string;
  api_id: number;
  country: string;
  category: string;
  priority: number;
  logo_url?: string;
  primary_color?: string;
  format: string;
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
  competition_id?: string;
}

interface Match {
  id: string;
  home_team: string;
  away_team: string;
  home_score: number | null;
  away_score: number | null;
  status: string;
  league: string;
  start_time: string;
  venue?: string | null;
  api_match_id?: string | null;
  competition_id?: string;
}

const Leagues = () => {
  const [selectedCompetition, setSelectedCompetition] = useState<string | null>(null);

  // Fetch competitions
  const {
    data: competitions = [],
    isLoading: competitionsLoading
  } = useQuery({
    queryKey: ['competitions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('competitions')
        .select('*')
        .eq('is_active', true)
        .order('priority', { ascending: true });
      if (error) throw error;
      return data as Competition[];
    }
  });

  // Fetch league tables
  const {
    data: leagueTables = [],
    isLoading: tablesLoading,
    refetch: refetchTables
  } = useQuery({
    queryKey: ['league_tables'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('league_tables')
        .select('*')
        .order('league', { ascending: true })
        .order('position', { ascending: true });
      if (error) throw error;
      return data as LeagueTable[];
    }
  });

  // Fetch matches
  const {
    data: matches = [],
    isLoading: matchesLoading
  } = useQuery({
    queryKey: ['matches'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .order('start_time', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data as Match[];
    }
  });

  // Fetch live matches
  const {
    data: liveMatches = [],
    isLoading: liveMatchesLoading
  } = useQuery({
    queryKey: ['live_matches'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .in('status', ['LIVE', '1H', '2H', 'HT'])
        .order('start_time', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data as Match[];
    },
    refetchInterval: 30000 // Auto-refresh every 30 seconds
  });

  // Function to fetch fresh data from API-Football
  const fetchFreshData = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('fetch-football-data', {
        body: JSON.stringify({ operation: 'all' })
      });
      
      if (error) throw error;
      
      // Refetch the cached data to update the UI
      refetchTables();
      
      console.log('Fresh data fetched:', data);
      return data;
    } catch (error) {
      console.error('Error fetching fresh data:', error);
      throw error;
    }
  };

  // Group tables by league and competition
  const groupedTables = (leagueTables || []).reduce((acc, team) => {
    if (!acc[team.league]) acc[team.league] = [];
    acc[team.league].push(team);
    return acc;
  }, {} as Record<string, LeagueTable[]>);

  // Filter matches by competition
  const getMatchesForCompetition = (competitionName: string) => {
    if (!matches || !Array.isArray(matches)) return [];
    return matches.filter(match => 
      match.league?.toLowerCase().includes(competitionName.toLowerCase()) ||
      (competitionName === 'Premier League' && match.league === 'Premier League') ||
      (competitionName === 'La Liga EA SPORTS' && match.league?.includes('La Liga')) ||
      (competitionName === 'Serie A' && match.league === 'Serie A') ||
      (competitionName === 'Bundesliga' && match.league === 'Bundesliga') ||
      (competitionName === 'UEFA Champions League' && match.league?.includes('Champions League')) ||
      (competitionName === 'UEFA Europa League' && match.league?.includes('Europa League') && !match.league?.includes('Conference')) ||
      (competitionName === 'UEFA Europa Conference League' && match.league?.includes('Conference League'))
    );
  };

  // Set default selected competition
  useEffect(() => {
    if (competitions && competitions.length > 0 && !selectedCompetition) {
      setSelectedCompetition(competitions[0].name); // Premier League by default
    }
  }, [competitions, selectedCompetition]);

  // Set up real-time subscriptions
  useEffect(() => {
    const tablesChannel = supabase
      .channel('league-tables-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'league_tables'
      }, () => {
        refetchTables();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(tablesChannel);
    };
  }, [refetchTables]);

  const getPositionIcon = (position: number) => {
    if (position === 1) return <Trophy className="w-4 h-4 text-yellow-500" />;
    if (position === 2) return <Star className="w-4 h-4 text-gray-400" />;
    if (position === 3) return <Target className="w-4 h-4 text-amber-600" />;
    return null;
  };

  const getPositionBadge = (position: number, totalTeams: number) => {
    if (position === 1) return "champion";
    if (position <= 4) return "qualification";
    if (position >= totalTeams - 2) return "relegation";
    return "safe";
  };

  const getPositionColor = (position: number, totalTeams: number) => {
    const badge = getPositionBadge(position, totalTeams);
    switch (badge) {
      case "champion":
        return "bg-yellow-500/20 text-yellow-700 border-yellow-500/50";
      case "qualification":
        return "bg-green-500/20 text-green-700 border-green-500/50";
      case "relegation":
        return "bg-red-500/20 text-red-700 border-red-500/50";
      default:
        return "";
    }
  };

  const getCategoryIcon = (category: string) => {
    if (category === 'european') return '🏆';
    return '⚽';
  };

  const selectedLeague = selectedCompetition ? (groupedTables[selectedCompetition] || []) : [];
  const selectedMatches = selectedCompetition ? getMatchesForCompetition(selectedCompetition) : [];

  const liveMatchesForCompetition = selectedMatches.filter(match => 
    ['LIVE', '1H', '2H', 'HT'].includes(match.status)
  );
  const recentResults = selectedMatches.filter(match => 
    ['FT', 'FINISHED'].includes(match.status)
  ).slice(0, 10);
  const upcomingMatches = selectedMatches.filter(match => 
    ['UPCOMING', 'TIMED', 'NS'].includes(match.status)
  ).slice(0, 10);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Trophy className="w-6 h-6 text-background" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">European Football Leagues</h1>
              <p className="text-muted-foreground">Premier League, La Liga, Serie A, Bundesliga & UEFA Competitions</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => refetchTables()}
              disabled={tablesLoading}
              variant="outline"
              size="sm"
            >
              <TrendingUp className={`w-4 h-4 mr-2 ${tablesLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={fetchFreshData} variant="default" size="sm">
              <Trophy className="w-4 h-4 mr-2" />
              Fetch Live Data
            </Button>
          </div>
        </div>

        {/* Live Matches Banner */}
        {liveMatches && liveMatches.length > 0 && (
          <Card className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border-red-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <Circle className="w-3 h-3 fill-red-500 animate-pulse" />
                <Zap className="w-5 h-5" />
                {liveMatches?.length || 0} Live Matches
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {(liveMatches || []).slice(0, 6).map(match => (
                  <div key={match.id} className="bg-background/50 rounded-lg p-3 border">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1 text-center">
                        <div className="font-medium text-sm truncate">{match.home_team}</div>
                      </div>
                      <div className="flex items-center gap-2 px-3">
                        <span className="text-lg font-bold">{match.home_score ?? 0}</span>
                        <span className="text-red-500 font-medium">-</span>
                        <span className="text-lg font-bold">{match.away_score ?? 0}</span>
                      </div>
                      <div className="flex-1 text-center">
                        <div className="font-medium text-sm truncate">{match.away_team}</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground truncate">{match.league}</span>
                      <span className="bg-red-500 text-white px-2 py-1 rounded-full font-medium">
                        {match.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Competition Selection */}
        {competitions && competitions.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Select Competition</h3>
            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
              {(competitions || []).map(competition => (
                <Button
                  key={competition.id}
                  variant={selectedCompetition === competition.name ? "default" : "outline"}
                  onClick={() => setSelectedCompetition(competition.name)}
                  className="justify-start h-auto p-3"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getCategoryIcon(competition.category)}</span>
                    <div className="text-left">
                      <div className="font-medium">{competition.short_name}</div>
                      <div className="text-xs text-muted-foreground">{competition.country}</div>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Main Content */}
        {(competitionsLoading || tablesLoading) ? (
          <div className="text-center py-12">
            <TrendingUp className="w-12 h-12 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Loading European football data...</p>
          </div>
        ) : (
          <Tabs defaultValue="standings" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="standings" className="flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                Standings
              </TabsTrigger>
              <TabsTrigger value="live" className="flex items-center gap-2">
                <Circle className="w-4 h-4" />
                Live & Upcoming
              </TabsTrigger>
              <TabsTrigger value="recent" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Recent Results
              </TabsTrigger>
              <TabsTrigger value="stats" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Statistics
              </TabsTrigger>
            </TabsList>

            {/* League Standings */}
            <TabsContent value="standings" className="space-y-6">
              {selectedLeague.length > 0 ? (
                <Card className="bg-gradient-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-primary" />
                      {selectedCompetition} - Current Standings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">#</TableHead>
                          <TableHead>Team</TableHead>
                          <TableHead className="text-center">MP</TableHead>
                          <TableHead className="text-center">W</TableHead>
                          <TableHead className="text-center">D</TableHead>
                          <TableHead className="text-center">L</TableHead>
                          <TableHead className="text-center">GF</TableHead>
                          <TableHead className="text-center">GA</TableHead>
                          <TableHead className="text-center">GD</TableHead>
                          <TableHead className="text-center">Pts</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedLeague.map((team) => (
                          <TableRow
                            key={team.id}
                            className={getPositionColor(team.position, selectedLeague.length)}
                          >
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                {getPositionIcon(team.position)}
                                {team.position}
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">{team.team_name}</TableCell>
                            <TableCell className="text-center">{team.matches_played}</TableCell>
                            <TableCell className="text-center">{team.wins}</TableCell>
                            <TableCell className="text-center">{team.draws}</TableCell>
                            <TableCell className="text-center">{team.losses}</TableCell>
                            <TableCell className="text-center">{team.goals_for}</TableCell>
                            <TableCell className="text-center">{team.goals_against}</TableCell>
                            <TableCell className="text-center">
                              <Badge variant={team.goal_difference >= 0 ? "default" : "secondary"}>
                                {team.goal_difference >= 0 ? "+" : ""}{team.goal_difference}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center font-bold">{team.points}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-gradient-card">
                  <CardContent className="text-center py-12">
                    <Trophy className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      No standings available for {selectedCompetition || 'this competition'}
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Live & Upcoming Matches */}
            <TabsContent value="live" className="space-y-6">
              {/* Live Matches for Selected Competition */}
              {liveMatchesForCompetition.length > 0 && (
                <Card className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border-red-500/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-600">
                      <Circle className="w-3 h-3 fill-red-500 animate-pulse" />
                      Live Now - {selectedCompetition}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3">
                      {liveMatchesForCompetition.map(match => (
                        <div key={match.id} className="bg-background/80 rounded-lg p-4 border border-red-500/30">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex-1 text-center">
                              <div className="font-semibold">{match.home_team}</div>
                            </div>
                            <div className="flex items-center gap-3 px-4">
                              <span className="text-2xl font-bold text-primary">{match.home_score ?? 0}</span>
                              <span className="text-red-500 font-medium">-</span>
                              <span className="text-2xl font-bold text-primary">{match.away_score ?? 0}</span>
                            </div>
                            <div className="flex-1 text-center">
                              <div className="font-semibold">{match.away_team}</div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">{match.venue || 'Venue TBD'}</span>
                            <span className="bg-red-500 text-white px-2 py-1 rounded-full font-medium animate-pulse">
                              {match.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Upcoming Matches */}
              <Card className="bg-gradient-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    Upcoming Matches - {selectedCompetition}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {upcomingMatches.length > 0 ? (
                    <div className="grid gap-3">
                      {upcomingMatches.map(match => (
                        <div key={match.id} className="bg-background/50 rounded-lg p-3 border">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="font-medium">{match.home_team} vs {match.away_team}</div>
                              <div className="text-sm text-muted-foreground">
                                {new Date(match.start_time).toLocaleDateString('en-US', {
                                  weekday: 'short',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </div>
                            </div>
                            <Badge variant="outline">{match.status}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">No upcoming matches for {selectedCompetition}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Recent Results */}
            <TabsContent value="recent" className="space-y-6">
              <Card className="bg-gradient-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    Recent Results - {selectedCompetition}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {recentResults.length > 0 ? (
                    <div className="grid gap-3">
                      {recentResults.map(match => (
                        <div key={match.id} className="bg-background/50 rounded-lg p-3 border">
                          <div className="flex items-center justify-between">
                            <div className="flex-1 text-center">
                              <div className="font-medium">{match.home_team}</div>
                            </div>
                            <div className="flex items-center gap-3 px-4">
                              <span className="text-lg font-bold">{match.home_score ?? 0}</span>
                              <span className="text-muted-foreground">-</span>
                              <span className="text-lg font-bold">{match.away_score ?? 0}</span>
                            </div>
                            <div className="flex-1 text-center">
                              <div className="font-medium">{match.away_team}</div>
                            </div>
                          </div>
                          <div className="mt-2 text-center text-sm text-muted-foreground">
                            {new Date(match.start_time).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">No recent results for {selectedCompetition}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Statistics */}
            <TabsContent value="stats" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <Card className="bg-gradient-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      Competition Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span>Total Teams:</span>
                      <span className="font-semibold">{selectedLeague.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Matches:</span>
                      <span className="font-semibold">{selectedMatches.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Live Matches:</span>
                      <span className="font-semibold text-red-500">{liveMatchesForCompetition.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Recent Results:</span>
                      <span className="font-semibold">{recentResults.length}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-primary" />
                      League Leader
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedLeague.length > 0 ? (
                      <div className="text-center">
                        <Trophy className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
                        <h3 className="text-xl font-bold">{selectedLeague[0]?.team_name}</h3>
                        <p className="text-muted-foreground">{selectedLeague[0]?.points} points</p>
                        <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
                          <div>
                            <div className="font-semibold">{selectedLeague[0]?.wins}</div>
                            <div className="text-muted-foreground">Wins</div>
                          </div>
                          <div>
                            <div className="font-semibold">{selectedLeague[0]?.draws}</div>
                            <div className="text-muted-foreground">Draws</div>
                          </div>
                          <div>
                            <div className="font-semibold">{selectedLeague[0]?.losses}</div>
                            <div className="text-muted-foreground">Losses</div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Trophy className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground">No league data available</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default Leagues;