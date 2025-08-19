import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  RefreshCw, 
  Search, 
  Globe, 
  TrendingUp, 
  Clock, 
  ExternalLink,
  Zap,
  Star,
  Newspaper,
  Trophy,
  Users,
  Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { newsService, NewsArticle } from '@/services/newsService';
import { useToast } from '@/hooks/use-toast';

interface EnhancedNewsAggregatorProps {
  className?: string;
  showRefreshButton?: boolean;
  maxArticles?: number;
}

const categories = [
  'All', 'Premier League', 'La Liga', 'Serie A', 'Bundesliga', 'UEFA',
  'African', 'Kenyan', 'Transfer News', 'Player News', 'Match Report', 'General'
];

const sources = [
  'All', 'NewsAPI', 'BBC Sport Football', 'ESPN Football', 'Goal.com', 'CAF Media', 'Scraped'
];

export const EnhancedNewsAggregator = ({ 
  className = "",
  showRefreshButton = true,
  maxArticles = 20
}: EnhancedNewsAggregatorProps) => {
  const { toast } = useToast();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSource, setSelectedSource] = useState('All');
  const [activeTab, setActiveTab] = useState('latest');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    fetchNews();
  }, []);

  useEffect(() => {
    filterArticles();
  }, [articles, searchQuery, selectedCategory, selectedSource]);

  const fetchNews = useCallback(async () => {
    try {
      setLoading(true);
      const news = await newsService.fetchAllNews();
      setArticles(news);
      setLastUpdated(new Date());
      await newsService.saveNewsToDatabase(news);
      
      toast({
        title: "News Updated",
        description: `Fetched ${news.length} articles from multiple sources`,
      });
    } catch (error) {
      console.error('Error fetching news:', error);
      toast({
        title: "Error",
        description: "Failed to fetch latest news",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const refreshNews = useCallback(async () => {
    try {
      setRefreshing(true);
      await fetchNews();
      toast({
        title: "Success",
        description: "News refreshed successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh news",
        variant: "destructive"
      });
    } finally {
      setRefreshing(false);
    }
  }, [fetchNews, toast]);

  const filterArticles = useCallback(() => {
    let filtered = [...articles];

    if (searchQuery) {
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(article => article.category === selectedCategory);
    }

    if (selectedSource !== 'All') {
      filtered = filtered.filter(article => article.source === selectedSource);
    }

    switch (activeTab) {
      case 'trending':
        filtered.sort((a, b) => (b.engagement_score || 0) - (a.engagement_score || 0));
        break;
      case 'latest':
        filtered.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
        break;
      case 'popular':
        filtered.sort((a, b) => (b.engagement_score || 0) - (a.engagement_score || 0));
        break;
    }

    setFilteredArticles(filtered.slice(0, maxArticles));
  }, [articles, searchQuery, selectedCategory, selectedSource, activeTab, maxArticles]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Premier League':
      case 'La Liga':
      case 'Serie A':
      case 'Bundesliga':
        return <Trophy className="w-4 h-4" />;
      case 'UEFA':
        return <Star className="w-4 h-4" />;
      case 'African':
      case 'Kenyan':
        return <Globe className="w-4 h-4" />;
      case 'Transfer News':
        return <Users className="w-4 h-4" />;
      case 'Player News':
        return <Eye className="w-4 h-4" />;
      case 'Match Report':
        return <Newspaper className="w-4 h-4" />;
      default:
        return <Newspaper className="w-4 h-4" />;
    }
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'BBC Sport Football':
        return 'bg-red-500/10 text-red-600 border-red-200';
      case 'ESPN Football':
        return 'bg-blue-500/10 text-blue-600 border-blue-200';
      case 'Goal.com':
        return 'bg-green-500/10 text-green-600 border-green-200';
      case 'CAF Media':
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-200';
      case 'NewsAPI':
        return 'bg-purple-500/10 text-purple-600 border-purple-200';
      default:
        return 'bg-gray-500/10 text-gray-600 border-gray-200';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (loading && articles.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Newspaper className="w-5 h-5" />
            Latest Football News
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Newspaper className="w-5 h-5" />
            Latest Football News
            {lastUpdated && (
              <span className="text-sm text-muted-foreground font-normal">
                • Updated {formatTimeAgo(lastUpdated.toISOString())}
              </span>
            )}
          </CardTitle>
          {showRefreshButton && (
            <Button
              onClick={refreshNews}
              disabled={refreshing}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search football news..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedSource} onValueChange={setSelectedSource}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                {sources.map(source => (
                  <SelectItem key={source} value={source}>
                    {source}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="latest" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Latest
            </TabsTrigger>
            <TabsTrigger value="trending" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Trending
            </TabsTrigger>
            <TabsTrigger value="popular" className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              Popular
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${activeTab}-${filteredArticles.length}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                {filteredArticles.length === 0 ? (
                  <div className="text-center py-8">
                    <Newspaper className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No articles found</h3>
                    <p className="text-muted-foreground">
                      Try adjusting your search or filters
                    </p>
                  </div>
                ) : (
                  filteredArticles.map((article, index) => (
                    <motion.div
                      key={article.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start gap-4">
                        {article.image_url && (
                          <div className="flex-shrink-0">
                            <img
                              src={article.image_url}
                              alt={article.title}
                              className="w-20 h-20 object-cover rounded-lg"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="flex items-center gap-1">
                              {getCategoryIcon(article.category)}
                              {article.category}
                            </Badge>
                            <Badge variant="outline" className={`text-xs ${getSourceColor(article.source)}`}>
                              {article.source}
                            </Badge>
                            {article.read_time && (
                              <Badge variant="secondary" className="text-xs">
                                <Clock className="w-3 h-3 mr-1" />
                                {article.read_time}
                              </Badge>
                            )}
                          </div>

                          <h3 className="font-semibold text-lg mb-2 line-clamp-2 hover:text-primary cursor-pointer">
                            {article.title}
                          </h3>

                          <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                            {article.excerpt}
                          </p>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>{formatTimeAgo(article.published_at)}</span>
                              {article.author && <span>by {article.author}</span>}
                              {article.engagement_score && (
                                <span className="flex items-center gap-1">
                                  <Zap className="w-3 h-3" />
                                  {article.engagement_score}
                                </span>
                              )}
                            </div>

                            {article.tags.length > 0 && (
                              <div className="flex gap-1">
                                {article.tags.slice(0, 3).map((tag, tagIndex) => (
                                  <Badge key={tagIndex} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>

                          {article.source_url && (
                            <div className="flex items-center gap-2 mt-3">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(article.source_url, '_blank')}
                                className="gap-2"
                              >
                                <ExternalLink className="w-4 h-4" />
                                Read Full Article
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </motion.div>
            </AnimatePresence>

            {filteredArticles.length >= maxArticles && (
              <div className="text-center pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    toast({
                      title: "Coming Soon",
                      description: "Load more functionality will be implemented soon",
                    });
                  }}
                >
                  Load More Articles
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="border-t pt-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Showing {filteredArticles.length} of {articles.length} articles</span>
            <span>Last updated: {lastUpdated ? formatTimeAgo(lastUpdated.toISOString()) : 'Never'}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedNewsAggregator;
