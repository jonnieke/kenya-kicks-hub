import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { RefreshCw, Globe, ExternalLink } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface NewsArticle {
  title: string
  excerpt: string
  category: string
  source: string
  url?: string
  timeAgo?: string
  readTime?: string
}

export const NewsScraper = () => {
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const scrapeNews = async () => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase.functions.invoke('scrape-caf-news')
      
      if (error) {
        toast({
          title: "Error",
          description: "Failed to scrape news. Please check your API key.",
          variant: "destructive"
        })
        return
      }

      if (data?.articles) {
        setArticles(data.articles)
        toast({
          title: "Success",
          description: `Scraped ${data.articles.length} articles from CAF and African football sources`,
        })
      }
    } catch (error) {
      console.error('Error scraping news:', error)
      toast({
        title: "Error",
        description: "Failed to scrape news",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">CAF & CHAN News</h2>
          <p className="text-muted-foreground">Latest African football updates from multiple sources</p>
        </div>
        <Button 
          onClick={scrapeNews} 
          disabled={loading}
          className="bg-gradient-primary gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Scraping...' : 'Scrape News'}
        </Button>
      </div>

      {loading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="bg-gradient-card border-border">
              <CardHeader>
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-6 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-16 w-full mb-4" />
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-12" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {articles.length === 0 && !loading && (
        <Card className="bg-gradient-card border-border text-center p-8">
          <CardContent className="space-y-4">
            <Globe className="w-16 h-16 text-muted-foreground mx-auto" />
            <div>
              <h3 className="text-lg font-semibold mb-2">No news articles yet</h3>
              <p className="text-muted-foreground mb-4">
                Click "Scrape News" to fetch the latest CAF and CHAN updates
              </p>
              <Button onClick={scrapeNews} className="bg-gradient-primary">
                Start Scraping
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {articles.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article, index) => (
            <Card key={index} className="bg-gradient-card border-border hover:border-primary/50 transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    {article.category}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Globe className="w-3 h-3" />
                    {article.source}
                  </div>
                </div>
                <CardTitle className="text-lg leading-tight line-clamp-2">
                  {article.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
                <p className="text-muted-foreground text-sm line-clamp-3">
                  {article.excerpt}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {article.readTime || '2 min read'}
                  </span>
                  {article.url && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="gap-1 text-xs h-7"
                      onClick={() => window.open(article.url, '_blank')}
                    >
                      <ExternalLink className="w-3 h-3" />
                      Read More
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}