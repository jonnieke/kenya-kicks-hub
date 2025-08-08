import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Newspaper, TrendingUp, Clock, Trophy, Globe, Star } from "lucide-react";
import { NewsScraper } from "@/components/NewsScraper";
import NewsArticleCard from "@/components/NewsArticleCard";
import NewsComments from "@/components/NewsComments";
import { BannerAd, InArticleAd } from "@/components/AdSense";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import heroImage from "@/assets/international-leagues-hero.jpg";

interface NewsArticle {
  id: string;
  title: string;
  content: string;
  excerpt: string | null;
  image_url: string | null;
  published_at: string | null;
  view_count: number;
  like_count: number;
  comment_count: number;
  category: string;
  tags: string[] | null;
  created_at: string;
  profiles?: {
    full_name: string | null;
  };
}

const News = () => {
  const { toast } = useToast();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [featuredArticle, setFeaturedArticle] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [userLikes, setUserLikes] = useState<Set<string>>(new Set());
  const [selectedArticleForComments, setSelectedArticleForComments] = useState<string | null>(null);

  useEffect(() => {
    fetchArticles();
    getUser();
  }, []);

  const getUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    if (user) {
      fetchUserLikes(user.id);
    }
  };

  const fetchUserLikes = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('news_likes')
        .select('article_id')
        .eq('user_id', userId);

      if (error) throw error;
      
      const likes = new Set(data?.map(like => like.article_id) || []);
      setUserLikes(likes);
    } catch (error) {
      console.error('Error fetching user likes:', error);
    }
  };

  const fetchArticles = async () => {
    try {
      const { data, error } = await supabase
        .from('news_articles')
        .select('*')
        .eq('is_published', true)
        .order('published_at', { ascending: false });

      if (error) throw error;
      
      const articlesData = data || [];
      setArticles(articlesData);
      
      // Set featured article (most recent with high engagement)
      const featured = articlesData
        .sort((a, b) => (b.like_count + b.comment_count + b.view_count) - (a.like_count + a.comment_count + a.view_count))[0];
      setFeaturedArticle(featured);
    } catch (error) {
      console.error('Error fetching articles:', error);
      toast({
        title: "Error",
        description: "Failed to fetch news articles",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (articleId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to like articles",
        variant: "destructive"
      });
      return;
    }

    try {
      const isLiked = userLikes.has(articleId);
      
      if (isLiked) {
        const { error } = await supabase
          .from('news_likes')
          .delete()
          .eq('article_id', articleId)
          .eq('user_id', user.id);

        if (error) throw error;
        
        setUserLikes(prev => {
          const newLikes = new Set(prev);
          newLikes.delete(articleId);
          return newLikes;
        });
      } else {
        const { error } = await supabase
          .from('news_likes')
          .insert([{
            article_id: articleId,
            user_id: user.id
          }]);

        if (error) throw error;
        
        setUserLikes(prev => new Set([...prev, articleId]));
      }

      // Refresh articles to get updated counts
      fetchArticles();
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: "Error",
        description: "Failed to update like",
        variant: "destructive"
      });
    }
  };

  const handleComment = (articleId: string) => {
    setSelectedArticleForComments(articleId);
  };

  const getRecentArticles = () => {
    return articles.filter(article => article.id !== featuredArticle?.id).slice(0, 6);
  };

  const getTrendingArticles = () => {
    return articles
      .filter(article => article.id !== featuredArticle?.id)
      .sort((a, b) => (b.like_count + b.comment_count + b.view_count) - (a.like_count + a.comment_count + a.view_count))
      .slice(0, 4);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-20">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p>Loading latest news...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Banner with International Leagues */}
      <div className="relative h-[60vh] min-h-[500px] overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />
        </div>
        
        {/* Content Overlay */}
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-6xl mx-auto px-6 w-full">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-primary/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <Globe className="w-6 h-6 text-primary" />
                </div>
                <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">
                  <Star className="w-3 h-3 mr-1" />
                  International Football
                </Badge>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 leading-tight">
                Global Football
                <span className="block text-primary">News Hub</span>
              </h1>
              
              <p className="text-xl text-gray-200 mb-6 leading-relaxed">
                Your premier destination for the latest news from Europe's top leagues: 
                Premier League, La Liga, Serie A, Bundesliga, and UEFA competitions.
              </p>
              
              {/* League Badges */}
              <div className="flex flex-wrap gap-3 mb-6">
                {[
                  "Premier League",
                  "La Liga", 
                  "Serie A",
                  "Bundesliga",
                  "Champions League",
                  "Europa League"
                ].map((league) => (
                  <Badge 
                    key={league}
                    variant="outline" 
                    className="bg-white/10 backdrop-blur-sm text-white border-white/30 hover:bg-white/20 transition-colors"
                  >
                    <Trophy className="w-3 h-3 mr-1" />
                    {league}
                  </Badge>
                ))}
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <Clock className="w-4 h-4" />
                Updated live with breaking news and match reports
              </div>
            </div>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-background to-transparent" />
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Featured Article */}
        {featuredArticle && (
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h2 className="text-2xl font-bold">Featured Story</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
              <NewsArticleCard
                article={featuredArticle}
                onLike={handleLike}
                onComment={handleComment}
                userLiked={userLikes.has(featuredArticle.id)}
              />
            </div>
          </section>
        )}

        <Separator className="my-12" />

        {/* Banner Ad */}
        <div className="flex justify-center mb-12">
          <BannerAd className="w-full max-w-4xl" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-6">Latest News</h2>
            <div className="space-y-8">
              {getRecentArticles().map((article) => (
                <NewsArticleCard
                  key={article.id}
                  article={article}
                  onLike={handleLike}
                  onComment={handleComment}
                  userLiked={userLikes.has(article.id)}
                />
              ))}
            </div>

            {/* In-Article Ad */}
            <div className="my-8">
              <InArticleAd />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Trending Articles */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Trending Stories
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {getTrendingArticles().map((article, index) => (
                  <div key={article.id} className="flex gap-3 pb-4 border-b border-border last:border-0">
                    <div className="w-8 h-8 bg-primary text-background rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm line-clamp-2 mb-1">{article.title}</h4>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{article.view_count} views</span>
                        <span>{article.like_count} likes</span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Scraped News */}
            <Card>
              <CardHeader>
                <CardTitle>External News Feed</CardTitle>
              </CardHeader>
              <CardContent>
                <NewsScraper />
              </CardContent>
            </Card>
          </div>
        </div>

        {articles.length === 0 && (
          <div className="text-center py-20">
            <Newspaper className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No articles yet</h3>
            <p className="text-muted-foreground">Check back soon for the latest African football news!</p>
          </div>
        )}
      </div>

      {/* Comments Dialog */}
      <Dialog open={!!selectedArticleForComments} onOpenChange={() => setSelectedArticleForComments(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Comments</DialogTitle>
          </DialogHeader>
          {selectedArticleForComments && (
            <NewsComments
              articleId={selectedArticleForComments}
              onCommentAdded={() => {
                fetchArticles();
                setSelectedArticleForComments(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default News;