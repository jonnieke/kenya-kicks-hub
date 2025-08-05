import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Heart, MessageCircle, Clock, User, Send } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface NewsArticle {
  id: string
  title: string
  content: string
  excerpt: string
  image_url: string | null
  category: string
  created_at: string
  like_count: number
  comment_count: number
  user_has_liked?: boolean
}

interface Comment {
  id: string
  content: string
  created_at: string
  user_id: string
  profiles?: {
    full_name: string | null
  }
}

interface NewsArticleCardProps {
  article: NewsArticle
  showFullContent?: boolean
  onToggleContent?: () => void
}

export const NewsArticleCard = ({ article, showFullContent = false, onToggleContent }: NewsArticleCardProps) => {
  const [isLiked, setIsLiked] = useState(article.user_has_liked || false)
  const [likeCount, setLikeCount] = useState(article.like_count)
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [loadingComments, setLoadingComments] = useState(false)
  const { toast } = useToast()

  const handleLike = async () => {
    // Placeholder for like functionality
    setIsLiked(!isLiked)
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1)
    toast({
      title: isLiked ? "Removed like" : "Liked!",
      description: isLiked ? "You unliked this article" : "You liked this article"
    })
  }

  const loadComments = async () => {
    if (showComments) {
      setShowComments(false)
      return
    }
    
    setLoadingComments(true)
    // Placeholder for comment loading
    setTimeout(() => {
      setComments([
        {
          id: "1",
          content: "Great article! Very informative.",
          created_at: new Date().toISOString(),
          user_id: "user1",
          profiles: { full_name: "John Doe" }
        },
        {
          id: "2", 
          content: "Thanks for sharing this news.",
          created_at: new Date().toISOString(),
          user_id: "user2",
          profiles: { full_name: "Jane Smith" }
        }
      ])
      setLoadingComments(false)
      setShowComments(true)
    }, 500)
  }

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return
    
    // Placeholder for comment submission
    const comment: Comment = {
      id: Date.now().toString(),
      content: newComment,
      created_at: new Date().toISOString(),
      user_id: "current_user",
      profiles: { full_name: "Current User" }
    }
    
    setComments(prev => [comment, ...prev])
    setNewComment("")
    toast({
      title: "Comment posted",
      description: "Your comment has been added"
    })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 48) return "Yesterday"
    return date.toLocaleDateString()
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="text-xs">
            {article.category}
          </Badge>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            {formatDate(article.created_at)}
          </div>
        </div>
        <h2 className="text-xl font-bold leading-tight hover:text-primary cursor-pointer">
          {article.title}
        </h2>
      </CardHeader>

      <CardContent className="space-y-4">
        {article.image_url && (
          <div className="w-full h-48 rounded-lg overflow-hidden">
            <img 
              src={article.image_url} 
              alt={article.title}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}

        <div className="space-y-3">
          <p className="text-muted-foreground leading-relaxed">
            {showFullContent ? article.content : article.excerpt}
          </p>
          
          {!showFullContent && article.content.length > article.excerpt.length && (
            <Button 
              variant="link" 
              className="p-0 h-auto text-primary"
              onClick={onToggleContent}
            >
              Read more →
            </Button>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`gap-2 ${isLiked ? 'text-red-500' : ''}`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              {likeCount}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={loadComments}
              className="gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              {article.comment_count}
            </Button>
          </div>
        </div>

        {showComments && (
          <div className="space-y-4 pt-4 border-t">
            <div className="flex gap-3">
              <Avatar className="w-8 h-8">
                <AvatarFallback>
                  <User className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <Textarea
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-20"
                />
                <Button size="sm" onClick={handleSubmitComment} disabled={!newComment.trim()}>
                  <Send className="w-4 h-4 mr-2" />
                  Post Comment
                </Button>
              </div>
            </div>

            {loadingComments ? (
              <div className="text-center py-4 text-muted-foreground">Loading comments...</div>
            ) : (
              <div className="space-y-3">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback>
                        {comment.profiles?.full_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="bg-muted rounded-lg p-3">
                        <div className="font-medium text-sm">
                          {comment.profiles?.full_name || 'Anonymous'}
                        </div>
                        <p className="text-sm mt-1">{comment.content}</p>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {formatDate(comment.created_at)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}