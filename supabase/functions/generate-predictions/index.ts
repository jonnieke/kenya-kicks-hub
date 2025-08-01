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
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    const footballApiKey = Deno.env.get('FOOTBALL_API_KEY');
    
    if (!geminiApiKey || !footballApiKey) {
      return new Response(JSON.stringify({ 
        error: 'Missing required API keys' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch upcoming matches from football API
    const footballResponse = await fetch('https://api.football-data.org/v4/matches', {
      headers: {
        'X-Auth-Token': footballApiKey
      }
    });

    if (!footballResponse.ok) {
      throw new Error('Failed to fetch football data');
    }

    const footballData = await footballResponse.json();
    const upcomingMatches = footballData.matches?.slice(0, 10) || [];

    // Generate AI predictions for each match
    const predictions = [];

    for (const match of upcomingMatches) {
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
            home_team: match.homeTeam?.name || 'Unknown',
            away_team: match.awayTeam?.name || 'Unknown',
            league: match.competition?.name || 'Unknown',
            match_date: match.utcDate,
            prediction: aiPrediction.prediction,
            confidence: aiPrediction.confidence,
            reasoning: aiPrediction.reasoning,
            external_match_id: match.id?.toString()
          })
          .select()
          .single();

        if (!error && savedPrediction) {
          predictions.push({
            id: savedPrediction.id,
            homeTeam: savedPrediction.home_team,
            awayTeam: savedPrediction.away_team,
            prediction: savedPrediction.prediction,
            confidence: savedPrediction.confidence,
            reasoning: savedPrediction.reasoning,
            league: savedPrediction.league,
            date: new Date(savedPrediction.match_date).toLocaleDateString('en-US', {
              weekday: 'long',
              hour: '2-digit',
              minute: '2-digit'
            }),
            odds: {
              home: (Math.random() * 2 + 1.5).toFixed(1),
              draw: (Math.random() * 2 + 2.5).toFixed(1),
              away: (Math.random() * 3 + 2).toFixed(1)
            }
          });
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