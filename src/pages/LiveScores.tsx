import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Calendar, RefreshCw, Trophy, Target, Timer, Play, Users, Filter, X, ChevronDown, Vibrate, Share2 } from "lucide-react";
import { SidebarAd, BannerAd } from "@/components/AdSense";
import { LiveOddsWidget, LiveMatchWidget } from "@/components/OddspediaWidget";
import { EnhancedMatchCard } from "@/components/EnhancedMatchCard";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
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
  created_at: string;
  updated_at: string;
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
  
  // Pull-to-refresh functionality
  const [isRefreshing, setIsRefreshing] = useState(false);
  const pullToRefreshRef = useRef<HTMLDivElement>(null);
  const y = useMotionValue(0);
  const pullProgress = useTransform(y, [0, 100], [0, 1]);
  const refreshOpacity = useTransform(y, [0, 50, 100], [0, 0.5, 1]);
  
  // Filter states
  const [selectedLeague, setSelectedLeague] = useState<string>("all");
  const [selectedTeam, setSelectedTeam] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Fetch matches with real-time updates - prioritize CHAN
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
      
      // Prioritize African Nations Championship matches
      const allMatches = data as Match[];
      const chanMatches = allMatches.filter(match => 
        match.league.toLowerCase().includes('chan') || 
        match.league.toLowerCase().includes('african nations championship')
      );
      const otherMatches = allMatches.filter(match => 
        !match.league.toLowerCase().includes('chan') && 
        !match.league.toLowerCase().includes('african nations championship')
      );
      
      return [...chanMatches, ...otherMatches];
    },
    refetchInterval: 60000 // Reduced to 60 seconds to prevent blinking
  });

  // Fetch league tables - prioritize CHAN
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
      
      // Prioritize CHAN tables
      const allTables = data as LeagueTable[];
      const chanTables = allTables.filter(table => 
        table.league.toLowerCase().includes('chan') || 
        table.league.toLowerCase().includes('african nations championship')
      );
      const otherTables = allTables.filter(table => 
        !table.league.toLowerCase().includes('chan') && 
        !table.league.toLowerCase().includes('african nations championship')
      );
      
      return [...chanTables, ...otherTables];
    },
    refetchInterval: 120000 // Refresh tables every 2 minutes to reduce blinking
  });

  // Set up real-time subscriptions with better error handling
  useEffect(() => {
    const matchesChannel = supabase.channel('matches-changes').on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'matches'
    }, payload => {
      console.log('Match update:', payload);
      refetchMatches();
      if (payload.eventType === 'UPDATE' && payload.new) {
        const match = payload.new as Match;
        toast.success(`⚽ ${match.home_team} ${match.home_score} - ${match.away_score} ${match.away_team}`, {
          description: `Match updated in ${match.league}`,
          duration: 5000,
        });
      }
    }).subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('Real-time matches subscription active');
      }
    });

    const tablesChannel = supabase.channel('tables-changes').on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'league_tables'
    }, () => {
      refetchTables();
    }).subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('Real-time tables subscription active');
      }
    });

    return () => {
      supabase.removeChannel(matchesChannel);
      supabase.removeChannel(tablesChannel);
    };
  }, [refetchMatches, refetchTables]);

  // Get unique leagues and teams for filter options
  const uniqueLeagues = useMemo(() => {
    const leagues = [...new Set(matches.map(match => match.league))];
    return leagues.sort();
  }, [matches]);

  const uniqueTeams = useMemo(() => {
    const teams = new Set<string>();
    matches.forEach(match => {
      teams.add(match.home_team);
      teams.add(match.away_team);
    });
    return [...teams].sort();
  }, [matches]);

  // Apply filters
  const filteredMatches = useMemo(() => {
    return matches.filter(match => {
      // League filter
      if (selectedLeague !== "all" && match.league !== selectedLeague) {
        return false;
      }
      
      // Team filter
      if (selectedTeam !== "all" && 
          !match.home_team.includes(selectedTeam) && 
          !match.away_team.includes(selectedTeam)) {
        return false;
      }
      
      // Date filter
      if (selectedDate) {
        const matchDate = new Date(match.start_time);
        const filterDate = new Date(selectedDate);
        if (matchDate.toDateString() !== filterDate.toDateString()) {
          return false;
        }
      }
      
      // Search term filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          match.home_team.toLowerCase().includes(searchLower) ||
          match.away_team.toLowerCase().includes(searchLower) ||
          match.league.toLowerCase().includes(searchLower)
        );
      }
      
      return true;
    });
  }, [matches, selectedLeague, selectedTeam, selectedDate, searchTerm]);

  // Filter matches by status with better categorization
  const liveMatches = filteredMatches
    .filter(match => ['LIVE', '1H', '2H', 'HT'].includes(match.status))
    .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime()); // Latest on top
  const upcomingMatches = filteredMatches
    .filter(match => ['UPCOMING', 'TIMED', 'NS'].includes(match.status))
    .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime()); // Latest on top
  const recentResults = filteredMatches.filter(match => ['FT', 'FINISHED'].includes(match.status));

  // Clear all filters
  const clearFilters = () => {
    setSelectedLeague("all");
    setSelectedTeam("all");
    setSelectedDate(undefined);
    setSearchTerm("");
  };

  // Check if any filters are active
  const hasActiveFilters = selectedLeague !== "all" || selectedTeam !== "all" || selectedDate || searchTerm;

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

  // Pull-to-refresh handlers with haptic feedback
  const handlePullToRefresh = useCallback(async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    
    // Add haptic feedback on mobile
    if (navigator.vibrate) {
      navigator.vibrate([50, 30, 50]); // Pattern: vibrate-pause-vibrate
    }
    
    try {
      await Promise.all([
        refetchMatches(),
        refetchTables()
      ]);
      
      toast.success("✅ Matches refreshed!");
    } catch (error) {
      toast.error("Failed to refresh matches");
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, refetchMatches, refetchTables]);

  const handlePanEnd = useCallback((event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.y > 100 && !isRefreshing) {
      handlePullToRefresh();
    }
    y.set(0);
  }, [handlePullToRefresh, isRefreshing, y]);

  return (
    <motion.div 
      className="min-h-screen bg-background p-6"
      ref={pullToRefreshRef}
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={{ top: 0.2, bottom: 0 }}
      onPanEnd={handlePanEnd}
      style={{ y }}
    >
      {/* Pull to refresh indicator */}
      <motion.div
        className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50 bg-primary text-primary-foreground px-4 py-2 rounded-full shadow-lg"
        style={{ 
          opacity: refreshOpacity,
          scale: pullProgress
        }}
        initial={{ y: -50 }}
        animate={{ y: isRefreshing ? 0 : -50 }}
      >
        <div className="flex items-center gap-2">
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="text-sm font-medium">
            {isRefreshing ? 'Refreshing...' : 'Pull to refresh'}
          </span>
        </div>
      </motion.div>

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

        {/* Filters Section */}
        <Card className="bg-gradient-card border-border">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">Filters</h2>
                {hasActiveFilters && (
                  <Badge variant="secondary" className="ml-2">
                    {[
                      selectedLeague !== "all" ? "League" : "",
                      selectedTeam !== "all" ? "Team" : "",
                      selectedDate ? "Date" : "",
                      searchTerm ? "Search" : ""
                    ].filter(Boolean).length} active
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                {hasActiveFilters && (
                  <Button variant="outline" size="sm" onClick={clearFilters}>
                    <X className="w-4 h-4 mr-1" />
                    Clear
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowFilters(!showFilters)}
                  className="md:hidden"
                >
                  <Filter className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className={`${showFilters ? 'block' : 'hidden md:block'}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Search</label>
                <Input
                  placeholder="Search teams or leagues..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-background"
                />
              </div>

              {/* League Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">League</label>
                <Select value={selectedLeague} onValueChange={setSelectedLeague}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="All leagues" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    <SelectItem value="all">All leagues</SelectItem>
                    {uniqueLeagues.map(league => (
                      <SelectItem key={league} value={league}>
                        {league}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Team Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Team</label>
                <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="All teams" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover max-h-72">
                    <SelectItem value="all">All teams</SelectItem>
                    {uniqueTeams.map(team => (
                      <SelectItem key={team} value={team}>
                        {team}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal bg-background"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP") : "All dates"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-popover" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      initialFocus
                      className="pointer-events-auto"
                    />
                    {selectedDate && (
                      <div className="p-3 border-t">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setSelectedDate(undefined)}
                          className="w-full"
                        >
                          Clear date
                        </Button>
                      </div>
                    )}
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Banner Ad */}
        <div className="flex justify-center">
          <BannerAd className="w-full max-w-4xl" />
        </div>

        {/* Live Odds Widget */}
        <LiveOddsWidget 
          title="Live Betting Odds & Predictions"
          className="w-full"
          autoRefresh={true}
          refreshInterval={30000}
        />

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
                {liveMatches.map(match => (
                  <EnhancedMatchCard
                    key={match.id}
                    match={{
                      id: match.id,
                      homeTeam: match.home_team,
                      awayTeam: match.away_team,
                      homeScore: match.home_score || undefined,
                      awayScore: match.away_score || undefined,
                      minute: match.minute || undefined,
                      league: match.league,
                      status: match.status.toLowerCase() as any,
                      startTime: match.start_time,
                      odds: {
                        home: 2.0,
                        draw: 3.2,
                        away: 3.8
                      },
                      predictions: {
                        homeWin: 45,
                        draw: 28,
                        awayWin: 27
                      }
                    }}
                    showOdds={true}
                    showPredictions={true}
                    onPredict={(matchId) => {
                      // Handle prediction
                      console.log('Predict for match:', matchId);
                    }}
                  />
                ))}
              </div>}
          </TabsContent>

          {/* Upcoming Fixtures */}
          <TabsContent value="fixtures" className="space-y-4">
            {upcomingMatches.length === 0 ? <div className="text-center py-8">
                <Timer className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No upcoming fixtures</p>
              </div> : <div className="grid gap-4">
                {upcomingMatches.map(match => (
                  <EnhancedMatchCard
                    key={match.id}
                    match={{
                      id: match.id,
                      homeTeam: match.home_team,
                      awayTeam: match.away_team,
                      homeScore: match.home_score || undefined,
                      awayScore: match.away_score || undefined,
                      minute: match.minute || undefined,
                      league: match.league,
                      status: match.status.toLowerCase() as any,
                      startTime: match.start_time,
                      odds: {
                        home: 2.1,
                        draw: 3.1,
                        away: 3.9
                      },
                      predictions: {
                        homeWin: 42,
                        draw: 30,
                        awayWin: 28
                      }
                    }}
                    showOdds={true}
                    showPredictions={true}
                    onPredict={(matchId) => {
                      // Handle prediction
                      console.log('Predict for match:', matchId);
                    }}
                  />
                ))}
              </div>}
          </TabsContent>

          {/* Recent Results */}
          <TabsContent value="results" className="space-y-4">
            {recentResults.length === 0 ? <div className="text-center py-8">
                <Target className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No recent results</p>
              </div> : <div className="grid gap-4">
                {recentResults.map(match => (
                  <EnhancedMatchCard
                    key={match.id}
                    match={{
                      id: match.id,
                      homeTeam: match.home_team,
                      awayTeam: match.away_team,
                      homeScore: match.home_score || undefined,
                      awayScore: match.away_score || undefined,
                      minute: match.minute || undefined,
                      league: match.league,
                      status: match.status.toLowerCase() as any,
                      startTime: match.start_time,
                      odds: {
                        home: 2.0,
                        draw: 3.2,
                        away: 3.8
                      },
                      predictions: {
                        homeWin: 45,
                        draw: 28,
                        awayWin: 27
                      }
                    }}
                    showOdds={false}
                    showPredictions={false}
                    onPredict={(matchId) => {
                      // Handle prediction
                      console.log('Predict for match:', matchId);
                    }}
                  />
                ))}
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
                          <TableHead className="text-center w-20">Last Updated</TableHead>
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
                            <TableCell className="text-center text-xs text-muted-foreground">
                              {new Date(team.updated_at || team.created_at).toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </TableCell>
                          </TableRow>)}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>)}
          </TabsContent>
        </Tabs>

        {/* Match Details Modal */}
        <Dialog open={!!selectedMatch} onOpenChange={() => setSelectedMatch(null)}>
          <DialogContent className="max-w-4xl">
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
                      <span className="text-4xl font-bold text-primary">
                        {selectedMatch.home_score !== null ? selectedMatch.home_score : '-'}
                      </span>
                    </div>
                    <span className="text-2xl text-muted-foreground">-</span>
                    <div className="text-center">
                      <h3 className="text-xl font-bold">{selectedMatch.away_team}</h3>
                      <span className="text-4xl font-bold text-primary">
                        {selectedMatch.away_score !== null ? selectedMatch.away_score : '-'}
                      </span>
                    </div>
                  </div>
                  {selectedMatch.minute && <p className="text-sm text-muted-foreground mt-2">{selectedMatch.minute}'</p>}
                  {!['LIVE', '1H', '2H', 'HT', 'FT', 'FINISHED'].includes(selectedMatch.status) && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {new Date(selectedMatch.start_time).toLocaleString('en-US', {
                        weekday: 'long',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  )}
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

                {/* Oddspedia Match Widget */}
                {selectedMatch && (
                  <div className="mt-6">
                    <h4 className="font-semibold mb-4">Live Match Analysis & Odds</h4>
                    <LiveMatchWidget 
                      matchId={selectedMatch.id}
                      title={`${selectedMatch.home_team} vs ${selectedMatch.away_team} - Live Analysis`}
                      autoRefresh={true}
                      refreshInterval={15000}
                    />
                  </div>
                )}
              </div>}
          </DialogContent>
        </Dialog>
      </div>
    </motion.div>
  );
};
export default LiveScores;