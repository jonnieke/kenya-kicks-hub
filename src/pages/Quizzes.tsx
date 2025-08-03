import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Brain, Trophy, Clock, Users, Star } from "lucide-react"
import { QuizTaker } from "@/components/QuizTaker"
import { QuizResults } from "@/components/QuizResults"

const quizzes = [
  {
    id: "premier-league-legends",
    title: "Premier League Legends",
    description: "Test your knowledge about Premier League history and legendary players",
    difficulty: "Medium",
    questions: 3,
    timeLimit: "15 min",
    participants: 1247,
    reward: "500 points",
    category: "History"
  },
  {
    id: "kenyan-football-heroes",
    title: "Kenyan Football Heroes",
    description: "How well do you know Harambee Stars and local football legends?",
    difficulty: "Easy",
    questions: 3,
    timeLimit: "10 min",
    participants: 892,
    reward: "300 points",
    category: "Local"
  },
  {
    id: "world-cup-trivia",
    title: "World Cup Trivia",
    description: "From 1930 to 2022 - the ultimate World Cup knowledge test",
    difficulty: "Hard",
    questions: 3,
    timeLimit: "20 min",
    participants: 2156,
    reward: "1000 points",
    category: "International"
  },
  {
    id: "transfer-market-madness",
    title: "Transfer Market Madness",
    description: "Can you guess the transfer fees and destination clubs?",
    difficulty: "Medium",
    questions: 3,
    timeLimit: "12 min",
    participants: 756,
    reward: "600 points",
    category: "Transfers"
  }
]

type ViewState = 'list' | 'taking' | 'results';

interface QuizState {
  view: ViewState;
  selectedQuiz?: typeof quizzes[0];
  score?: number;
  totalQuestions?: number;
}

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case "Easy": return "bg-football-green text-background"
    case "Medium": return "bg-accent text-background"
    case "Hard": return "bg-destructive text-destructive-foreground"
    default: return "bg-secondary text-secondary-foreground"
  }
}

const Quizzes = () => {
  const [quizState, setQuizState] = useState<QuizState>({ view: 'list' });

  const handleStartQuiz = (quiz: typeof quizzes[0]) => {
    setQuizState({
      view: 'taking',
      selectedQuiz: quiz
    });
  };

  const handleQuizComplete = (score: number, totalQuestions: number) => {
    setQuizState(prev => ({
      ...prev,
      view: 'results',
      score,
      totalQuestions
    }));
  };

  const handleRetakeQuiz = () => {
    if (quizState.selectedQuiz) {
      setQuizState({
        view: 'taking',
        selectedQuiz: quizState.selectedQuiz
      });
    }
  };

  const handleBackToQuizzes = () => {
    setQuizState({ view: 'list' });
  };

  // Show quiz taking interface
  if (quizState.view === 'taking' && quizState.selectedQuiz) {
    return (
      <QuizTaker
        quizId={quizState.selectedQuiz.id}
        quizTitle={quizState.selectedQuiz.title}
        onComplete={handleQuizComplete}
        onBack={handleBackToQuizzes}
      />
    );
  }

  // Show quiz results
  if (quizState.view === 'results' && quizState.selectedQuiz && quizState.score !== undefined && quizState.totalQuestions !== undefined) {
    return (
      <QuizResults
        score={quizState.score}
        totalQuestions={quizState.totalQuestions}
        quizTitle={quizState.selectedQuiz.title}
        onRetakeQuiz={handleRetakeQuiz}
        onBackToQuizzes={handleBackToQuizzes}
      />
    );
  }

  // Show quiz list (default view)
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
            <Brain className="w-6 h-6 text-background" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Football Quizzes</h1>
            <p className="text-muted-foreground">Test your football knowledge and earn points</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {quizzes.map((quiz) => (
            <Card key={quiz.id} className="bg-gradient-card border-border hover:border-primary/50 transition-all duration-300 hover:scale-105">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{quiz.title}</CardTitle>
                    <p className="text-muted-foreground text-sm">{quiz.description}</p>
                  </div>
                  <Badge className={getDifficultyColor(quiz.difficulty)}>
                    {quiz.difficulty}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Brain className="w-4 h-4 text-primary" />
                    <span>{quiz.questions} questions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-accent" />
                    <span>{quiz.timeLimit}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span>{quiz.participants.toLocaleString()} played</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-football-gold" />
                    <span className="text-football-gold font-medium">{quiz.reward}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <Badge variant="outline" className="text-xs">
                    {quiz.category}
                  </Badge>
                  <Button 
                    className="bg-gradient-primary"
                    onClick={() => handleStartQuiz(quiz)}
                  >
                    Start Quiz
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Leaderboard Preview */}
        <Card className="bg-gradient-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-football-gold" />
              Weekly Leaderboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { rank: 1, name: "KenyanFootyFan", points: 12450 },
                { rank: 2, name: "GoMahiaSupporter", points: 11890 },
                { rank: 3, name: "HarambeeWarrior", points: 10760 }
              ].map((user) => (
                <div key={user.rank} className="flex items-center justify-between py-2 px-3 bg-background/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      user.rank === 1 ? "bg-football-gold text-background" :
                      user.rank === 2 ? "bg-muted-foreground text-background" :
                      "bg-accent text-background"
                    }`}>
                      {user.rank}
                    </div>
                    <span className="font-medium">{user.name}</span>
                  </div>
                  <span className="text-football-gold font-bold">{user.points.toLocaleString()} pts</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Quizzes