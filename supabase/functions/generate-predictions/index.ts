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
    const footballApiKey = Deno.env.get('APIFOOTBALL_KEY');
    
    console.log('API Keys check:', {
      gemini: geminiApiKey ? 'Present' : 'Missing',
      football: footballApiKey ? 'Present' : 'Missing'
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

    // Fetch upcoming matches from API-FOOTBALL
    console.log('Fetching matches from API-FOOTBALL...');
    const footballResponse = await fetch('https://v3.football.api-sports.io/fixtures?next=10', {
      headers: {
        'X-RapidAPI-Key': footballApiKey,
        'X-RapidAPI-Host': 'v3.football.api-sports.io'
      }
    });

    console.log('API-FOOTBALL response status:', footballResponse.status);

    if (!footballResponse.ok) {
      throw new Error(`Failed to fetch football data: ${footballResponse.status}`);
    }

    const footballData = await footballResponse.json();
    console.log('Football data received:', { 
      results: footballData.results || 0,
      fixtures: footballData.response?.length || 0 
    });
    
    const upcomingMatches = footballData.response?.slice(0, 5) || [];

    // Generate AI predictions for each match
    const predictions = [];

    for (const match of upcomingMatches) {
      console.log('Processing match:', {
        id: match.fixture?.id,
        home: match.teams?.home?.name,
        away: match.teams?.away?.name,
        league: match.league?.name
      });

      const prompt = `Analyze this football match and provide a prediction:
      
Home Team: ${match.teams?.home?.name || 'Unknown'}
Away Team: ${match.teams?.away?.name || 'Unknown'}
Competition: ${match.league?.name || 'Unknown'}
Date: ${match.fixture?.date}

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
            match_id: match.fixture?.id?.toString() || `temp_${Date.now()}`,
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
            homeTeam: match.teams?.home?.name || 'Unknown',
            awayTeam: match.teams?.away?.name || 'Unknown', 
            prediction: savedPrediction.predicted_score,
            confidence: savedPrediction.confidence_score,
            reasoning: savedPrediction.reasoning,
            league: match.league?.name || 'Unknown',
            date: new Date(match.fixture?.date).toLocaleDateString('en-US', {
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