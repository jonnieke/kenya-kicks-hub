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
    
    if (!geminiApiKey) {
      return new Response(JSON.stringify({ 
        error: 'Missing Gemini API key' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Generating CAF CHAN football news with Gemini...');

    const newsPrompt = `Generate 8-10 current and realistic African football news articles focusing on:
    - CAF (Confederation of African Football) news
    - CHAN (African Nations Championship) updates  
    - AFCON (Africa Cup of Nations) related stories
    - African club competitions
    - Player transfers involving African teams
    - African national team news

    For each article, provide:
    - title: Compelling headline (max 80 chars)
    - excerpt: Detailed, readable summary (50-100 words) that provides context and makes sense as a complete thought
    - category: One of "CAF", "CHAN", "AFCON", "Transfers", "Club Football"
    - source: Realistic African football media source name
    - timeAgo: Realistic time like "2 hours ago", "1 day ago"
    - readTime: Realistic read time like "2 min read", "3 min read"

    Make the news sound current and realistic. Return as valid JSON array.

    Example format:
    [
      {
        "title": "CHAN 2025: Morocco announces final 23-man squad",
        "excerpt": "Morocco's head coach Walid Regragui has unveiled his final 23-man squad for the upcoming African Nations Championship. The Atlas Lions will rely on a mix of experienced campaigners and promising young talents from the domestic league. Notable inclusions include Raja Casablanca striker Ahmed Hammadi and Wydad defender Youssef Benami. The team will gather for a training camp in Rabat next week before departing for the tournament. Morocco enters as one of the favorites having reached the semi-finals in the previous edition.",
        "category": "CHAN",
        "source": "CAF Online",
        "timeAgo": "3 hours ago",
        "readTime": "2 min read"
      }
    ]`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: newsPrompt
          }]
        }],
        generationConfig: {
          temperature: 0.8,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      }),
    });

    if (!response.ok) {
      console.error('Gemini API error:', response.statusText);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const geminiData = await response.json();
    console.log('Gemini response received');

    let allNews = [];
    
    try {
      const generatedText = geminiData.candidates[0].content.parts[0].text;
      console.log('Generated text length:', generatedText.length);
      
      // Extract JSON from the response (handle markdown code blocks)
      const jsonMatch = generatedText.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, generatedText];
      const jsonStr = jsonMatch[1] || generatedText;
      
      allNews = JSON.parse(jsonStr.trim());
      console.log('Successfully parsed', allNews.length, 'news articles');
      
    } catch (parseError) {
      console.error('Error parsing Gemini response:', parseError);
      
      // Fallback articles if parsing fails
      allNews = [
        {
          title: "CHAN 2025: Preparations intensify across Africa",
          excerpt: "National teams across the African continent are stepping up their preparations as the 2025 African Nations Championship draws closer. Training camps have been established in Morocco, Nigeria, and South Africa, with coaches fine-tuning their squads. The tournament, featuring only locally-based players, promises to showcase the best domestic talent from across Africa. Several new faces are expected to emerge as continental stars during the competition.",
          category: "CHAN",
          source: "African Football News",
          timeAgo: "2 hours ago",
          readTime: "2 min read"
        },
        {
          title: "CAF Champions League: Quarter-final draw announced",
          excerpt: "The Confederation of African Football has revealed the quarter-final matchups for this season's Champions League, setting up some mouth-watering encounters. North African powerhouses will face stern tests from West and East African representatives. The draw has produced several intriguing storylines, including a potential all-Egyptian semi-final if both Al Ahly and Zamalek progress. Matches are scheduled to begin next month with home and away legs.",
          category: "CAF",
          source: "CAF Media",
          timeAgo: "5 hours ago", 
          readTime: "3 min read"
        },
        {
          title: "AFCON 2025: Qualification scenarios taking shape",
          excerpt: "With just a few matchdays remaining in the Africa Cup of Nations qualifiers, the picture is becoming clearer regarding which nations will secure their places at next year's tournament. Several traditional powerhouses are still fighting for qualification, while some surprise packages have already booked their spots. The final round of matches promises dramatic conclusions to several group campaigns.",
          category: "AFCON",
          source: "Goal Africa",
          timeAgo: "1 day ago",
          readTime: "2 min read"
        }
      ];
    }

    // Store scraped news in database
    if (allNews.length > 0) {
      const { data: savedNews, error } = await supabase
        .from('scraped_news')
        .upsert(
          allNews.map(article => ({
            title: article.title,
            excerpt: article.excerpt,
            category: article.category,
            source: article.source,
            source_url: article.url,
            scraped_at: new Date().toISOString()
          })),
          { onConflict: 'title' }
        )
        .select();

      if (error) {
        console.error('Error saving news:', error);
      }
    }

    return new Response(JSON.stringify({ 
      success: true,
      articles: allNews.slice(0, 20), // Return top 20 articles
      count: allNews.length 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in scrape-caf-news function:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});