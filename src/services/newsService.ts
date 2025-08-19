import { supabase } from '@/integrations/supabase/client';

export interface NewsSource {
  id: string;
  name: string;
  url: string;
  type: 'api' | 'rss' | 'scraping';
  category: string;
  isActive: boolean;
  lastFetched?: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  image_url?: string;
  source: string;
  source_url?: string;
  category: string;
  tags: string[];
  published_at: string;
  author?: string;
  read_time?: string;
  engagement_score?: number;
}

export interface NewsAPIConfig {
  apiKey: string;
  baseUrl: string;
  endpoints: {
    topHeadlines: string;
    everything: string;
    sources: string;
  };
}

class NewsService {
  private newsAPIConfig: NewsAPIConfig = {
    apiKey: import.meta.env.VITE_NEWS_API_KEY || '',
    baseUrl: 'https://newsapi.org/v2',
    endpoints: {
      topHeadlines: '/top-headlines',
      everything: '/everything',
      sources: '/sources'
    }
  };

  private rssSources = [
    {
      name: 'BBC Sport Football',
      url: 'https://feeds.bbci.co.uk/sport/football/rss.xml',
      category: 'International'
    },
    {
      name: 'ESPN Football',
      url: 'https://www.espn.com/espn/rss/soccer/news.rss',
      category: 'International'
    },
    {
      name: 'Goal.com',
      url: 'https://www.goal.com/en/feeds/news/news',
      category: 'International'
    },
    {
      name: 'CAF Media',
      url: 'https://www.cafonline.com/news',
      category: 'African'
    }
  ];

  private footballKeywords = [
    'Premier League', 'La Liga', 'Serie A', 'Bundesliga', 'Champions League',
    'Europa League', 'World Cup', 'Euro', 'AFCON', 'CAF', 'Kenya', 'Gor Mahia',
    'AFC Leopards', 'Tusker', 'Sofapaka', 'Kariobangi Sharks', 'Bandari',
    'Arsenal', 'Chelsea', 'Manchester United', 'Manchester City', 'Liverpool',
    'Real Madrid', 'Barcelona', 'Bayern Munich', 'PSG', 'Juventus', 'AC Milan'
  ];

  /**
   * Fetch news from multiple sources
   */
  async fetchAllNews(): Promise<NewsArticle[]> {
    try {
      const [apiNews, rssNews, scrapedNews] = await Promise.allSettled([
        this.fetchNewsAPI(),
        this.fetchRSSFeeds(),
        this.fetchScrapedNews()
      ]);

      let allNews: NewsArticle[] = [];

      // Add API news
      if (apiNews.status === 'fulfilled' && apiNews.value) {
        allNews.push(...apiNews.value);
      }

      // Add RSS news
      if (rssNews.status === 'fulfilled' && rssNews.value) {
        allNews.push(...rssNews.value);
      }

      // Add scraped news
      if (scrapedNews.status === 'fulfilled' && scrapedNews.value) {
        allNews.push(...scrapedNews.value);
      }

      // Remove duplicates, sort by date, and limit results
      const uniqueNews = this.removeDuplicates(allNews);
      const sortedNews = uniqueNews.sort((a, b) => 
        new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
      );

      return sortedNews.slice(0, 50); // Return top 50 articles
    } catch (error) {
      console.error('Error fetching all news:', error);
      return [];
    }
  }

