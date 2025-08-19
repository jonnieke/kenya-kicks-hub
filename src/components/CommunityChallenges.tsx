import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, 
  Target, 
  Star, 
  Zap, 
  Users, 
  Calendar,
  TrendingUp,
  Gift,
  Award,
  Fire,
  Crown,
  Medal,
  CheckCircle,
  Clock,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly' | 'special';
  difficulty: 'easy' | 'medium' | 'hard' | 'legendary';
  points: number;
  progress: number;
  maxProgress: number;
  isCompleted: boolean;
  deadline: string;
  participants: number;
  rewards: Reward[];
  category: 'social' | 'knowledge' | 'engagement' | 'creative';
}

interface Reward {
  id: string;
  name: string;
  type: 'badge' | 'points' | 'title' | 'feature' | 'physical';
  value: number | string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface UserStats {
  level: number;
  experience: number;
  totalPoints: number;
  challengesCompleted: number;
  currentStreak: number;
  longestStreak: number;
  rank: string;
  badges: string[];
}

export const CommunityChallenges = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [userStats, setUserStats] = useState<UserStats>({
    level: 15,
    experience: 1250,
    totalPoints: 8750,
    challengesCompleted: 67,
    currentStreak: 12,
    longestStreak: 28,
    rank: 'Elite Fan',
    badges: ['First Post', 'Top Contributor', 'Match Predictor', 'Community Leader']
  });
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [showRewards, setShowRewards] = useState(false);

  const challengeData: Challenge[] = [
    {
      id: '1',
      title: 'Daily Discussion Master',
      description: 'Start 3 meaningful discussions and get 5+ responses on each',
      type: 'daily',
      difficulty: 'easy',
      points: 50,
      progress: 2,
      maxProgress: 3,
      isCompleted: false,
      deadline: 'Today 11:59 PM',
      participants: 234,
      category: 'social',
      rewards: [
        { id: '1', name: 'Discussion Master Badge', type: 'badge', value: 'Daily', icon: '💬', rarity: 'common' },
        { id: '2', name: 'Experience Points', type: 'points', value: 50, icon: '⭐', rarity: 'common' }
      ]
    },
    {
      id: '2',
      title: 'Kenyan Football Expert',
      description: 'Answer 10 questions correctly in the Kenyan Football Quiz',
      type: 'weekly',
      difficulty: 'medium',
      points: 200,
      progress: 7,
      maxProgress: 10,
      isCompleted: false,
      deadline: 'Sunday 11:59 PM',
      participants: 156,
      category: 'knowledge',
      rewards: [
        { id: '3', name: 'Football Expert Badge', type: 'badge', value: 'Weekly', icon: '🧠', rarity: 'rare' },
        { id: '4', name: 'Special Title', type: 'title', value: 'Kenyan Football Guru', icon: '👑', rarity: 'rare' }
      ]
    },
    {
      id: '3',
      title: 'Community Champion',
      description: 'Help 5 new members and receive 10+ thank you messages',
      type: 'monthly',
      difficulty: 'hard',
      points: 500,
      progress: 3,
      maxProgress: 5,
      isCompleted: false,
      deadline: 'End of Month',
      participants: 89,
      category: 'engagement',
      rewards: [
        { id: '5', name: 'Community Champion Badge', type: 'badge', value: 'Monthly', icon: '🏆', rarity: 'epic' },
        { id: '6', name: 'Premium Features', type: 'feature', value: '1 Month', icon: '✨', rarity: 'epic' }
      ]
    },
    {
      id: '4',
      title: 'Creative Content Creator',
      description: 'Create 3 viral posts with 100+ likes and 50+ shares',
      type: 'special',
      difficulty: 'legendary',
      points: 1000,
      progress: 1,
      maxProgress: 3,
      isCompleted: false,
      deadline: 'Special Event',
      participants: 45,
      category: 'creative',
      rewards: [
        { id: '7', name: 'Legendary Creator Badge', type: 'badge', value: 'Special', icon: '🔥', rarity: 'legendary' },
        { id: '8', name: 'Physical Prize', type: 'physical', value: 'Team Jersey', icon: '👕', rarity: 'legendary' }
      ]
    },
    {
      id: '5',
      title: 'Match Prediction King',
      description: 'Correctly predict 8 out of 10 match outcomes this week',
      type: 'weekly',
      difficulty: 'medium',
      points: 300,
      progress: 6,
      maxProgress: 8,
      isCompleted: false,
      deadline: 'Sunday 11:59 PM',
      participants: 312,
      category: 'knowledge',
      rewards: [
        { id: '9', name: 'Prediction Master Badge', type: 'badge', value: 'Weekly', icon: '🔮', rarity: 'rare' },
        { id: '10', name: 'Bonus Points', type: 'points', value: 100, icon: '💎', rarity: 'rare' }
      ]
    }
  ];

