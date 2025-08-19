import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Zap, Trophy } from 'lucide-react';

interface AnimatedScoreProps {
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  previousHomeScore?: number;
  previousAwayScore?: number;
  status: string;
  minute?: string;
  isLive?: boolean;
}

export const AnimatedScore = ({
  homeTeam,
  awayTeam,
  homeScore,
  awayScore,
  previousHomeScore = homeScore,
  previousAwayScore = awayScore,
  status,
  minute,
  isLive = false
}: AnimatedScoreProps) => {
  const [showGoalAnimation, setShowGoalAnimation] = useState(false);
  const [goalTeam, setGoalTeam] = useState<'home' | 'away' | null>(null);

  // Detect score changes and trigger animations
  useEffect(() => {
    const homeScoreChanged = homeScore > previousHomeScore;
    const awayScoreChanged = awayScore > previousAwayScore;

    if (homeScoreChanged || awayScoreChanged) {
      setGoalTeam(homeScoreChanged ? 'home' : 'away');
      setShowGoalAnimation(true);

      // Add haptic feedback for goal
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100, 50, 200]); // Goal celebration pattern
      }

      // Hide animation after 3 seconds
      setTimeout(() => {
        setShowGoalAnimation(false);
        setGoalTeam(null);
      }, 3000);
    }
  }, [homeScore, awayScore, previousHomeScore, previousAwayScore]);

  return (
    <div className="relative">
      {/* Goal Animation Overlay */}
      <AnimatePresence>
        {showGoalAnimation && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 rounded-lg"
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              className="text-center"
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 0.6,
                  repeat: 2,
                  repeatType: "reverse"
                }}
                className="text-6xl mb-2"
              >
                ⚽
              </motion.div>
              <div className="text-white text-2xl font-bold mb-2">GOAL!</div>
              <div className="text-white text-lg">
                {goalTeam === 'home' ? homeTeam : awayTeam}
              </div>
              <motion.div
                animate={{ scale: [0, 1] }}
                transition={{ delay: 0.5, duration: 0.3 }}
                className="mt-2"
              >
                <Badge variant="secondary" className="text-lg px-3 py-1">
                  {homeScore} - {awayScore}
                </Badge>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Score Display */}
      <div className="flex items-center justify-between p-4">
        {/* Home Team */}
        <div className="flex-1 text-center">
          <h3 className={`font-semibold text-lg ${goalTeam === 'home' ? 'text-green-600' : 'text-foreground'}`}>
            {homeTeam}
          </h3>
          <motion.div
            key={`home-${homeScore}`}
            initial={{ scale: 1 }}
            animate={{ 
              scale: goalTeam === 'home' ? [1, 1.5, 1] : 1,
              color: goalTeam === 'home' ? ['currentColor', '#22c55e', 'currentColor'] : 'currentColor'
            }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-bold"
          >
            {homeScore}
          </motion.div>
        </div>

        {/* VS and Status */}
        <div className="px-6 text-center">
          <div className="flex flex-col items-center gap-2">
            <div className="text-2xl font-bold text-muted-foreground">VS</div>
            
            {/* Live indicator with pulse */}
            {isLive && (
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="flex items-center gap-1"
              >
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <Badge variant="destructive" className="text-xs">
                  {status} {minute && `${minute}'`}
                </Badge>
              </motion.div>
            )}

            {!isLive && (
              <Badge variant="secondary" className="text-xs">
                {status}
              </Badge>
            )}
          </div>
        </div>

        {/* Away Team */}
        <div className="flex-1 text-center">
          <h3 className={`font-semibold text-lg ${goalTeam === 'away' ? 'text-green-600' : 'text-foreground'}`}>
            {awayTeam}
          </h3>
          <motion.div
            key={`away-${awayScore}`}
            initial={{ scale: 1 }}
            animate={{ 
              scale: goalTeam === 'away' ? [1, 1.5, 1] : 1,
              color: goalTeam === 'away' ? ['currentColor', '#22c55e', 'currentColor'] : 'currentColor'
            }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-bold"
          >
            {awayScore}
          </motion.div>
        </div>
      </div>

      {/* Live Match Pulse Effect */}
      {isLive && (
        <motion.div
          className="absolute inset-0 border-2 border-red-500 rounded-lg pointer-events-none"
          animate={{ 
            opacity: [0.3, 0.8, 0.3],
            scale: [1, 1.02, 1]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}
    </div>
  );
};

export default AnimatedScore;
