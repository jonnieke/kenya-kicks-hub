import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, Calendar, User, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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

interface NewsArticleCardProps {
  article: NewsArticle;
  onLike: (articleId: string) => void;
  onComment: (articleId: string) => void;
  userLiked: boolean;
}

const NewsArticleCard = ({ article, onLike, onComment, userLiked }: NewsArticleCardProps) => {
  const { toast } = useToast();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleViewIncrement = async () => {
    try {
      await supabase
        .from('news_articles')
        .update({ view_count: article.view_count + 1 })
        .eq('id', article.id);
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
  };

  const toggleExpanded = () => {
    if (!isExpanded) {
      handleViewIncrement();
    }
    setIsExpanded(!isExpanded);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'CAF CHAN': 'bg-blue-500/20 text-blue-600 border-blue-500/30',
      'African Cup': 'bg-green-500/20 text-green-600 border-green-500/30',
      'Transfer News': 'bg-purple-500/20 text-purple-600 border-purple-500/30',
      'Match Analysis': 'bg-orange-500/20 text-orange-600 border-orange-500/30',
      'Player Spotlight': 'bg-red-500/20 text-red-600 border-red-500/30',
      'General': 'bg-gray-500/20 text-gray-600 border-gray-500/30'
    };
    return colors[category as keyof typeof colors] || colors.General;
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-primary">
      {article.image_url && (
        <div className="aspect-video overflow-hidden">
          <img
            src={article.image_url}
            alt={article.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <Badge className={getCategoryColor(article.category)}>
            {article.category}
          </Badge>
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="w-4 h-4 mr-1" />
            {formatDate(article.published_at || article.created_at)}
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold mb-3 line-clamp-2 hover:text-primary cursor-pointer transition-colors">
          {article.title}
        </h2>

        {/* Excerpt/Content */}
        <div className="text-muted-foreground mb-4 leading-relaxed">
          {isExpanded ? (
            <div className="whitespace-pre-wrap">{article.content}</div>
          ) : (
            <p className="line-clamp-3">
              {article.excerpt || article.content.substring(0, 200) + '...'}
            </p>
          )}
        </div>

        {/* Read More Button */}
        <Button
          variant="ghost"
          onClick={toggleExpanded}
          className="mb-4 p-0 h-auto text-primary hover:text-primary/80"
        >
          {isExpanded ? 'Read Less' : 'Read More'}
        </Button>

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {article.tags.map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                #{tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Author */}
        {article.profiles?.full_name && (
          <div className="flex items-center text-sm text-muted-foreground mb-4">
            <User className="w-4 h-4 mr-1" />
            By {article.profiles.full_name}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onLike(article.id)}
              className={`flex items-center gap-1 ${userLiked ? 'text-red-500' : 'text-muted-foreground'}`}
            >
              <Heart className={`w-4 h-4 ${userLiked ? 'fill-current' : ''}`} />
              {article.like_count}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onComment(article.id)}
              className="flex items-center gap-1 text-muted-foreground"
            >
              <MessageCircle className="w-4 h-4" />
              {article.comment_count}
            </Button>

            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Eye className="w-4 h-4" />
              {article.view_count}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NewsArticleCard;