  useEffect(() => {
    setChallenges(challengeData);
  }, []);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500/10 text-green-600 border-green-200';
      case 'medium': return 'bg-yellow-500/10 text-yellow-600 border-yellow-200';
      case 'hard': return 'bg-orange-500/10 text-orange-600 border-orange-200';
      case 'legendary': return 'bg-purple-500/10 text-purple-600 border-purple-200';
      default: return 'bg-gray-500/10 text-gray-600 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'daily': return <Calendar className="w-4 h-4" />;
      case 'weekly': return <Target className="w-4 h-4" />;
      case 'monthly': return <Star className="w-4 h-4" />;
      case 'special': return <Gift className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'social': return '💬';
      case 'knowledge': return '🧠';
      case 'engagement': return '🤝';
      case 'creative': return '🎨';
      default: return '🎯';
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-500/10 text-gray-600 border-gray-200';
      case 'rare': return 'bg-blue-500/10 text-blue-600 border-blue-200';
      case 'epic': return 'bg-purple-500/10 text-purple-600 border-purple-200';
      case 'legendary': return 'bg-orange-500/10 text-orange-600 border-orange-200';
      default: return 'bg-gray-500/10 text-gray-600 border-gray-200';
    }
  };

  const calculateProgressPercentage = (progress: number, maxProgress: number) => {
    return Math.min((progress / maxProgress) * 100, 100);
  };

  const getNextLevelExp = () => {
    return userStats.level * 100;
  };

  const getLevelProgress = () => {
    return (userStats.experience / getNextLevelExp()) * 100;
  };

  return (
    <Card className="bg-gradient-card border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-6 h-6 text-primary" />
          Community Challenges
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* User Stats Overview */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <Crown className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{userStats.rank}</h3>
                  <p className="text-gray-600">Level {userStats.level}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">{userStats.totalPoints}</div>
                <div className="text-sm text-gray-600">Total Points</div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">{userStats.challengesCompleted}</div>
                <div className="text-xs text-gray-600">Challenges</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">{userStats.currentStreak}</div>
                <div className="text-xs text-gray-600">Day Streak</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-purple-600">{userStats.longestStreak}</div>
                <div className="text-xs text-gray-600">Best Streak</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-orange-600">{userStats.badges.length}</div>
                <div className="text-xs text-gray-600">Badges</div>
              </div>
            </div>
            
            {/* Level Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Experience: {userStats.experience}</span>
                <span>{getNextLevelExp()} XP to next level</span>
              </div>
              <Progress value={getLevelProgress()} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Active Challenges */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Active Challenges
          </h3>
          
          {challenges.map((challenge) => (
            <motion.div
              key={challenge.id}
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.2 }}
            >
              <Card className={`cursor-pointer transition-all ${
                challenge.isCompleted 
                  ? 'bg-green-50 border-green-200' 
                  : 'hover:border-primary/50'
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{challenge.title}</h4>
                        {challenge.isCompleted && (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{challenge.description}</p>
                      
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="outline" className={getDifficultyColor(challenge.difficulty)}>
                          {challenge.difficulty}
                        </Badge>
                        <Badge variant="outline" className="bg-blue-100 text-blue-600 border-blue-200">
                          {getTypeIcon(challenge.type)}
                          {challenge.type}
                        </Badge>
                        <Badge variant="outline" className="bg-purple-100 text-purple-600 border-purple-200">
                          {getCategoryIcon(challenge.category)}
                          {challenge.category}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">{challenge.points}</div>
                      <div className="text-xs text-gray-600">Points</div>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="space-y-2 mb-3">
                    <div className="flex justify-between text-sm">
                      <span>Progress: {challenge.progress}/{challenge.maxProgress}</span>
                      <span>{Math.round(calculateProgressPercentage(challenge.progress, challenge.maxProgress))}%</span>
                    </div>
                    <Progress 
                      value={calculateProgressPercentage(challenge.progress, challenge.maxProgress)} 
                      className="h-2"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {challenge.participants} participants
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {challenge.deadline}
                      </span>
                    </div>
                    
                    <Button
                      variant={challenge.isCompleted ? "outline" : "default"}
                      size="sm"
                      onClick={() => setSelectedChallenge(challenge)}
                      className="gap-2"
                    >
                      {challenge.isCompleted ? 'View Rewards' : 'View Details'}
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Challenge Details Modal */}
        <AnimatePresence>
          {selectedChallenge && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
              onClick={() => setSelectedChallenge(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-background p-6 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-2 mb-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    selectedChallenge.isCompleted ? 'bg-green-500' : 'bg-primary'
                  }`}>
                    {selectedChallenge.isCompleted ? (
                      <CheckCircle className="w-6 h-6 text-white" />
                    ) : (
                      <Target className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{selectedChallenge.title}</h3>
                    <p className="text-gray-600">{selectedChallenge.description}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={getDifficultyColor(selectedChallenge.difficulty)}>
                        {selectedChallenge.difficulty}
                      </Badge>
                      <Badge variant="outline">
                        {getTypeIcon(selectedChallenge.type)}
                        {selectedChallenge.type}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      <div>Points: {selectedChallenge.points}</div>
                      <div>Deadline: {selectedChallenge.deadline}</div>
                      <div>Participants: {selectedChallenge.participants}</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold">Rewards</h4>
                    <div className="space-y-2">
                      {selectedChallenge.rewards.map((reward) => (
                        <div key={reward.id} className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                          <span className="text-lg">{reward.icon}</span>
                          <div className="flex-1">
                            <div className="font-medium text-sm">{reward.name}</div>
                            <Badge variant="outline" className={`text-xs ${getRarityColor(reward.rarity)}`}>
                              {reward.rarity}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {!selectedChallenge.isCompleted && (
                  <div className="text-center">
                    <Button 
                      onClick={() => {
                        setSelectedChallenge(null);
                        setShowRewards(true);
                      }}
                      className="gap-2"
                    >
                      <Zap className="w-4 h-4" />
                      Start Challenge
                    </Button>
                  </div>
                )}
                
                <Button 
                  onClick={() => setSelectedChallenge(null)} 
                  variant="outline" 
                  className="w-full mt-4"
                >
                  Close
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Rewards Showcase */}
        <AnimatePresence>
          {showRewards && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
              onClick={() => setShowRewards(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-background p-6 rounded-lg max-w-md w-full mx-4"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Gift className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold">Challenge Started!</h3>
                  <p className="text-gray-600">Complete the challenge to earn rewards</p>
                </div>
                
                <div className="space-y-3 mb-4">
                  <div className="p-3 bg-muted/50 rounded-lg text-center">
                    <div className="text-2xl mb-2">🎯</div>
                    <div className="font-medium">Track your progress</div>
                    <div className="text-sm text-gray-600">Check back regularly to see your advancement</div>
                  </div>
                </div>
                
                <Button 
                  onClick={() => setShowRewards(false)} 
                  className="w-full"
                >
                  Got it!
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

export default CommunityChallenges;
