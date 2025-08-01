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
    const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY');
    
    if (!firecrawlApiKey) {
      return new Response(JSON.stringify({ 
        error: 'Missing Firecrawl API key' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // CAF and football news sources
    const newsSources = [
      'https://www.cafonline.com/news',
      'https://www.fifa.com/tournaments/mens/africacupofnations',
      'https://www.bbc.com/sport/football/africa',
      'https://www.goal.com/en/news/africa'
    ];

    const allNews = [];

    for (const source of newsSources) {
      try {
        console.log(`Scraping: ${source}`);
        
        const response = await fetch('https://api.firecrawl.dev/v0/scrape', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${firecrawlApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: source,
            formats: ['markdown'],
            onlyMainContent: true,
            extractorOptions: {
              mode: 'llm-extraction',
              extractionPrompt: `Extract football news articles related to CAF, CHAN, African Cup of Nations, or African football. For each article, provide:
              - title: Article headline
              - excerpt: Brief summary (max 150 chars)
              - category: Type of news (e.g., "CAF", "CHAN", "AFCON", "Transfers")
              - source: Website name
              - url: Article URL if available
              
              Return as JSON array of articles.`
            }
          }),
        });

        if (!response.ok) {
          console.error(`Failed to scrape ${source}: ${response.statusText}`);
          continue;
        }

        const data = await response.json();
        
        if (data.success && data.data) {
          let articles = [];
          
          try {
            // Try to parse extracted data
            if (data.data.extract) {
              articles = JSON.parse(data.data.extract);
            } else {
              // Fallback: extract basic info from markdown
              const markdown = data.data.markdown || '';
              const lines = markdown.split('\n').filter(line => line.trim());
              
              articles = lines
                .filter(line => line.startsWith('#') && line.length > 10)
                .slice(0, 5)
                .map((title, index) => ({
                  title: title.replace(/^#+\s*/, '').substring(0, 100),
                  excerpt: `Latest news from ${new URL(source).hostname}`,
                  category: source.includes('cafonline') ? 'CAF' : 
                           source.includes('fifa') ? 'AFCON' : 'African Football',
                  source: new URL(source).hostname,
                  url: source,
                  timeAgo: 'Recently',
                  readTime: '2 min read'
                }));
            }
          } catch (parseError) {
            console.error('Error parsing extracted data:', parseError);
            // Create a fallback article
            articles = [{
              title: `Latest news from ${new URL(source).hostname}`,
              excerpt: 'African football updates and news',
              category: 'African Football',
              source: new URL(source).hostname,
              url: source,
              timeAgo: 'Recently',
              readTime: '2 min read'
            }];
          }

          allNews.push(...articles);
        }
      } catch (sourceError) {
        console.error(`Error scraping ${source}:`, sourceError);
        // Continue with next source
      }
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