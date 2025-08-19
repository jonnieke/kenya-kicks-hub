import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Trophy, 
  Target, 
  Zap,
  Star,
  Timer,
  TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface GameScore {
  player: number;
  computer: number;
  highScore: number;
}

interface GameState {
  isPlaying: boolean;
  isPaused: boolean;
  gameOver: boolean;
  level: number;
  score: number;
  lives: number;
}

export const FootballGames = () => {
  const [selectedGame, setSelectedGame] = useState<'penalty' | 'dribble' | 'keeper'>('penalty');
  const [gameState, setGameState] = useState<GameState>({
    isPlaying: false,
    isPaused: false,
    gameOver: false,
    level: 1,
    score: 0,
    lives: 3
  });
  const [scores, setScores] = useState<GameScore>({
    player: 0,
    computer: 0,
    highScore: 0
  });
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<number>();

  const games = [
    {
      id: 'penalty',
      name: 'Penalty Shootout',
      description: 'Score penalties against top African goalkeepers',
      difficulty: 'Easy',
      icon: Target,
      color: 'bg-green-500',
      highScore: 15
    },
    {
      id: 'dribble',
      name: 'Dribble Challenge',
      description: 'Navigate through defenders to score goals',
      difficulty: 'Medium',
      icon: Zap,
      color: 'bg-blue-500',
      highScore: 8
    },
    {
      id: 'keeper',
      name: 'Goalkeeper Hero',
      description: 'Save shots and become a legendary keeper',
      difficulty: 'Hard',
      icon: Star,
      color: 'bg-purple-500',
      highScore: 12
    }
  ];

  const leaderboardData = [
    { name: 'Ahmed Hassan', score: 15, country: '🇪🇬', rank: 1 },
    { name: 'Sarah Mohammed', score: 14, country: '🇰🇪', rank: 2 },
    { name: 'David Okafor', score: 13, country: '🇳🇬', rank: 3 },
    { name: 'Fatima Al-Zahra', score: 12, country: '🇲🇦', rank: 4 },
    { name: 'Kwame Asante', score: 11, country: '🇬🇭', rank: 5 }
  ];

  const startGame = () => {
    setGameState(prev => ({
      ...prev,
      isPlaying: true,
      isPaused: false,
      gameOver: false,
      score: 0,
      lives: 3
    }));
    startGameLoop();
  };

  const pauseGame = () => {
    setGameState(prev => ({ ...prev, isPaused: !prev.isPaused }));
    if (gameState.isPaused) {
      startGameLoop();
    } else {
      stopGameLoop();
    }
  };

  const resetGame = () => {
    setGameState(prev => ({
      ...prev,
      isPlaying: false,
      isPaused: false,
      gameOver: false,
      score: 0,
      lives: 3
    }));
    stopGameLoop();
  };

  const startGameLoop = () => {
    if (gameLoopRef.current) return;
    
    gameLoopRef.current = window.setInterval(() => {
      if (!gameState.isPaused && gameState.isPlaying) {
        updateGame();
      }
    }, 1000 / 60); // 60 FPS
  };

  const stopGameLoop = () => {
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
      gameLoopRef.current = undefined;
    }
  };

  const updateGame = () => {
    setGameState(prev => {
      // Simulate game logic
      const newScore = prev.score + Math.floor(Math.random() * 3);
      const newLives = Math.random() > 0.95 ? prev.lives - 1 : prev.lives;
      
      if (newLives <= 0) {
        // Game over
        const finalScore = newScore;
        if (finalScore > scores.highScore) {
          setScores(prev => ({ ...prev, highScore: finalScore }));
        }
        return { ...prev, gameOver: true, isPlaying: false, score: finalScore };
      }
      
      return { ...prev, score: newScore, lives: newLives };
    });
  };

  useEffect(() => {
    return () => stopGameLoop();
  }, []);

  const renderGameCanvas = () => (
    <div className="relative bg-gradient-to-b from-green-400 to-green-600 rounded-lg overflow-hidden">
      <canvas
        ref={canvasRef}
        width={400}
        height={300}
        className="w-full h-[300px] bg-gradient-to-b from-green-400 to-green-600"
      />
      
      {/* Game Overlay */}
      {gameState.isPlaying && (
        <div className="absolute top-4 left-4 space-y-2">
          <div className="flex items-center gap-2 bg-black/50 text-white px-3 py-1 rounded-full">
            <Timer className="w-4 h-4" />
            <span className="text-sm font-bold">Level {gameState.level}</span>
          </div>
          <div className="flex items-center gap-2 bg-black/50 text-white px-3 py-1 rounded-full">
            <Target className="w-4 h-4" />
            <span className="text-sm font-bold">Score: {gameState.score}</span>
          </div>
          <div className="flex items-center gap-2 bg-black/50 text-white px-3 py-1 rounded-full">
            <Star className="w-4 h-4" />
            <span className="flex gap-1">
              {Array.from({ length: gameState.lives }).map((_, i) => (
                <span key={i} className="text-yellow-400">★</span>
              ))}
            </span>
          </div>
        </div>
      )}

      {/* Game Controls */}
      {gameState.isPlaying && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
          <Button
            onClick={pauseGame}
            size="sm"
            variant="secondary"
            className="bg-black/50 text-white hover:bg-black/70"
          >
            {gameState.isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </Button>
          <Button
            onClick={resetGame}
            size="sm"
            variant="secondary"
            className="bg-black/50 text-white hover:bg-black/70"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Game Over Screen */}
      {gameState.gameOver && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center text-white"
          >
            <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
            <h3 className="text-2xl font-bold mb-2">Game Over!</h3>
            <p className="text-lg mb-4">Final Score: {gameState.score}</p>
            {gameState.score > scores.highScore && (
              <p className="text-yellow-400 font-bold mb-4">🎉 New High Score! 🎉</p>
            )}
            <Button onClick={resetGame} className="mr-2">
              Play Again
            </Button>
            <Button variant="outline" onClick={() => setShowLeaderboard(true)}>
              View Leaderboard
            </Button>
          </motion.div>
        </div>
      )}
    </div>
  );

  return (
    <Card className="bg-gradient-card border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-6 h-6 text-primary" />
          Football Games
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Game Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {games.map((game) => {
            const Icon = game.icon;
            return (
              <motion.div
                key={game.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card 
                  className={`cursor-pointer transition-all ${
                    selectedGame === game.id 
                      ? 'ring-2 ring-primary shadow-lg' 
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => setSelectedGame(game.id as any)}
                >
                  <CardContent className="p-4 text-center">
                    <div className={`w-12 h-12 ${game.color} rounded-full flex items-center justify-center mx-auto mb-3`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-semibold mb-1">{game.name}</h4>
                    <p className="text-xs text-muted-foreground mb-2">{game.description}</p>
                    <Badge variant="outline" className="text-xs">{game.difficulty}</Badge>
                    <div className="mt-2 text-xs text-muted-foreground">
                      High Score: {game.highScore}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Game Canvas */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">
              {games.find(g => g.id === selectedGame)?.name}
            </h4>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                <TrendingUp className="w-3 h-3 mr-1" />
                High Score: {scores.highScore}
              </Badge>
            </div>
          </div>
          
          {renderGameCanvas()}
          
          {/* Game Instructions */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <h5 className="font-semibold mb-2">How to Play:</h5>
            <ul className="text-sm text-muted-foreground space-y-1">
              {selectedGame === 'penalty' && (
                <>
                  <li>• Click to aim and shoot penalties</li>
                  <li>• Avoid the goalkeeper's dive direction</li>
                  <li>• Score as many as possible before time runs out</li>
                </>
              )}
              {selectedGame === 'dribble' && (
                <>
                  <li>• Use arrow keys to move the player</li>
                  <li>• Navigate through defenders</li>
                  <li>• Reach the goal to score points</li>
                </>
              )}
              {selectedGame === 'keeper' && (
                <>
                  <li>• Click to dive in the direction of the ball</li>
                  <li>• Save shots to earn points</li>
                  <li>• Don't let the ball pass you</li>
                </>
              )}
            </ul>
          </div>
        </div>

        {/* Game Controls */}
        {!gameState.isPlaying && !gameState.gameOver && (
          <div className="text-center">
            <Button onClick={startGame} size="lg" className="gap-2">
              <Play className="w-4 h-4" />
              Start Game
            </Button>
          </div>
        )}

        {/* Leaderboard Modal */}
        <AnimatePresence>
          {showLeaderboard && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
              onClick={() => setShowLeaderboard(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-background p-6 rounded-lg max-w-md w-full mx-4"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  Leaderboard
                </h3>
                <div className="space-y-3">
                  {leaderboardData.map((player, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0 ? 'bg-yellow-500 text-white' :
                        index === 1 ? 'bg-gray-400 text-white' :
                        index === 2 ? 'bg-orange-500 text-white' :
                        'bg-muted text-foreground'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{player.name}</span>
                          <span className="text-lg">{player.country}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Score: {player.score}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Button 
                  onClick={() => setShowLeaderboard(false)} 
                  className="w-full mt-4"
                >
                  Close
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

export default FootballGames;
