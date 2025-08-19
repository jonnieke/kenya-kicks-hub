import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import AnimatedScore from "./AnimatedScore";
import LongPressActions, { matchCardActions } from "./LongPressActions";
import LiveReactions from "./LiveReactions";
import { Progress } from '@/components/ui/progress';
import { 
  Heart, 
  Share2, 
  Bookmark, 
  Target, 
  TrendingUp, 
  Clock, 
  Trophy, 
  Users,
  ArrowRight,
  Star,
  Zap,
  Eye,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { cn } from "@/lib/utils";

interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore?: number;
  awayScore?: number;
  minute?: string;
  league: string;
  status: 'live' | 'upcoming' | 'finished' | 'postponed';
  startTime: string;
  odds?: {
    home: number;
    draw: number;
    away: number;
  };
  predictions?: {
    homeWin: number;
    draw: number;
    awayWin: number;
  };
  stats?: {
    possession: { home: number; away: number };
    shots: { home: number; away: number };
    corners: { home: number; away: number };
  };
}

interface MatchCardProps {
  match: Match;
  showOdds?: boolean;
  showPredictions?: boolean;
  isFavorite?: boolean;
  onLike?: (matchId: string) => void;
  onShare?: (matchId: string) => void;
  onPredict?: (matchId: string) => void;
  className?: string;
  variant?: "default" | "live" | "upcoming" | "finished";
}