  /**
   * Fetch news from NewsAPI
   */
  private async fetchNewsAPI(): Promise<NewsArticle[]> {
    if (!this.newsAPIConfig.apiKey) {
      console.warn('NewsAPI key not configured');
      return [];
    }

    try {
      const queries = [
        'football OR soccer OR "Premier League" OR "La Liga" OR "Serie A" OR "Bundesliga"',
        'Champions League OR "Europa League" OR "World Cup"',
        'Kenya OR "Gor Mahia" OR "AFC Leopards" OR CAF OR AFCON'
      ];

      const newsPromises = queries.map(query => 
        fetch(`${this.newsAPIConfig.baseUrl}${this.newsAPIConfig.endpoints.everything}?q=${encodeURIComponent(query)}&language=en&sortBy=publishedAt&apiKey=${this.newsAPIConfig.apiKey}`)
          .then(res => res.json())
      );

      const responses = await Promise.all(newsPromises);
      const articles: NewsArticle[] = [];

      responses.forEach(response => {
        if (response.status === 'ok' && response.articles) {
          response.articles.forEach((article: any) => {
            if (this.isFootballRelated(article.title, article.description)) {
              articles.push({
                id: `api_${article.url?.hashCode() || Date.now()}`,
                title: article.title,
                content: article.content || article.description,
                excerpt: article.description,
                image_url: article.urlToImage,
                source: article.source?.name || 'NewsAPI',
                source_url: article.url,
                category: this.categorizeArticle(article.title, article.description),
                tags: this.extractTags(article.title, article.description),
                published_at: article.publishedAt,
                author: article.author,
                read_time: this.calculateReadTime(article.content || article.description),
                engagement_score: this.calculateEngagementScore(article)
              });
            }
          });
        }
      });

      return articles;
    } catch (error) {
      console.error('Error fetching from NewsAPI:', error);
      return [];
    }
  }

