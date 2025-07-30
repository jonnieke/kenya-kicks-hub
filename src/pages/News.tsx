import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Newspaper, Clock, Eye } from "lucide-react"

const newsArticles = [
  {
    id: 1,
    title: "Harambee Stars Qualify for AFCON 2025",
    excerpt: "Kenya national team secures their spot in the Africa Cup of Nations after a thrilling 2-1 victory over rivals.",
    category: "National Team",
    readTime: "3 min read",
    views: "2.4k",
    timeAgo: "2 hours ago",
    image: "/api/placeholder/400/200"
  },
  {
    id: 2,
    title: "Gor Mahia Signs New Striker from Europe",
    excerpt: "The Kenyan champions have announced the signing of a promising striker to bolster their squad for the new season.",
    category: "Transfers",
    readTime: "2 min read",
    views: "1.8k",
    timeAgo: "5 hours ago",
    image: "/api/placeholder/400/200"
  },
  {
    id: 3,
    title: "FKF Premier League Fixtures Released",
    excerpt: "The Football Kenya Federation has released the complete fixture list for the upcoming season starting next month.",
    category: "Local League",
    readTime: "4 min read",
    views: "3.1k",
    timeAgo: "1 day ago",
    image: "/api/placeholder/400/200"
  }
]

const News = () => {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
            <Newspaper className="w-6 h-6 text-background" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Football News</h1>
            <p className="text-muted-foreground">Latest updates from Kenyan and international football</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {newsArticles.map((article) => (
            <Card key={article.id} className="bg-gradient-card border-border hover:border-primary/50 transition-all duration-300 hover:scale-105 cursor-pointer">
              <div className="aspect-video bg-muted rounded-t-lg flex items-center justify-center">
                <Newspaper className="w-12 h-12 text-muted-foreground" />
              </div>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    {article.category}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {article.timeAgo}
                  </div>
                </div>
                <CardTitle className="text-lg leading-tight">{article.title}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-muted-foreground text-sm mb-4 line-clamp-3">{article.excerpt}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{article.readTime}</span>
                  <div className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {article.views}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

export default News