export const EnhancedMatchCard = ({ 
  match, 
  showOdds = false, 
  showPredictions = false,
  isFavorite = false,
  onLike,
  onShare,
  onPredict,
  className = "",
  variant = "default"
}: MatchCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLiked, setIsLiked] = useState(isFavorite);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Mobile touch gesture handling
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      // Swipe left to expand
      setIsExpanded(true);
    } else if (isRightSwipe) {
      // Swipe right to collapse
      setIsExpanded(false);
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  // Helper functions
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'live':
        return 'destructive';
      case 'upcoming':
        return 'secondary';
      case 'finished':
        return 'default';
      default:
        return 'secondary';
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    onLike?.(match.id);
  };

  const handleShare = () => {
    onShare?.(match.id);
    // Copy match URL to clipboard
    const matchUrl = `${window.location.origin}/live-scores?match=${match.id}`;
    navigator.clipboard.writeText(matchUrl);
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'live': return <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />;
      case 'upcoming': return <Clock className="w-4 h-4" />;
      case 'finished': return <Trophy className="w-4 h-4" />;
      case 'postponed': return <Clock className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const formatTime = (time: string) => {
    const date = new Date(time);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <LongPressActions
      actions={matchCardActions(match.id)}
      className={className}
    >
      <motion.div
        ref={cardRef}
        className={cn(
          "relative overflow-hidden",
          "touch-manipulation", // Optimize for touch
        )}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
      <Card className={cn(
        "group cursor-pointer transition-all duration-300",
        "border-0 shadow-lg hover:shadow-xl",
        "bg-gradient-to-r from-background via-background/95 to-background/90",
        "backdrop-blur-sm",
        variant === "live" && "ring-2 ring-red-500/20 bg-red-500/5",
        variant === "upcoming" && "ring-2 ring-blue-500/20 bg-blue-500/5",
        variant === "finished" && "ring-2 ring-green-500/20 bg-green-500/5",
        "md:hover:scale-[1.02]",
        "active:scale-[0.98]", // Mobile touch feedback
        className
      )}>
        {/* Mobile swipe indicator */}
        <div className="absolute top-2 right-2 md:hidden" aria-hidden="true">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span>←</span>
            <span className="text-xs">Swipe</span>
            <span>→</span>
          </div>
        </div>

        <CardContent className="p-0">
          {/* Header */}
          <div className="p-4 border-b border-border/20">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-muted-foreground">{match.league}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge 
                  variant={getStatusVariant(match.status)} 
                  className={cn(
                    "text-xs font-medium",
                    match.status === 'live' && "animate-pulse"
                  )}
                >
                  {match.status.toUpperCase()}
                  {match.status === 'live' && match.minute && ` ${match.minute}'`}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => setIsExpanded(!isExpanded)}
                  aria-label={isExpanded ? "Collapse match details" : "Expand match details"}
                  aria-expanded={isExpanded}
                >
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
            
            {/* Animated Score Display */}
            <AnimatedScore
              homeTeam={match.homeTeam}
              awayTeam={match.awayTeam}
              homeScore={match.homeScore || 0}
              awayScore={match.awayScore || 0}
              status={match.status}
              minute={match.minute}
              isLive={match.status === 'live'}
            />
          </div>

          {/* Action Buttons */}
          <div className="p-4 border-b border-border/20">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLike}
                  aria-label={isLiked ? "Unlike match" : "Like match"}
                  aria-pressed={isLiked}
                  className={cn(
                    "h-8 px-3",
                    isLiked && "text-red-500 hover:text-red-600"
                  )}
                >
                  <Heart className={cn("w-4 h-4", isLiked && "fill-current")} />
                  <span className="sr-only">{isLiked ? "Unlike" : "Like"}</span>
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleShare}
                  aria-label="Share match"
                  className="h-8 px-3"
                >
                  <Share2 className="w-4 h-4" />
                  <span className="sr-only">Share</span>
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBookmark}
                  aria-label={isBookmarked ? "Remove bookmark" : "Bookmark match"}
                  aria-pressed={isBookmarked}
                  className={cn(
                    "h-8 px-3",
                    isBookmarked && "text-yellow-500 hover:text-yellow-600"
                  )}
                >
                  <Bookmark className={cn("w-4 h-4", isBookmarked && "fill-current")} />
                  <span className="sr-only">{isBookmarked ? "Remove bookmark" : "Bookmark"}</span>
                </Button>
              </div>
              
              {onPredict && (
                <Button
                  size="sm"
                  onClick={() => onPredict(match.id)}
                  aria-label="Make prediction for this match"
                  className="bg-gradient-primary hover:bg-gradient-accent text-white"
                >
                  <Target className="w-4 h-4 mr-2" />
                  Predict
                </Button>
              )}
            </div>
          </div>

          {/* Main Match Content */}
          <div className="p-4">
            {/* Teams and Score */}
            <div className="grid grid-cols-3 gap-4 items-center mb-6">
              {/* Home Team */}
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-lg font-bold text-primary">
                    {match.homeTeam.charAt(0)}
                  </span>
                </div>
                <div className="font-semibold text-sm leading-tight">
                  {match.homeTeam}
                </div>
                {match.homeScore !== undefined && (
                  <div className="text-2xl font-bold text-primary">
                    {match.homeScore}
                  </div>
                )}
              </div>

              {/* VS */}
              <div className="text-center">
                <div className="text-2xl font-bold text-muted-foreground mb-2">VS</div>
                {match.status === 'live' && match.minute && (
                  <div className="text-sm text-red-500 font-semibold animate-pulse">
                    {match.minute}
                  </div>
                )}
              </div>

              {/* Away Team */}
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-accent/20 to-accent/10 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-lg font-bold text-accent">
                    {match.awayTeam.charAt(0)}
                  </span>
                </div>
                <div className="font-semibold text-sm leading-tight">
                  {match.awayTeam}
                </div>
                {match.awayScore !== undefined && (
                  <div className="text-2xl font-bold text-accent">
                    {match.awayScore}
                  </div>
                )}
              </div>
            </div>

            {/* Odds Section */}
            {showOdds && match.odds && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold">Betting Odds</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center p-3 bg-primary/5 rounded-lg border border-primary/20">
                    <div className="text-xs text-muted-foreground mb-1">Home</div>
                    <div className="font-bold text-primary">{match.odds.home}</div>
                  </div>
                  <div className="text-center p-3 bg-accent/5 rounded-lg border border-accent/20">
                    <div className="text-xs text-muted-foreground mb-1">Draw</div>
                    <div className="font-bold text-accent">{match.odds.draw}</div>
                  </div>
                  <div className="text-center p-3 bg-primary/5 rounded-lg border border-primary/20">
                    <div className="text-xs text-muted-foreground mb-1">Away</div>
                    <div className="font-bold text-primary">{match.odds.away}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Predictions Section */}
            {showPredictions && match.predictions && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-semibold">Community Predictions</span>
                </div>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Home Win</span>
                      <span>{match.predictions.homeWin}%</span>
                    </div>
                    <Progress value={match.predictions.homeWin} className="h-2" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Draw</span>
                      <span>{match.predictions.draw}%</span>
                    </div>
                    <Progress value={match.predictions.draw} className="h-2" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Away Win</span>
                      <span>{match.predictions.awayWin}%</span>
                    </div>
                    <Progress value={match.predictions.awayWin} className="h-2" />
                  </div>
                </div>
              </div>
            )}

            {/* Stats Section (Expandable) */}
            {match.stats && (
              <div className="mb-6">
                <Button
                  variant="ghost"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="w-full justify-between p-0 h-auto font-normal"
                >
                  <span className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Match Statistics
                  </span>
                  <ArrowRight className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                </Button>
                
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-4 space-y-4">
                        {/* Possession */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span>Possession</span>
                            <span>{match.stats.possession.home}% - {match.stats.possession.away}%</span>
                          </div>
                          <div className="flex h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="bg-primary h-full transition-all duration-500"
                              style={{ width: `${match.stats.possession.home}%` }}
                            />
                            <div 
                              className="bg-accent h-full transition-all duration-500"
                              style={{ width: `${match.stats.possession.away}%` }}
                            />
                          </div>
                        </div>

                        {/* Shots */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-3 bg-primary/5 rounded-lg">
                            <div className="text-xs text-muted-foreground mb-1">Home Shots</div>
                            <div className="font-bold text-primary">{match.stats.shots.home}</div>
                          </div>
                          <div className="text-center p-3 bg-accent/5 rounded-lg">
                            <div className="text-xs text-muted-foreground mb-1">Away Shots</div>
                            <div className="font-bold text-accent">{match.stats.shots.away}</div>
                          </div>
                        </div>

                        {/* Corners */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-3 bg-primary/5 rounded-lg">
                            <div className="text-xs text-muted-foreground mb-1">Home Corners</div>
                            <div className="font-bold text-primary">{match.stats.corners.home}</div>
                          </div>
                          <div className="text-center p-3 bg-accent/5 rounded-lg">
                            <div className="text-xs text-muted-foreground mb-1">Away Corners</div>
                            <div className="font-bold text-accent">{match.stats.corners.away}</div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button 
                className="flex-1 bg-gradient-primary hover:bg-gradient-accent"
                onClick={() => onPredict?.(match.id)}
              >
                <Target className="w-4 h-4 mr-2" />
                Make Prediction
              </Button>
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4 mr-2" />
                Details
              </Button>
            </div>
          </div>

          {/* Premium Badge */}
          {match.status === 'upcoming' && (
            <div className="bg-gradient-to-r from-yellow-400/20 to-orange-400/20 p-3 border-t border-yellow-200/50">
              <div className="flex items-center justify-center gap-2 text-yellow-700">
                <Star className="w-4 h-4 fill-current" />
                <span className="text-sm font-medium">Premium predictions available</span>
                <Zap className="w-4 h-4" />
              </div>
            </div>
          )}
          {/* Live Reactions for Live Matches */}
          {match.status === 'live' && isExpanded && (
            <div className="border-t border-border/20">
              <LiveReactions matchId={match.id} />
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
    </LongPressActions>
  );
}