  /**
   * Fetch news from RSS feeds
   */
  private async fetchRSSFeeds(): Promise<NewsArticle[]> {
    try {
      const articles: NewsArticle[] = [];

      for (const source of this.rssSources) {
        try {
          // Use a CORS proxy for RSS feeds
          const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(source.url)}`;
          const response = await fetch(proxyUrl);
          const data = await response.json();
          
          if (data.contents) {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(data.contents, 'text/xml');
            const items = xmlDoc.querySelectorAll('item');

            items.forEach((item, index) => {
              const title = item.querySelector('title')?.textContent || '';
              const description = item.querySelector('description')?.textContent || '';
              const link = item.querySelector('link')?.textContent || '';
              const pubDate = item.querySelector('pubDate')?.textContent || '';

              if (this.isFootballRelated(title, description)) {
                articles.push({
                  id: `rss_${source.name}_${index}_${Date.now()}`,
                  title: title,
                  content: description,
                  excerpt: description.substring(0, 200),
                  source: source.name,
                  source_url: link,
                  category: source.category,
                  tags: this.extractTags(title, description),
                  published_at: pubDate,
                  read_time: this.calculateReadTime(description),
                  engagement_score: this.calculateEngagementScore({ title, description })
                });
              }
            });
          }
        } catch (error) {
          console.error(`Error fetching RSS from ${source.name}:`, error);
        }
      }

      return articles;
    } catch (error) {
      console.error('Error fetching RSS feeds:', error);
      return [];
    }
  }

  /**
   * Fetch scraped news from your existing system
   */
  private async fetchScrapedNews(): Promise<NewsArticle[]> {
    try {
      const { data, error } = await supabase
        .from('scraped_news')
        .select('*')
        .order('scraped_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      return (data || []).map(item => ({
        id: `scraped_${item.id}`,
        title: item.title,
        content: item.excerpt,
        excerpt: item.excerpt,
        source: item.source,
        source_url: item.source_url,
        category: item.category,
        tags: [],
        published_at: item.scraped_at,
        read_time: this.calculateReadTime(item.excerpt),
        engagement_score: 0
      }));
    } catch (error) {
      console.error('Error fetching scraped news:', error);
      return [];
    }
  }

  /**
   * Check if article is football-related
   */
  private isFootballRelated(title: string, description: string): boolean {
    const text = `${title} ${description}`.toLowerCase();
    return this.footballKeywords.some(keyword => 
      text.includes(keyword.toLowerCase())
    );
  }

  /**
   * Categorize article based on content
   */
  private categorizeArticle(title: string, description: string): string {
    const text = `${title} ${description}`.toLowerCase();
    
    if (text.includes('champions league') || text.includes('europa league')) return 'UEFA';
    if (text.includes('premier league')) return 'Premier League';
    if (text.includes('la liga')) return 'La Liga';
    if (text.includes('serie a')) return 'Serie A';
    if (text.includes('bundesliga')) return 'Bundesliga';
    if (text.includes('caf') || text.includes('afcon')) return 'African';
    if (text.includes('kenya') || text.includes('gor mahia') || text.includes('afc leopards')) return 'Kenyan';
    if (text.includes('transfer') || text.includes('signing')) return 'Transfer News';
    if (text.includes('injury') || text.includes('suspension')) return 'Player News';
    if (text.includes('match') || text.includes('result')) return 'Match Report';
    
    return 'General';
  }

  /**
   * Extract relevant tags from content
   */
  private extractTags(title: string, description: string): string[] {
    const text = `${title} ${description}`.toLowerCase();
    const tags: string[] = [];
    
    this.footballKeywords.forEach(keyword => {
      if (text.includes(keyword.toLowerCase())) {
        tags.push(keyword);
      }
    });

    // Add common football terms
    const commonTerms = ['transfer', 'injury', 'goal', 'assist', 'red card', 'yellow card', 'penalty'];
    commonTerms.forEach(term => {
      if (text.includes(term)) {
        tags.push(term.charAt(0).toUpperCase() + term.slice(1));
      }
    });

    return tags.slice(0, 5); // Limit to 5 tags
  }

  /**
   * Calculate estimated read time
   */
  private calculateReadTime(content: string): string {
    const wordsPerMinute = 200;
    const words = content.split(' ').length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} min read`;
  }

  /**
   * Calculate engagement score for ranking
   */
  private calculateEngagementScore(article: any): number {
    let score = 0;
    
    // Title length (optimal length gets higher score)
    if (article.title) {
      const titleLength = article.title.length;
      if (titleLength >= 30 && titleLength <= 80) score += 10;
      else if (titleLength > 80) score += 5;
    }

    // Content length
    if (article.content) {
      const contentLength = article.content.length;
      if (contentLength >= 200) score += 15;
      else if (contentLength >= 100) score += 10;
    }

    // Has image
    if (article.urlToImage) score += 10;

    // Source credibility
    const credibleSources = ['BBC', 'ESPN', 'Goal.com', 'Sky Sports', 'The Guardian'];
    if (article.source?.name && credibleSources.some(s => article.source.name.includes(s))) {
      score += 20;
    }

    return score;
  }

  /**
   * Remove duplicate articles
   */
  private removeDuplicates(articles: NewsArticle[]): NewsArticle[] {
    const seen = new Set();
    return articles.filter(article => {
      const key = `${article.title.toLowerCase()}_${article.source}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  /**
   * Save news to database
   */
  async saveNewsToDatabase(articles: NewsArticle[]): Promise<void> {
    try {
      const { error } = await supabase
        .from('news_articles')
        .upsert(
          articles.map(article => ({
            title: article.title,
            content: article.content,
            excerpt: article.excerpt,
            image_url: article.image_url,
            category: article.category,
            tags: article.tags,
            source: article.source,
            source_url: article.source_url,
            published_at: article.published_at,
            author: article.author || 'News Service',
            is_published: true,
            author_id: '00000000-0000-0000-0000-000000000000' // System user ID
          })),
          { onConflict: 'title' }
        );

      if (error) throw error;
      console.log(`Saved ${articles.length} articles to database`);
    } catch (error) {
      console.error('Error saving news to database:', error);
    }
  }

  /**
   * Get news by category
   */
  async getNewsByCategory(category: string): Promise<NewsArticle[]> {
    try {
      const { data, error } = await supabase
        .from('news_articles')
        .select('*')
        .eq('category', category)
        .eq('is_published', true)
        .order('published_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error(`Error fetching ${category} news:`, error);
      return [];
    }
  }

  /**
   * Search news by keyword
   */
  async searchNews(query: string): Promise<NewsArticle[]> {
    try {
      const { data, error } = await supabase
        .from('news_articles')
        .select('*')
        .or(`title.ilike.%${query}%,content.ilike.%${query}%,tags.cs.{${query}}`)
        .eq('is_published', true)
        .order('published_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching news:', error);
      return [];
    }
  }
}

// Helper function for string hashing
declare global {
  interface String {
    hashCode(): number;
  }
}

String.prototype.hashCode = function() {
  let hash = 0;
  if (this.length === 0) return hash;
  for (let i = 0; i < this.length; i++) {
    const char = this.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
};

export const newsService = new NewsService();
