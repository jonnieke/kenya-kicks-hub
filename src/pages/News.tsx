import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Newspaper, Clock, Eye } from "lucide-react"
import { NewsScraper } from "@/components/NewsScraper"
import { BannerAd, InArticleAd } from "@/components/AdSense"

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
            <p className="text-muted-foreground">Latest CAF CHAN and African football updates</p>
          </div>
        </div>

        <NewsScraper />

        {/* Banner Ad */}
        <div className="flex justify-center">
          <BannerAd className="w-full max-w-4xl" />
        </div>
      </div>
    </div>
  )
}

export default News