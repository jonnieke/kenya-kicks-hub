import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  MessageCircle, 
  Plus, 
  Pin, 
  Eye, 
  Clock,
  Send
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Discussion {
  id: string;
  title: string;
  content: string;
  category: string;
  user_id: string;
  created_at: string;
  is_pinned: boolean;
  reply_count: number;
  view_count: number;
  profiles?: {
    full_name: string;
  };
}

interface DiscussionReply {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles?: {
    full_name: string;
  };
}

const categories = [
  { value: "general", label: "General Discussion" },
  { value: "matches", label: "Match Analysis" },
  { value: "teams", label: "Team Discussion" },
  { value: "players", label: "Player Talk" },
  { value: "predictions", label: "Predictions" },
  { value: "news", label: "News & Updates" }
];

export const DiscussionForum = () => {
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [selectedDiscussion, setSelectedDiscussion] = useState<Discussion | null>(null);
  const [replies, setReplies] = useState<DiscussionReply[]>([]);
  const [newDiscussion, setNewDiscussion] = useState({
    title: "",
    content: "",
    category: "general"
  });
  const [newReply, setNewReply] = useState("");
  const [loading, setLoading] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchDiscussions();
  }, []);

  const fetchDiscussions = async () => {
    try {
      const { data, error } = await supabase
        .from('discussions')
        .select(`
          *,
          profiles!discussions_user_id_fkey (full_name)
        `)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDiscussions(data as Discussion[] || []);
    } catch (error) {
      console.error('Error fetching discussions:', error);
      toast({
        title: "Error",
        description: "Failed to load discussions",
        variant: "destructive",
      });
    }
  };

  const fetchReplies = async (discussionId: string) => {
    try {
      const { data, error } = await supabase
        .from('discussion_replies')
        .select(`
          *,
          profiles!discussion_replies_user_id_fkey (full_name)
        `)
        .eq('discussion_id', discussionId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setReplies(data as DiscussionReply[] || []);
    } catch (error) {
      console.error('Error fetching replies:', error);
      toast({
        title: "Error",
        description: "Failed to load replies",
        variant: "destructive",
      });
    }
  };

  const createDiscussion = async () => {
    if (!newDiscussion.title.trim() || !newDiscussion.content.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        toast({
          title: "Error",
          description: "You must be logged in to create discussions",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('discussions')
        .insert([{
          ...newDiscussion,
          user_id: user.id
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Discussion created successfully",
      });

      setNewDiscussion({ title: "", content: "", category: "general" });
      setIsCreateDialogOpen(false);
      fetchDiscussions();
    } catch (error) {
      console.error('Error creating discussion:', error);
      toast({
        title: "Error",
        description: "Failed to create discussion",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createReply = async () => {
    if (!newReply.trim() || !selectedDiscussion) return;

    setLoading(true);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        toast({
          title: "Error",
          description: "You must be logged in to reply",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('discussion_replies')
        .insert([{
          discussion_id: selectedDiscussion.id,
          content: newReply,
          user_id: user.id
        }]);

      if (error) throw error;

      // Update reply count
      const { error: updateError } = await supabase
        .from('discussions')
        .update({ reply_count: selectedDiscussion.reply_count + 1 })
        .eq('id', selectedDiscussion.id);

      if (updateError) console.error('Error updating reply count:', updateError);

      setNewReply("");
      fetchReplies(selectedDiscussion.id);
      fetchDiscussions();

      toast({
        title: "Success",
        description: "Reply posted successfully",
      });
    } catch (error) {
      console.error('Error creating reply:', error);
      toast({
        title: "Error",
        description: "Failed to post reply",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const openDiscussion = async (discussion: Discussion) => {
    setSelectedDiscussion(discussion);
    fetchReplies(discussion.id);

    // Increment view count
    const { error } = await supabase
      .from('discussions')
      .update({ view_count: discussion.view_count + 1 })
      .eq('id', discussion.id);

    if (error) console.error('Error updating view count:', error);
  };

  const getCategoryBadgeColor = (category: string) => {
    const colors: Record<string, string> = {
      general: "bg-blue-500/10 text-blue-500",
      matches: "bg-green-500/10 text-green-500",
      teams: "bg-purple-500/10 text-purple-500",
      players: "bg-orange-500/10 text-orange-500",
      predictions: "bg-red-500/10 text-red-500",
      news: "bg-yellow-500/10 text-yellow-500"
    };
    return colors[category] || "bg-gray-500/10 text-gray-500";
  };

  return (
    <div className="space-y-6">
      {!selectedDiscussion ? (
        <>
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Discussion Forum</h2>
              <p className="text-muted-foreground">Join the conversation about African football</p>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  New Discussion
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Discussion</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Discussion title"
                    value={newDiscussion.title}
                    onChange={(e) => setNewDiscussion({ ...newDiscussion, title: e.target.value })}
                  />
                  <Select
                    value={newDiscussion.category}
                    onValueChange={(value) => setNewDiscussion({ ...newDiscussion, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Textarea
                    placeholder="Start the discussion..."
                    value={newDiscussion.content}
                    onChange={(e) => setNewDiscussion({ ...newDiscussion, content: e.target.value })}
                    className="min-h-[120px]"
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={createDiscussion} disabled={loading}>
                      Create Discussion
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Discussions List */}
          <div className="space-y-4">
            {discussions.map((discussion) => (
              <Card 
                key={discussion.id} 
                className="bg-gradient-card border-border hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => openDiscussion(discussion)}
              >
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {discussion.is_pinned && (
                            <Pin className="w-4 h-4 text-primary" />
                          )}
                          <Badge className={getCategoryBadgeColor(discussion.category)}>
                            {categories.find(c => c.value === discussion.category)?.label}
                          </Badge>
                        </div>
                        <h3 className="font-semibold text-lg mb-2">{discussion.title}</h3>
                        <p className="text-muted-foreground line-clamp-2 mb-3">
                          {discussion.content}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Avatar className="w-5 h-5">
                              <AvatarFallback className="text-xs">
                                {discussion.profiles?.full_name?.[0] || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <span>{discussion.profiles?.full_name || 'Anonymous'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{formatDistanceToNow(new Date(discussion.created_at), { addSuffix: true })}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageCircle className="w-4 h-4" />
                            <span>{discussion.reply_count} replies</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            <span>{discussion.view_count} views</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      ) : (
        /* Discussion Detail View */
        <div className="space-y-6">
          {/* Back Button */}
          <Button variant="outline" onClick={() => setSelectedDiscussion(null)}>
            ← Back to Discussions
          </Button>

          {/* Discussion */}
          <Card className="bg-gradient-card border-border">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                {selectedDiscussion.is_pinned && (
                  <Pin className="w-4 h-4 text-primary" />
                )}
                <Badge className={getCategoryBadgeColor(selectedDiscussion.category)}>
                  {categories.find(c => c.value === selectedDiscussion.category)?.label}
                </Badge>
              </div>
              <CardTitle className="text-2xl">{selectedDiscussion.title}</CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Avatar className="w-6 h-6">
                  <AvatarFallback className="text-xs">
                    {selectedDiscussion.profiles?.full_name?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span>{selectedDiscussion.profiles?.full_name || 'Anonymous'}</span>
                <span>•</span>
                <span>{formatDistanceToNow(new Date(selectedDiscussion.created_at), { addSuffix: true })}</span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{selectedDiscussion.content}</p>
            </CardContent>
          </Card>

          {/* Replies */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              Replies ({replies.length})
            </h3>
            
            {replies.map((reply) => (
              <Card key={reply.id} className="bg-gradient-card border-border ml-6">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
                    <Avatar className="w-6 h-6">
                      <AvatarFallback className="text-xs">
                        {reply.profiles?.full_name?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span>{reply.profiles?.full_name || 'Anonymous'}</span>
                    <span>•</span>
                    <span>{formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}</span>
                  </div>
                  <p className="whitespace-pre-wrap">{reply.content}</p>
                </CardContent>
              </Card>
            ))}

            {/* Reply Form */}
            <Card className="bg-gradient-card border-border ml-6">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <Textarea
                    placeholder="Write your reply..."
                    value={newReply}
                    onChange={(e) => setNewReply(e.target.value)}
                    className="min-h-[100px]"
                  />
                  <div className="flex justify-end">
                    <Button onClick={createReply} disabled={loading || !newReply.trim()}>
                      <Send className="w-4 h-4 mr-2" />
                      Post Reply
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};