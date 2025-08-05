import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? ''
);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting prediction generation...');
    
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    const footballApiKey = Deno.env.get('FOOTBALL_DATA_API_KEY');
    
    console.log('API Keys check:', {
      gemini: geminiApiKey ? 'Present' : 'Missing',
      footballData: footballApiKey ? 'Present' : 'Missing'
    });
    
    if (!geminiApiKey || !footballApiKey) {
      console.log('Missing API keys!');
      return new Response(JSON.stringify({ 
        error: 'Missing required API keys' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let upcomingMatches = [];

    try {
      // Try Football Data API first
      console.log('Fetching matches from Football Data API...');
      const today = new Date().toISOString().split('T')[0];
      const footballResponse = await fetch(`https://api.football-data.org/v4/matches?dateFrom=${today}`, {
        headers: {
          'X-Auth-Token': footballApiKey
        }
      });

      console.log('Football Data API response status:', footballResponse.status);
      const responseText = await footballResponse.text();
      console.log('Football Data API raw response:', responseText.substring(0, 500));

      if (footballResponse.ok) {
        let footballData;
        try {
          footballData = JSON.parse(responseText);
          console.log('Football data received:', { 
            count: footballData.count || 0,
            matches: footballData.matches?.length || 0,
            filters: footballData.filters || 'none'
          });
          
          upcomingMatches = footballData.matches?.slice(0, 5) || [];
        } catch (e) {
          console.error('Failed to parse Football Data API JSON:', e);
        }
      } else {
        console.error('Football Data API error:', responseText);
      }
    } catch (error) {
      console.error('Football Data API failed:', error);
    }

    // If no matches from Football Data API, try fallback or create sample data
    if (upcomingMatches.length === 0) {
      console.log('Creating sample prediction data...');
      upcomingMatches = [
        {
          id: 'sample_1',
          homeTeam: { name: 'Liverpool FC' },
          awayTeam: { name: 'Manchester City' },
          competition: { name: 'Premier League' },
          utcDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'sample_2', 
          homeTeam: { name: 'Arsenal FC' },
          awayTeam: { name: 'Chelsea FC' },
          competition: { name: 'Premier League' },
          utcDate: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'sample_3',
          homeTeam: { name: 'Real Madrid' },
          awayTeam: { name: 'Barcelona' },
          competition: { name: 'La Liga' },
          utcDate: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString()
        }
      ];
    }
    console.log('Upcoming matches count:', upcomingMatches.length);

    // Generate AI predictions for each match
    const predictions = [];

    for (const match of upcomingMatches) {
      console.log('Processing match:', {
        id: match.id,
        home: match.homeTeam?.name,
        away: match.awayTeam?.name,
        competition: match.competition?.name
      });

      const prompt = `Analyze this football match and provide a prediction:
      
Home Team: ${match.homeTeam?.name || 'Unknown'}
Away Team: ${match.awayTeam?.name || 'Unknown'}
Competition: ${match.competition?.name || 'Unknown'}
Date: ${match.utcDate}

Based on team form, head-to-head records, and current standings, provide:
1. Score prediction (format: "X-Y")
2. Confidence percentage (0-100)
3. Brief reasoning (max 50 words)

Respond in JSON format: {"prediction": "2-1", "confidence": 75, "reasoning": "Home team advantage..."}`;

      try {
        const aiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `You are an expert football analyst. ${prompt}`
              }]
            }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1000,
            }
          }),
        });

        const aiData = await aiResponse.json();
        let aiPrediction;
        
        try {
          const responseText = aiData.candidates[0].content.parts[0].text;
          aiPrediction = JSON.parse(responseText);
        } catch {
          // Fallback if AI doesn't return valid JSON
          aiPrediction = {
            prediction: "1-1",
            confidence: 60,
            reasoning: "Unable to generate detailed analysis"
          };
        }

        // Store prediction in database
        const { data: savedPrediction, error } = await supabase
          .from('predictions')
          .insert({
            match_id: match.id?.toString() || `temp_${Date.now()}`,
            predicted_score: aiPrediction.prediction,
            confidence_score: aiPrediction.confidence,
            reasoning: aiPrediction.reasoning,
            ai_model_used: 'gemini-1.5-flash',
            home_win_odds: Math.random() * 2 + 1.5,
            draw_odds: Math.random() * 2 + 2.5,
            away_win_odds: Math.random() * 3 + 2
          })
          .select()
          .single();

        console.log('Database insert result:', { savedPrediction, error });

        if (!error && savedPrediction) {
          predictions.push({
            id: savedPrediction.id,
            homeTeam: match.homeTeam?.name || 'Unknown',
            awayTeam: match.awayTeam?.name || 'Unknown', 
            prediction: savedPrediction.predicted_score,
            confidence: savedPrediction.confidence_score,
            reasoning: savedPrediction.reasoning,
            league: match.competition?.name || 'Unknown',
            date: new Date(match.utcDate).toLocaleDateString('en-US', {
              weekday: 'long',
              hour: '2-digit',
              minute: '2-digit'
            }),
            odds: {
              home: savedPrediction.home_win_odds?.toFixed(1) || "2.1",
              draw: savedPrediction.draw_odds?.toFixed(1) || "3.2", 
              away: savedPrediction.away_win_odds?.toFixed(1) || "3.8"
            }
          });
        } else if (error) {
          console.error('Database insert error:', error);
        }
      } catch (aiError) {
        console.error('AI prediction error:', aiError);
        // Continue with next match even if one fails
      }
    }

    return new Response(JSON.stringify({ predictions }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-predictions function:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});