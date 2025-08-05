import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Newspaper, Plus, TrendingUp, Users, Calendar } from "lucide-react"
import { NewsArticleCard } from "@/components/NewsArticleCard"
import { BannerAd } from "@/components/AdSense"

// Sample news articles with newsletter-style layout
const sampleArticles = [
  {
    id: "1",
    title: "CAF CHAN 2024: Algeria Dominates Group Stage with Perfect Record",
    content: "Algeria's national team has showcased exceptional form in the ongoing CAF African Nations Championship, winning all three group stage matches with a combined score of 7-1. The Desert Foxes' tactical prowess under coach Djamel Belmadi has been evident throughout their campaign, with standout performances from midfielder Riyad Mahrez and striker Islam Slimani. Their latest 3-0 victory against Ghana demonstrated their championship credentials, featuring quick passing combinations and solid defensive organization. The team's depth has been particularly impressive, with substitutes making immediate impacts in each match. As they advance to the knockout stage, Algeria is being touted as one of the tournament favorites, with betting odds reflecting their strong position. Their next challenge comes against Nigeria in what promises to be a thrilling quarter-final encounter.",
    excerpt: "Algeria's perfect group stage record in CAF CHAN 2024 puts them among tournament favorites as they prepare for knockout rounds.",
    image_url: "/placeholder.svg",
    category: "CAF CHAN",
    created_at: "2024-01-15T10:30:00Z",
    like_count: 245,
    comment_count: 18,
    user_has_liked: false
  },
  {
    id: "2", 
    title: "Transfer Window Roundup: African Stars Making European Moves",
    content: "The January transfer window has seen significant movement of African talent across European leagues. Victor Osimhen's potential move to Paris Saint-Germain continues to dominate headlines, with negotiations reportedly at an advanced stage. The Nigerian striker's performances for Napoli have attracted attention from multiple top-tier clubs, making him one of the most sought-after players this window. Meanwhile, Senegalese midfielder Cheikhou Kouyaté has completed his move to Nottingham Forest, bringing experience and leadership to their Premier League campaign. Morocco's Achraf Hakimi remains a key target for several clubs despite PSG's reluctance to sell. The window has also seen promising young talents like Ghana's Mohammed Kudus establishing himself at West Ham United, showcasing the continued exodus and success of African players in Europe's top divisions.",
    excerpt: "January transfer window sees major moves for African stars, with Victor Osimhen leading the headlines in potential PSG switch.",
    image_url: null,
    category: "Transfers",
    created_at: "2024-01-14T15:45:00Z", 
    like_count: 189,
    comment_count: 32,
    user_has_liked: true
  },
  {
    id: "3",
    title: "South Africa's Bafana Bafana Prepares for AFCON Qualifiers",
    content: "The South African national team is intensifying preparations for the upcoming AFCON qualifiers, with head coach Hugo Broos implementing tactical changes aimed at improving their attacking output. Recent training sessions have focused on set-piece execution and counter-attacking strategies, areas identified as crucial for success against stronger opponents. Key players Percy Tau and Themba Zwane have been working on their partnership in the final third, while the defensive line led by Siyanda Xulu has shown improved organization. The team faces a challenging group that includes Morocco and Zimbabwe, making every point crucial for qualification hopes. Broos has expressed confidence in his squad's ability to compete at the highest level, citing improved fitness levels and tactical understanding among the players.",
    excerpt: "Hugo Broos leads Bafana Bafana's tactical preparations for crucial AFCON qualifiers against tough group opponents.",
    image_url: "/placeholder.svg",
    category: "National Teams",
    created_at: "2024-01-13T09:20:00Z",
    like_count: 156,
    comment_count: 25,
    user_has_liked: false
  }
]

const News = () => {
  const [selectedArticle, setSelectedArticle] = useState<string | null>(null)
  const [articles] = useState(sampleArticles)

  const stats = [
    { icon: TrendingUp, label: "Total Articles", value: "1,247", color: "text-blue-600" },
    { icon: Users, label: "Active Readers", value: "45.2K", color: "text-green-600" },
    { icon: Calendar, label: "This Week", value: "23", color: "text-orange-600" }
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Newsletter Header */}
      <div className="bg-gradient-to-r from-primary via-primary-glow to-primary-variant text-primary-foreground py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <Newspaper className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">African Football Chronicle</h1>
              <p className="text-xl opacity-90 mt-2">Your premier source for CAF CHAN and African football news</p>
            </div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <stat.icon className="w-8 h-8" />
                  <div>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="text-sm opacity-80">{stat.label}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Featured Categories */}
        <div className="flex flex-wrap gap-3">
          {["All", "CAF CHAN", "Transfers", "National Teams", "Match Reports", "Player Interviews"].map((category) => (
            <Badge key={category} variant={category === "All" ? "default" : "secondary"} className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">
              {category}
            </Badge>
          ))}
        </div>

        {/* Newsletter-style Article Grid */}
        <div className="grid gap-8">
          {articles.map((article) => (
            <NewsArticleCard
              key={article.id}
              article={article}
              showFullContent={selectedArticle === article.id}
              onToggleContent={() => setSelectedArticle(
                selectedArticle === article.id ? null : article.id
              )}
            />
          ))}
        </div>

        {/* Banner Ad */}
        <div className="flex justify-center py-8">
          <BannerAd className="w-full max-w-4xl" />
        </div>

        {/* Load More */}
        <div className="flex justify-center">
          <Button variant="outline" size="lg" className="gap-2">
            <Plus className="w-4 h-4" />
            Load More Articles
          </Button>
        </div>
      </div>
    </div>
  )
}

export default News