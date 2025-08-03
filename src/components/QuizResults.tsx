import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star, Clock, Target, RotateCcw } from "lucide-react";

interface QuizResultsProps {
  score: number;
  totalQuestions: number;
  quizTitle: string;
  onRetakeQuiz: () => void;
  onBackToQuizzes: () => void;
}

export const QuizResults = ({ 
  score, 
  totalQuestions, 
  quizTitle, 
  onRetakeQuiz, 
  onBackToQuizzes 
}: QuizResultsProps) => {
  const percentage = Math.round((score / totalQuestions) * 100);
  
  const getPerformanceBadge = () => {
    if (percentage >= 90) return { text: "Excellent!", color: "bg-football-green text-background" };
    if (percentage >= 70) return { text: "Good Job!", color: "bg-accent text-background" };
    if (percentage >= 50) return { text: "Not Bad", color: "bg-secondary text-secondary-foreground" };
    return { text: "Try Again", color: "bg-destructive text-destructive-foreground" };
  };

  const getRewardPoints = () => {
    if (percentage >= 90) return 1000;
    if (percentage >= 70) return 750;
    if (percentage >= 50) return 500;
    return 250;
  };

  const performance = getPerformanceBadge();
  const points = getRewardPoints();

  return (
    <div className="min-h-screen bg-background p-6 flex items-center justify-center">
      <Card className="w-full max-w-2xl bg-gradient-card border-border">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center">
              <Trophy className="w-8 h-8 text-background" />
            </div>
          </div>
          <CardTitle className="text-3xl mb-2">Quiz Complete!</CardTitle>
          <p className="text-muted-foreground">{quizTitle}</p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Score Display */}
          <div className="text-center space-y-2">
            <div className="text-6xl font-bold text-primary">
              {score}<span className="text-2xl text-muted-foreground">/{totalQuestions}</span>
            </div>
            <div className="text-2xl font-semibold">{percentage}%</div>
            <Badge className={performance.color}>
              {performance.text}
            </Badge>
          </div>

          {/* Performance Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="bg-background/50 border-primary/20">
              <CardContent className="p-4 text-center">
                <Target className="w-6 h-6 text-primary mx-auto mb-2" />
                <div className="text-lg font-bold">{score}</div>
                <div className="text-xs text-muted-foreground">Correct</div>
              </CardContent>
            </Card>
            
            <Card className="bg-background/50 border-accent/20">
              <CardContent className="p-4 text-center">
                <Star className="w-6 h-6 text-football-gold mx-auto mb-2" />
                <div className="text-lg font-bold">{points}</div>
                <div className="text-xs text-muted-foreground">Points</div>
              </CardContent>
            </Card>
            
            <Card className="bg-background/50 border-secondary/20">
              <CardContent className="p-4 text-center">
                <Clock className="w-6 h-6 text-secondary-foreground mx-auto mb-2" />
                <div className="text-lg font-bold">{percentage}%</div>
                <div className="text-xs text-muted-foreground">Accuracy</div>
              </CardContent>
            </Card>
          </div>

          {/* Achievement Message */}
          <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
            <CardContent className="p-4 text-center">
              <Star className="w-8 h-8 text-football-gold mx-auto mb-2" />
              <p className="font-medium">
                {percentage >= 90 && "Outstanding performance! You're a football expert! 🏆"}
                {percentage >= 70 && percentage < 90 && "Great job! You know your football well! ⚽"}
                {percentage >= 50 && percentage < 70 && "Good effort! Keep learning and you'll improve! 📚"}
                {percentage < 50 && "Don't give up! Every expert was once a beginner! 💪"}
              </p>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={onRetakeQuiz}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Retake Quiz
            </Button>
            <Button 
              className="flex-1 bg-gradient-primary"
              onClick={onBackToQuizzes}
            >
              <Trophy className="w-4 h-4 mr-2" />
              More Quizzes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};