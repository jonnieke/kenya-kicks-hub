import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ApiFootballFixture {
  fixture: {
    id: number;
    date: string;
    status: {
      short: string;
    };
    venue?: {
      name: string;
    };
  };
  league: {
    id: number;
    name: string;
    country: string;
  };
  teams: {
    home: { id: number; name: string; };
    away: { id: number; name: string; };
  };
  goals: {
    home: number | null;
    away: number | null;
  };
  score: {
    halftime: { home: number | null; away: number | null; };
    fulltime: { home: number | null; away: number | null; };
  };
}

interface ApiFootballStanding {
  league: {
    id: number;
    name: string;
    country: string;
    standings: Array<Array<{
      rank: number;
      team: { id: number; name: string; };
      points: number;
      goalsDiff: number;
      all: {
        played: number;
        win: number;
        draw: number;
        lose: number;
        goals: { for: number; against: number; };
      };
    }>>;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const apiKey = Deno.env.get('FOOTBALL_DATA_API_KEY');
    if (!apiKey) {
      throw new Error('FOOTBALL_DATA_API_KEY not configured');
    }

    const { searchParams } = new URL(req.url);
    const operation = searchParams.get('operation') || 'all';

    console.log(`Starting football data fetch operation: ${operation}`);

    // Define the leagues we want to track
    const leagues = [
      { id: 39, name: 'Premier League', country: 'England' }, // Premier League
      { id: 140, name: 'La Liga', country: 'Spain' }, // La Liga
      { id: 78, name: 'Bundesliga', country: 'Germany' }, // Bundesliga
      { id: 135, name: 'Serie A', country: 'Italy' }, // Serie A
      { id: 61, name: 'Ligue 1', country: 'France' }, // Ligue 1
      // Add African leagues
      { id: 233, name: 'CAF CHAN', country: 'Africa' }, // CAF African Nations Championship
    ];

    const results = {
      liveMatches: 0,
      fixtures: 0,
      standings: 0,
      errors: [] as string[]
    };

    if (operation === 'live' || operation === 'all') {
      // Fetch live matches
      try {
        console.log('Fetching live matches...');
        const liveResponse = await fetch('https://v3.football.api-sports.io/fixtures?live=all', {
          headers: {
            'x-apisports-key': apiKey,
            'x-rapidapi-host': 'v3.football.api-sports.io'
          }
        });

        if (liveResponse.ok) {
          const liveData = await liveResponse.json();
          console.log(`Found ${liveData.response?.length || 0} live matches`);
          
          if (liveData.response && liveData.response.length > 0) {
            for (const fixture of liveData.response as ApiFootballFixture[]) {
              const matchData = {
                api_match_id: fixture.fixture.id.toString(),
                home_team: fixture.teams.home.name,
                away_team: fixture.teams.away.name,
                home_score: fixture.goals.home,
                away_score: fixture.goals.away,
                status: fixture.fixture.status.short,
                start_time: fixture.fixture.date,
                match_date: fixture.fixture.date,
                league: fixture.league.name,
                venue: fixture.fixture.venue?.name,
                minute: fixture.fixture.status.short === 'LIVE' ? 'LIVE' : null,
                updated_at: new Date().toISOString()
              };

              const { error } = await supabaseClient
                .from('matches')
                .upsert(matchData, { onConflict: 'api_match_id' });

              if (error) {
                console.error('Error upserting match:', error);
                results.errors.push(`Match upsert error: ${error.message}`);
              } else {
                results.liveMatches++;
              }
            }
          }
        }
      } catch (error) {
        console.error('Error fetching live matches:', error);
        results.errors.push(`Live matches error: ${error.message}`);
      }
    }

    if (operation === 'fixtures' || operation === 'all') {
      // Fetch today's fixtures
      try {
        console.log('Fetching today\'s fixtures...');
        const today = new Date().toISOString().split('T')[0];
        const fixturesResponse = await fetch(`https://v3.football.api-sports.io/fixtures?date=${today}`, {
          headers: {
            'x-apisports-key': apiKey,
            'x-rapidapi-host': 'v3.football.api-sports.io'
          }
        });

        if (fixturesResponse.ok) {
          const fixturesData = await fixturesResponse.json();
          console.log(`Found ${fixturesData.response?.length || 0} fixtures for today`);
          
          if (fixturesData.response && fixturesData.response.length > 0) {
            for (const fixture of fixturesData.response as ApiFootballFixture[]) {
              const matchData = {
                api_match_id: fixture.fixture.id.toString(),
                home_team: fixture.teams.home.name,
                away_team: fixture.teams.away.name,
                home_score: fixture.goals.home,
                away_score: fixture.goals.away,
                status: fixture.fixture.status.short,
                start_time: fixture.fixture.date,
                match_date: fixture.fixture.date,
                league: fixture.league.name,
                venue: fixture.fixture.venue?.name,
                updated_at: new Date().toISOString()
              };

              const { error } = await supabaseClient
                .from('matches')
                .upsert(matchData, { onConflict: 'api_match_id' });

              if (error) {
                console.error('Error upserting fixture:', error);
                results.errors.push(`Fixture upsert error: ${error.message}`);
              } else {
                results.fixtures++;
              }
            }
          }
        }
      } catch (error) {
        console.error('Error fetching fixtures:', error);
        results.errors.push(`Fixtures error: ${error.message}`);
      }
    }

    if (operation === 'standings' || operation === 'all') {
      // Fetch league standings for major leagues
      for (const league of leagues.slice(0, 3)) { // Limit to first 3 to save API calls
        try {
          console.log(`Fetching standings for ${league.name}...`);
          const standingsResponse = await fetch(`https://v3.football.api-sports.io/standings?league=${league.id}&season=2024`, {
            headers: {
              'x-apisports-key': apiKey,
              'x-rapidapi-host': 'v3.football.api-sports.io'
            }
          });

          if (standingsResponse.ok) {
            const standingsData = await standingsResponse.json();
            
            if (standingsData.response && standingsData.response.length > 0) {
              const leagueData = standingsData.response[0] as ApiFootballStanding;
              const standings = leagueData.league.standings[0];

              for (const team of standings) {
                const teamData = {
                  team_name: team.team.name,
                  league: leagueData.league.name,
                  position: team.rank,
                  points: team.points,
                  matches_played: team.all.played,
                  wins: team.all.win,
                  draws: team.all.draw,
                  losses: team.all.lose,
                  goals_for: team.all.goals.for,
                  goals_against: team.all.goals.against,
                  goal_difference: team.goalsDiff,
                  updated_at: new Date().toISOString()
                };

                const { error } = await supabaseClient
                  .from('league_tables')
                  .upsert(teamData, { onConflict: 'team_name,league' });

                if (error) {
                  console.error('Error upserting team standing:', error);
                  results.errors.push(`Standing upsert error: ${error.message}`);
                } else {
                  results.standings++;
                }
              }
            }
          }
        } catch (error) {
          console.error(`Error fetching standings for ${league.name}:`, error);
          results.errors.push(`Standings error for ${league.name}: ${error.message}`);
        }
      }
    }

    console.log('Football data fetch completed:', results);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Football data updated successfully',
        results
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in fetch-football-data function:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});