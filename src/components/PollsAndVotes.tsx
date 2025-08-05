import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  BarChart3, 
  Plus, 
  Vote, 
  Clock,
  Users,
  X
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Poll {
  id: string;
  title: string;
  description: string;
  user_id: string;
  created_at: string;
  expires_at: string | null;
  is_active: boolean;
  total_votes: number;
  profiles?: {
    full_name: string;
  };
  poll_options: PollOption[];
  user_vote?: PollVote[];
}

interface PollOption {
  id: string;
  option_text: string;
  vote_count: number;
}

interface PollVote {
  poll_option_id: string;
}

export const PollsAndVotes = () => {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [newPoll, setNewPoll] = useState({
    title: "",
    description: "",
    options: ["", ""],
    expiresIn: ""
  });
  const [loading, setLoading] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchPolls();
  }, []);

  const fetchPolls = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('polls')
        .select(`
          *,
          profiles!polls_user_id_fkey (full_name),
          poll_options (
            id,
            option_text,
            vote_count
          ),
          user_vote:poll_votes!poll_votes_poll_id_fkey (
            poll_option_id
          )
        `)
        .eq('user_vote.user_id', user?.id || '')
        .order('created_at', { ascending: false });

      if (error && error.code !== 'PGRST116') throw error;

      // Also get polls without user votes
      const { data: allPolls, error: allPollsError } = await supabase
        .from('polls')
        .select(`
          *,
          profiles!polls_user_id_fkey (full_name),
          poll_options (
            id,
            option_text,
            vote_count
          )
        `)
        .order('created_at', { ascending: false });

      if (allPollsError) throw allPollsError;

      // Merge the data to include user votes where they exist
      const pollsWithVotes = allPolls?.map(poll => {
        const pollWithVote = data?.find(p => p.id === poll.id);
        return {
          ...poll,
          user_vote: pollWithVote?.user_vote || []
        };
      }) || [];

      setPolls(pollsWithVotes as Poll[]);
    } catch (error) {
      console.error('Error fetching polls:', error);
      toast({
        title: "Error",
        description: "Failed to load polls",
        variant: "destructive",
      });
    }
  };

  const createPoll = async () => {
    if (!newPoll.title.trim() || newPoll.options.some(opt => !opt.trim())) {
      toast({
        title: "Error",
        description: "Please fill in the title and all options",
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
          description: "You must be logged in to create polls",
          variant: "destructive",
        });
        return;
      }

      let expiresAt = null;
      if (newPoll.expiresIn) {
        const days = parseInt(newPoll.expiresIn);
        if (!isNaN(days) && days > 0) {
          expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
        }
      }

      // Create poll
      const { data: pollData, error: pollError } = await supabase
        .from('polls')
        .insert([{
          title: newPoll.title,
          description: newPoll.description,
          user_id: user.id,
          expires_at: expiresAt
        }])
        .select()
        .single();

      if (pollError) throw pollError;

      // Create poll options
      const optionsData = newPoll.options
        .filter(opt => opt.trim())
        .map(option => ({
          poll_id: pollData.id,
          option_text: option.trim()
        }));

      const { error: optionsError } = await supabase
        .from('poll_options')
        .insert(optionsData);

      if (optionsError) throw optionsError;

      toast({
        title: "Success",
        description: "Poll created successfully",
      });

      setNewPoll({ title: "", description: "", options: ["", ""], expiresIn: "" });
      setIsCreateDialogOpen(false);
      fetchPolls();
    } catch (error) {
      console.error('Error creating poll:', error);
      toast({
        title: "Error",
        description: "Failed to create poll",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const vote = async (pollId: string, optionId: string) => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        toast({
          title: "Error",
          description: "You must be logged in to vote",
          variant: "destructive",
        });
        return;
      }

      // Check if user already voted
      const poll = polls.find(p => p.id === pollId);
      if (poll?.user_vote && poll.user_vote.length > 0) {
        toast({
          title: "Error",
          description: "You have already voted on this poll",
          variant: "destructive",
        });
        return;
      }

      // Cast vote
      const { error } = await supabase
        .from('poll_votes')
        .insert([{
          poll_id: pollId,
          poll_option_id: optionId,
          user_id: user.id
        }]);

      if (error) throw error;

      // Update vote counts
      const { data: optionData } = await supabase
        .from('poll_options')
        .select('vote_count')
        .eq('id', optionId)
        .single();

      if (optionData) {
        await supabase
          .from('poll_options')
          .update({ vote_count: optionData.vote_count + 1 })
          .eq('id', optionId);
      }

      // Update total votes for poll
      const { data: pollData } = await supabase
        .from('polls')
        .select('total_votes')
        .eq('id', pollId)
        .single();

      if (pollData) {
        await supabase
          .from('polls')
          .update({ total_votes: pollData.total_votes + 1 })
          .eq('id', pollId);
      }

      toast({
        title: "Success",
        description: "Vote recorded successfully",
      });

      fetchPolls();
    } catch (error) {
      console.error('Error voting:', error);
      toast({
        title: "Error",
        description: "Failed to record vote",
        variant: "destructive",
      });
    }
  };

  const addOption = () => {
    setNewPoll({ ...newPoll, options: [...newPoll.options, ""] });
  };

  const removeOption = (index: number) => {
    if (newPoll.options.length > 2) {
      const newOptions = newPoll.options.filter((_, i) => i !== index);
      setNewPoll({ ...newPoll, options: newOptions });
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...newPoll.options];
    newOptions[index] = value;
    setNewPoll({ ...newPoll, options: newOptions });
  };

  const isExpired = (expiresAt: string | null) => {
    return expiresAt && new Date(expiresAt) < new Date();
  };

  const hasUserVoted = (poll: Poll) => {
    return poll.user_vote && poll.user_vote.length > 0;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Community Polls</h2>
          <p className="text-muted-foreground">Vote on match predictions, player rankings, and more</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Poll
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Poll</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Poll question"
                value={newPoll.title}
                onChange={(e) => setNewPoll({ ...newPoll, title: e.target.value })}
              />
              <Textarea
                placeholder="Description (optional)"
                value={newPoll.description}
                onChange={(e) => setNewPoll({ ...newPoll, description: e.target.value })}
              />
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Options</label>
                {newPoll.options.map((option, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder={`Option ${index + 1}`}
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                    />
                    {newPoll.options.length > 2 && (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => removeOption(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button variant="outline" onClick={addOption} className="w-full">
                  Add Option
                </Button>
              </div>

              <Input
                placeholder="Expires in (days, leave empty for no expiration)"
                type="number"
                value={newPoll.expiresIn}
                onChange={(e) => setNewPoll({ ...newPoll, expiresIn: e.target.value })}
              />

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={createPoll} disabled={loading}>
                  Create Poll
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Polls List */}
      <div className="space-y-6">
        {polls.map((poll) => {
          const expired = isExpired(poll.expires_at);
          const userVoted = hasUserVoted(poll);
          
          return (
            <Card key={poll.id} className="bg-gradient-card border-border">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-xl">{poll.title}</CardTitle>
                    {poll.description && (
                      <p className="text-muted-foreground">{poll.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Avatar className="w-5 h-5">
                          <AvatarFallback className="text-xs">
                            {poll.profiles?.full_name?.[0] || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <span>{poll.profiles?.full_name || 'Anonymous'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{formatDistanceToNow(new Date(poll.created_at), { addSuffix: true })}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{poll.total_votes} votes</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {expired && <Badge variant="destructive">Expired</Badge>}
                    {userVoted && <Badge variant="secondary">Voted</Badge>}
                    {poll.is_active && !expired && (
                      <Badge variant="default">Active</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {poll.poll_options.map((option) => {
                  const percentage = poll.total_votes > 0 
                    ? (option.vote_count / poll.total_votes) * 100 
                    : 0;
                  
                  return (
                    <div key={option.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{option.option_text}</span>
                        <span className="text-sm text-muted-foreground">
                          {option.vote_count} votes ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                      
                      {userVoted || expired || !poll.is_active ? (
                        <Progress value={percentage} className="h-2" />
                      ) : (
                        <Button
                          variant="outline"
                          className="w-full justify-start h-8"
                          onClick={() => vote(poll.id, option.id)}
                        >
                          <Vote className="w-4 h-4 mr-2" />
                          Vote for this option
                        </Button>
                      )}
                    </div>
                  );
                })}
                
                {poll.expires_at && !expired && (
                  <div className="text-sm text-muted-foreground mt-4">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Expires {formatDistanceToNow(new Date(poll.expires_at), { addSuffix: true })}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};