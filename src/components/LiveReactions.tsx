import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';

interface Reaction {
  id: string;
  emoji: string;
  label: string;
  count: number;
  userReacted: boolean;
}

interface LiveComment {
  id: string;
  user: {
    name: string;
    avatar?: string;
  };
  message: string;
  timestamp: Date;
  reactions: number;
}

interface LiveReactionsProps {
  matchId: string;
  className?: string;
}

export const LiveReactions = ({ matchId, className = "" }: LiveReactionsProps) => {
  const [reactions, setReactions] = useState<Reaction[]>([
    { id: '1', emoji: '⚽', label: 'Goal!', count: 24, userReacted: false },
    { id: '2', emoji: '🔥', label: 'Fire', count: 18, userReacted: false },
    { id: '3', emoji: '💪', label: 'Strong', count: 12, userReacted: false },
    { id: '4', emoji: '😱', label: 'Shocked', count: 8, userReacted: false },
    { id: '5', emoji: '👏', label: 'Clap', count: 15, userReacted: false },
    { id: '6', emoji: '❤️', label: 'Love', count: 32, userReacted: false }
  ]);

  const [liveComments, setLiveComments] = useState<LiveComment[]>([
    {
      id: '1',
      user: { name: 'John K.', avatar: undefined },
      message: 'What a save by the keeper! 🧤',
      timestamp: new Date(Date.now() - 30000),
      reactions: 5
    },
    {
      id: '2',
      user: { name: 'Sarah M.', avatar: undefined },
      message: 'Arsenal looking strong this half 💪',
      timestamp: new Date(Date.now() - 60000),
      reactions: 12
    },
    {
      id: '3',
      user: { name: 'Mike R.', avatar: undefined },
      message: 'Penalty! That was a clear foul 🟨',
      timestamp: new Date(Date.now() - 120000),
      reactions: 8
    }
  ]);

  const [showFloatingReactions, setShowFloatingReactions] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly update reaction counts
      setReactions(prev => 
        prev.map(reaction => ({
          ...reaction,
          count: reaction.count + Math.floor(Math.random() * 3)
        }))
      );

      // Occasionally add new comments
      if (Math.random() > 0.8) {
        const newComment: LiveComment = {
          id: Date.now().toString(),
          user: { name: 'Fan ' + Math.floor(Math.random() * 100) },
          message: [
            'Great play! ⚽',
            'What a match! 🔥',
            'Come on! 💪',
            'Unbelievable! 😱',
            'Amazing goal! 🎯',
            'Defense looking solid 🛡️'
          ][Math.floor(Math.random() * 6)],
          timestamp: new Date(),
          reactions: Math.floor(Math.random() * 10)
        };

        setLiveComments(prev => [newComment, ...prev.slice(0, 9)]);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleReactionClick = useCallback((reactionId: string) => {
    setReactions(prev => 
      prev.map(reaction => {
        if (reaction.id === reactionId) {
          const newUserReacted = !reaction.userReacted;
          const newCount = newUserReacted ? reaction.count + 1 : reaction.count - 1;
          
          // Add floating reaction animation
          if (newUserReacted) {
            setShowFloatingReactions(prev => [...prev, reaction.emoji]);
            setTimeout(() => {
              setShowFloatingReactions(prev => prev.slice(1));
            }, 2000);

            // Haptic feedback
            if (navigator.vibrate) {
              navigator.vibrate(30);
            }
          }

          return {
            ...reaction,
            userReacted: newUserReacted,
            count: Math.max(0, newCount)
          };
        }
        return reaction;
      })
    );

    toast.success('Reaction sent!');
  }, []);

  const formatTimeAgo = (timestamp: Date) => {
    const seconds = Math.floor((Date.now() - timestamp.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return (
    <div className={`relative ${className}`}>
      {/* Floating Reactions */}
      <AnimatePresence>
        {showFloatingReactions.map((emoji, index) => (
          <motion.div
            key={`${emoji}-${index}`}
            initial={{ 
              opacity: 1, 
              scale: 1, 
              y: 0,
              x: Math.random() * 100 - 50
            }}
            animate={{ 
              opacity: 0, 
              scale: 1.5, 
              y: -100,
              rotate: Math.random() * 360
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2, ease: "easeOut" }}
            className="absolute top-0 left-1/2 text-4xl pointer-events-none z-50"
            style={{ 
              left: `${50 + (Math.random() * 40 - 20)}%`,
            }}
          >
            {emoji}
          </motion.div>
        ))}
      </AnimatePresence>

      <Card className="bg-gradient-card border-border/20 shadow-card">
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="font-semibold text-sm">Live Reactions</span>
              <Badge variant="secondary" className="text-xs">
                {reactions.reduce((sum, r) => sum + r.count, 0)} total
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs"
            >
              {isExpanded ? 'Collapse' : 'Expand'}
            </Button>
          </div>

          {/* Quick Reactions */}
          <div className="flex flex-wrap gap-2 mb-4">
            {reactions.map((reaction) => (
              <motion.button
                key={reaction.id}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleReactionClick(reaction.id)}
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-all duration-200 ${
                  reaction.userReacted
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'bg-secondary hover:bg-secondary/80'
                }`}
              >
                <span className="text-lg">{reaction.emoji}</span>
                <span className="font-medium">{reaction.count}</span>
              </motion.button>
            ))}
          </div>

          {/* Live Comments */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3"
              >
                <div className="border-t pt-3">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm font-medium">Live Comments</span>
                    <Badge variant="outline" className="text-xs">
                      {liveComments.length}
                    </Badge>
                  </div>

                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {liveComments.map((comment, index) => (
                      <motion.div
                        key={comment.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start gap-2 p-2 bg-background/50 rounded-lg"
                      >
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={comment.user.avatar} />
                          <AvatarFallback className="text-xs bg-primary/10">
                            {comment.user.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-primary">
                              {comment.user.name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatTimeAgo(comment.timestamp)}
                            </span>
                          </div>
                          <p className="text-sm text-foreground">{comment.message}</p>
                          {comment.reactions > 0 && (
                            <div className="flex items-center gap-1 mt-1">
                              <span className="text-xs">❤️</span>
                              <span className="text-xs text-muted-foreground">
                                {comment.reactions}
                              </span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pulse indicator for new activity */}
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default LiveReactions;
