import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trophy, Users, Calendar, TrendingUp, Target, Star, Shield, Zap, Circle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
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
}
const Leagues = () => {
  const [selectedLeague, setSelectedLeague] = useState<string | null>(null);

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

  // Fetch recent matches with CHAN priority
  const {
    data: matches = [],
    isLoading: matchesLoading
  } = useQuery({
    queryKey: ['recent_matches'],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('matches').select('*').order('start_time', {
        ascending: false
      }).limit(50);
      if (error) throw error;
      return data as Match[];
    }
  });

  // Fetch CHAN specific matches - exclude mock/placeholder data
  const {
    data: chanMatches = [],
    isLoading: chanMatchesLoading
  } = useQuery({
    queryKey: ['chan_matches'],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('matches').select('*')
        .or('league.ilike.%African Nations Championship%,league.ilike.%CHAN%')
        .order('start_time', { ascending: false })
        .limit(20);
      if (error) throw error;
      
      // Filter out mock/placeholder data
      const realMatches = (data as Match[]).filter(match => 
        match.api_match_id && 
        !match.api_match_id.startsWith('caf_chan_') &&
        match.venue && // Real matches have venues
        !(match.home_team?.includes("A'") || match.away_team?.includes("A'")) // Exclude placeholder team names
      );
      
      return realMatches;
    }
  });

  // Fetch live matches
  const {
    data: liveMatches = [],
    isLoading: liveMatchesLoading
  } = useQuery({
    queryKey: ['live_matches'],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('matches').select('*').in('status', ['LIVE', '1H', '2H', 'HT']).order('start_time', {
        ascending: false
      }).limit(10);
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

  // Group tables by league
  const groupedTables = leagueTables.reduce((acc, team) => {
    if (!acc[team.league]) acc[team.league] = [];
    acc[team.league].push(team);
    return acc;
  }, {} as Record<string, LeagueTable[]>);

  // Group all matches by league
  const groupedMatches = matches.reduce((acc, match) => {
    if (!acc[match.league]) acc[match.league] = [];
    acc[match.league].push(match);
    return acc;
  }, {} as Record<string, Match[]>);

  // Group CHAN matches by status and time
  const now = new Date();
  const chanLiveMatches = chanMatches.filter(match => 
    ['LIVE', '1H', '2H', 'HT'].includes(match.status)
  );
  const chanRecentMatches = chanMatches.filter(match => 
    ['FT', 'FINISHED'].includes(match.status) ||
    (match.start_time && new Date(match.start_time) < now && !['LIVE', '1H', '2H', 'HT'].includes(match.status))
  );
  const chanUpcomingMatches = chanMatches.filter(match => 
    match.start_time && 
    new Date(match.start_time) > now &&
    !['LIVE', '1H', '2H', 'HT', 'FT', 'FINISHED'].includes(match.status)
  ).sort((a, b) => new Date(a.start_time!).getTime() - new Date(b.start_time!).getTime());

  // Get unique leagues, prioritize CHAN
  const allLeagues = Object.keys(groupedTables);
  const chanLeagues = allLeagues.filter(league => 
    league.includes('African Nations Championship') || 
    league.includes('CHAN')
  );
  const otherLeagues = allLeagues.filter(league => 
    !league.includes('African Nations Championship') && 
    !league.includes('CHAN')
  );
  const leagues = [...chanLeagues, ...otherLeagues];

  // Set default selected league to CHAN if available, otherwise show CHAN matches view
  useEffect(() => {
    if (leagues.length > 0 && !selectedLeague) {
      const chanLeague = leagues.find(league => 
        league.includes('African Nations Championship') || 
        league.includes('CHAN')
      );
      setSelectedLeague(chanLeague || 'CHAN_TOURNAMENT');
    } else if (leagues.length === 0 && !selectedLeague) {
      setSelectedLeague('CHAN_TOURNAMENT');
    }
  }, [leagues, selectedLeague]);

  // Set up real-time subscriptions
  useEffect(() => {
    const tablesChannel = supabase.channel('league-tables-changes').on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'league_tables'
    }, () => {
      refetchTables();
    }).subscribe();
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
  return <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Trophy className="w-6 h-6 text-background" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">CAF African Nations Championship (CHAN)</h1>
              <p className="text-muted-foreground">Focus on CHAN tournament standings and matches</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => refetchTables()} disabled={tablesLoading} variant="outline" size="sm">
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
        {liveMatches.length > 0 && (
          <Card className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border-red-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <Circle className="w-3 h-3 fill-red-500 animate-pulse" />
                <Zap className="w-5 h-5" />
                {liveMatches.length} Live Matches
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {liveMatches.slice(0, 6).map(match => (
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

        {/* League Selection - CHAN prioritized */}
        {leagues.length > 0 && <div className="flex gap-2 overflow-x-auto pb-2">
            {leagues.map(league => {
              const isChanLeague = league.includes('African Nations Championship') || league.includes('CHAN');
              return (
                <Button 
                  key={league} 
                  variant={selectedLeague === league ? "default" : "outline"} 
                  onClick={() => setSelectedLeague(league)} 
                  className={`whitespace-nowrap ${isChanLeague ? 'ring-2 ring-primary/50' : ''}`}
                >
                  <Shield className="w-4 h-4 mr-2" />
                  {isChanLeague ? `🏆 ${league}` : league}
                </Button>
              );
            })}
          </div>}

          {(tablesLoading || chanMatchesLoading) ? <div className="text-center py-12">
            <TrendingUp className="w-12 h-12 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Loading CHAN tournament data...</p>
          </div> : <Tabs defaultValue="chan-overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="chan-overview" className="flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                CHAN Live
              </TabsTrigger>
              <TabsTrigger value="standings" className="flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                Standings
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

            {/* CHAN Tournament Overview */}
            <TabsContent value="chan-overview" className="space-y-6">
              {/* Live CHAN Matches */}
              {chanLiveMatches.length > 0 && (
                <Card className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border-red-500/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-600">
                      🏆 CHAN Live Matches
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3 md:grid-cols-2">
                      {chanLiveMatches.map(match => (
                        <div key={match.id} className="bg-background/80 rounded-lg p-4 border border-red-500/30">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex-1 text-center">
                              <div className="font-semibold text-sm">{match.home_team}</div>
                            </div>
                            <div className="flex items-center gap-3 px-4">
                              <span className="text-xl font-bold text-primary">{match.home_score ?? 0}</span>
                              <span className="text-red-500 font-medium">-</span>
                              <span className="text-xl font-bold text-primary">{match.away_score ?? 0}</span>
                            </div>
                            <div className="flex-1 text-center">
                              <div className="font-semibold text-sm">{match.away_team}</div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">{match.venue || 'Venue pending'}</span>
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

              {/* Recent CHAN Results */}
              <Card className="bg-gradient-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    🏆 Recent CHAN Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {chanRecentMatches.length > 0 ? (
                    <div className="grid gap-3">
                      {chanRecentMatches.slice(0, 5).map(match => (
                        <div key={match.id} className="bg-background/50 rounded-lg p-3 border">
                          <div className="flex items-center justify-between">
                            <div className="flex-1 text-center">
                              <div className="font-medium text-sm">{match.home_team}</div>
                            </div>
                            <div className="flex items-center gap-3 px-4">
                              <span className="text-lg font-bold">{match.home_score ?? 0}</span>
                              <span className="text-muted-foreground">-</span>
                              <span className="text-lg font-bold">{match.away_score ?? 0}</span>
                            </div>
                            <div className="flex-1 text-center">
                              <div className="font-medium text-sm">{match.away_team}</div>
                            </div>
                          </div>
                          <div className="mt-2 text-center text-xs text-muted-foreground">
                            {new Date(match.start_time).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric'
                             })} • {match.venue || 'Venue pending'}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Trophy className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">No recent CHAN matches available</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Upcoming CHAN Matches */}
              {chanUpcomingMatches.length > 0 && (
                <Card className="bg-gradient-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      🗓️ Upcoming CHAN Matches
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3">
                      {chanUpcomingMatches.slice(0, 5).map(match => (
                        <div key={match.id} className="bg-background/50 rounded-lg p-3 border">
                          <div className="flex items-center justify-between">
                            <div className="flex-1 text-center">
                              <div className="font-medium text-sm">{match.home_team}</div>
                            </div>
                            <div className="flex items-center gap-3 px-4">
                              <span className="text-sm text-muted-foreground">vs</span>
                            </div>
                            <div className="flex-1 text-center">
                              <div className="font-medium text-sm">{match.away_team}</div>
                            </div>
                          </div>
                          <div className="mt-2 text-center text-xs text-muted-foreground">
                            {new Date(match.start_time).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                              })} • {match.venue || 'Venue pending'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* League Standings */}
            <TabsContent value="standings" className="space-y-6">
              {selectedLeague === 'CHAN_TOURNAMENT' ? (
                <Card className="bg-gradient-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      🏆 CAF African Nations Championship - Tournament Info
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
                      <h3 className="text-xl font-bold mb-2">CHAN Tournament</h3>
                      <p className="text-muted-foreground mb-4">
                        Tournament for players competing in their home country leagues
                      </p>
                      <div className="grid md:grid-cols-3 gap-4 text-sm">
                        <div className="bg-background/50 p-3 rounded-lg">
                          <div className="font-semibold">Live Matches</div>
                          <div className="text-lg font-bold text-red-500">{chanLiveMatches.length}</div>
                        </div>
                        <div className="bg-background/50 p-3 rounded-lg">
                          <div className="font-semibold">Recent Results</div>
                          <div className="text-lg font-bold text-green-500">{chanRecentMatches.length}</div>
                        </div>
                        <div className="bg-background/50 p-3 rounded-lg">
                          <div className="font-semibold">Upcoming</div>
                          <div className="text-lg font-bold text-blue-500">{chanUpcomingMatches.length}</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : selectedLeague && groupedTables[selectedLeague] ? (
                <Card className="bg-gradient-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="w-5 h-5" />
                      {selectedLeague} - League Table
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
                          <TableHead className="text-center w-16">GF</TableHead>
                          <TableHead className="text-center w-16">GA</TableHead>
                          <TableHead className="text-center w-16">GD</TableHead>
                          <TableHead className="text-center w-12">Pts</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {groupedTables[selectedLeague].map(team => <TableRow key={team.id} className={getPositionColor(team.position, groupedTables[selectedLeague].length)}>
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
                              <span className={team.goal_difference > 0 ? "text-green-600 font-medium" : team.goal_difference < 0 ? "text-red-600 font-medium" : ""}>
                                {team.goal_difference > 0 ? '+' : ''}{team.goal_difference}
                              </span>
                            </TableCell>
                            <TableCell className="text-center font-bold text-primary">{team.points}</TableCell>
                          </TableRow>)}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              ) : (
                <div className="text-center py-12">
                  <Trophy className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No league table available for this tournament</p>
                </div>
              )}
            </TabsContent>

            {/* Recent Results */}
            <TabsContent value="recent" className="space-y-4">
              {selectedLeague === 'CHAN_TOURNAMENT' ? (
                <div className="grid gap-4">
                  {chanRecentMatches.length > 0 ? chanRecentMatches.slice(0, 10).map(match => (
                    <Card key={match.id} className="bg-gradient-card">
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 text-center">
                            <h4 className="font-semibold">{match.home_team}</h4>
                          </div>
                          <div className="flex items-center gap-4 px-8">
                            <span className="text-2xl font-bold">{match.home_score ?? 0}</span>
                            <span className="text-lg text-muted-foreground">-</span>
                            <span className="text-2xl font-bold">{match.away_score ?? 0}</span>
                          </div>
                          <div className="flex-1 text-center">
                            <h4 className="font-semibold">{match.away_team}</h4>
                          </div>
                        </div>
                        <div className="mt-2 text-center text-sm text-muted-foreground">
                          {new Date(match.start_time).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })} • {match.venue || 'Venue pending'}
                        </div>
                      </CardContent>
                    </Card>
                  )) : (
                    <div className="text-center py-8">
                      <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">No recent CHAN matches available</p>
                    </div>
                  )}
                </div>
              ) : selectedLeague && groupedMatches[selectedLeague] ? <div className="grid gap-4">
                  {groupedMatches[selectedLeague].filter(match => ['FT', 'FINISHED'].includes(match.status)).slice(0, 10).map(match => <Card key={match.id} className="bg-gradient-card">
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 text-center">
                            <h4 className="font-semibold">{match.home_team}</h4>
                          </div>
                          <div className="flex items-center gap-4 px-8">
                            <span className="text-2xl font-bold">{match.home_score ?? 0}</span>
                            <span className="text-lg text-muted-foreground">-</span>
                            <span className="text-2xl font-bold">{match.away_score ?? 0}</span>
                          </div>
                          <div className="flex-1 text-center">
                            <h4 className="font-semibold">{match.away_team}</h4>
                          </div>
                        </div>
                        <div className="mt-2 text-center text-sm text-muted-foreground">
                          {new Date(match.start_time).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                        </div>
                      </CardContent>
                    </Card>)}
                </div> : <div className="text-center py-8">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No recent matches for this league</p>
                </div>}
            </TabsContent>

            {/* Statistics */}
            <TabsContent value="stats" className="space-y-6">
              {selectedLeague && groupedTables[selectedLeague] && <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="bg-gradient-card">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-muted-foreground">Top Scorer</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {groupedTables[selectedLeague].sort((a, b) => b.goals_for - a.goals_for).slice(0, 3).map((team, index) => <div key={team.id} className="flex justify-between">
                              <span className="text-sm">{team.team_name}</span>
                              <span className="font-bold">{team.goals_for}</span>
                            </div>)}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-card">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-muted-foreground">Best Defense</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {groupedTables[selectedLeague].sort((a, b) => a.goals_against - b.goals_against).slice(0, 3).map((team, index) => <div key={team.id} className="flex justify-between">
                              <span className="text-sm">{team.team_name}</span>
                              <span className="font-bold">{team.goals_against}</span>
                            </div>)}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-card">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-muted-foreground">Most Wins</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {groupedTables[selectedLeague].sort((a, b) => b.wins - a.wins).slice(0, 3).map((team, index) => <div key={team.id} className="flex justify-between">
                              <span className="text-sm">{team.team_name}</span>
                              <span className="font-bold">{team.wins}</span>
                            </div>)}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-card">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-muted-foreground">League Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Teams</span>
                          <span className="font-bold">{groupedTables[selectedLeague].length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Goals</span>
                          <span className="font-bold">
                            {groupedTables[selectedLeague].reduce((sum, team) => sum + team.goals_for, 0)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Matches Played</span>
                          <span className="font-bold">
                            {Math.max(...groupedTables[selectedLeague].map(team => team.matches_played))}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>}
            </TabsContent>
          </Tabs>}
      </div>
    </div>;
};
export default Leagues;