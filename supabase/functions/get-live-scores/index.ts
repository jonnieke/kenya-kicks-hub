import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('FOOTBALL_DATA_API_KEY');
    
    if (!apiKey) {
      throw new Error('Football Data API key not configured');
    }

    // Fetch live scores from football-data.org
    const response = await fetch('https://api.football-data.org/v4/matches?status=LIVE,FINISHED', {
      headers: {
        'X-Auth-Token': apiKey,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Football Data API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Transform the data to match our expected format
    const transformedMatches = data.matches?.map((match: any) => ({
      id: match.id,
      homeTeam: match.homeTeam.name,
      awayTeam: match.awayTeam.name,
      homeScore: match.score.fullTime.homeTeam || 0,
      awayScore: match.score.fullTime.awayTeam || 0,
      status: match.status === 'IN_PLAY' ? 'LIVE' : 
              match.status === 'FINISHED' ? 'FT' : 'UPCOMING',
      minute: match.status === 'IN_PLAY' ? `${match.minute || 0}'` : 
              match.status === 'FINISHED' ? 'FT' :
              new Date(match.utcDate).toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
              }),
      league: match.competition.name,
      matchDate: match.utcDate
    })) || [];

    console.log(`Fetched ${transformedMatches.length} matches from Football Data API`);

    return new Response(
      JSON.stringify({ matches: transformedMatches }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error fetching live scores:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to fetch live scores',
        details: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});