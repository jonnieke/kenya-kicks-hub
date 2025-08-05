import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { MessageCircle, Send, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
}

interface NewsCommentsProps {
  articleId: string;
  onCommentAdded: () => void;
}

const NewsComments = ({ articleId, onCommentAdded }: NewsCommentsProps) => {
  const { toast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetchComments();
    getUser();
  }, [articleId]);

  const getUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('news_comments')
        .select('*')
        .eq('article_id', articleId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to post a comment",
        variant: "destructive"
      });
      return;
    }

    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('news_comments')
        .insert([{
          article_id: articleId,
          user_id: user.id,
          content: newComment.trim()
        }]);

      if (error) throw error;

      setNewComment("");
      fetchComments();
      onCommentAdded();
      
      toast({
        title: "Success",
        description: "Comment posted successfully"
      });
    } catch (error) {
      console.error('Error posting comment:', error);
      toast({
        title: "Error",
        description: "Failed to post comment",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">Loading comments...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Comments ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Comment Form */}
        {user ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts..."
              rows={3}
              className="resize-none"
            />
            <Button 
              type="submit" 
              disabled={submitting || !newComment.trim()}
              className="w-full sm:w-auto"
            >
              <Send className="w-4 h-4 mr-2" />
              {submitting ? 'Posting...' : 'Post Comment'}
            </Button>
          </form>
        ) : (
          <div className="text-center p-4 border border-dashed border-border rounded-lg">
            <p className="text-muted-foreground mb-2">Please log in to join the discussion</p>
            <Button variant="outline">Sign In</Button>
          </div>
        )}

        {/* Comments List */}
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3 p-4 border border-border rounded-lg">
              <Avatar className="w-10 h-10 flex-shrink-0">
                <AvatarFallback>
                  {getInitials(null)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">
                    Anonymous User
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(comment.created_at)}
                  </span>
                </div>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {comment.content}
                </p>
              </div>
            </div>
          ))}

          {comments.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No comments yet. Be the first to share your thoughts!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default NewsComments;