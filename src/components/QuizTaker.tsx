import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface Question {
  id: string;
  question: string;
  options: string[];
  correct_answer: string;
  explanation?: string;
  difficulty: string;
}

interface QuizTakerProps {
  quizId: string;
  quizTitle: string;
  onComplete: (score: number, totalQuestions: number) => void;
  onBack: () => void;
}

export const QuizTaker = ({ quizId, quizTitle, onComplete, onBack }: QuizTakerProps) => {
  const { toast } = useToast();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionId, setSessionId] = useState<string>("");
  const [timeStarted, setTimeStarted] = useState<number>(Date.now());

  useEffect(() => {
    loadQuestions();
  }, [quizId]);

  const loadQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('quiz_id', quizId)
        .order('created_at');

      if (error) throw error;

      const formattedQuestions = data.map(q => ({
        id: q.id,
        question: q.question,
        options: q.options as string[],
        correct_answer: q.correct_answer,
        explanation: q.explanation,
        difficulty: q.difficulty
      }));

      setQuestions(formattedQuestions);
      
      // Create quiz session
      const { data: sessionData, error: sessionError } = await supabase
        .from('quiz_sessions')
        .insert({
          quiz_id: quizId,
          total_questions: formattedQuestions.length,
          answers: {}
        })
        .select()
        .single();

      if (sessionError) throw sessionError;
      setSessionId(sessionData.id);
      setTimeStarted(Date.now());
    } catch (error) {
      console.error('Error loading questions:', error);
      toast({
        title: "Error",
        description: "Failed to load quiz questions",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const handleNext = () => {
    if (!selectedAnswer) return;

    const newAnswers = { ...answers, [questions[currentQuestionIndex].id]: selectedAnswer };
    setAnswers(newAnswers);
    
    setShowExplanation(true);
    
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer("");
        setShowExplanation(false);
      } else {
        finishQuiz(newAnswers);
      }
    }, 3000);
  };

  const finishQuiz = async (finalAnswers: Record<string, string>) => {
    const score = questions.reduce((total, question) => {
      return total + (finalAnswers[question.id] === question.correct_answer ? 1 : 0);
    }, 0);

    const timeElapsed = Math.floor((Date.now() - timeStarted) / 1000);

    try {
      await supabase
        .from('quiz_sessions')
        .update({
          score,
          answers: finalAnswers,
          completed_at: new Date().toISOString(),
          time_taken: timeElapsed
        })
        .eq('id', sessionId);

      toast({
        title: "Quiz Completed!",
        description: `You scored ${score}/${questions.length}`,
      });

      onComplete(score, questions.length);
    } catch (error) {
      console.error('Error saving quiz results:', error);
      toast({
        title: "Error",
        description: "Failed to save quiz results",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <Card className="w-full max-w-2xl">
          <CardContent className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p>Loading quiz questions...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <Card className="w-full max-w-2xl">
          <CardContent className="p-8 text-center">
            <p className="mb-4">No questions found for this quiz.</p>
            <Button onClick={onBack}>Back to Quizzes</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={onBack}>
            ← Back to Quizzes
          </Button>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span className="text-sm">Question {currentQuestionIndex + 1} of {questions.length}</span>
          </div>
        </div>

        <Card className="bg-gradient-card border-border">
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <CardTitle className="text-2xl">{quizTitle}</CardTitle>
              <Badge variant="outline">
                {currentQuestion.difficulty}
              </Badge>
            </div>
            <Progress value={progress} className="w-full" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">{currentQuestion.question}</h3>
              
              <div className="grid gap-3">
                {currentQuestion.options.map((option, index) => {
                  const isSelected = selectedAnswer === option;
                  const isCorrect = option === currentQuestion.correct_answer;
                  const isWrong = showExplanation && isSelected && !isCorrect;
                  
                  return (
                    <Button
                      key={index}
                      variant={isSelected ? "default" : "outline"}
                      className={`p-4 h-auto text-left justify-start transition-all duration-200 ${
                        showExplanation
                          ? isCorrect
                            ? "bg-football-green text-background border-football-green"
                            : isWrong
                            ? "bg-destructive text-destructive-foreground border-destructive"
                            : "opacity-50"
                          : isSelected
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-accent"
                      }`}
                      onClick={() => !showExplanation && handleAnswerSelect(option)}
                      disabled={showExplanation}
                    >
                      <div className="flex items-center gap-3 w-full">
                        {showExplanation && (
                          <>
                            {isCorrect && <CheckCircle className="w-5 h-5" />}
                            {isWrong && <XCircle className="w-5 h-5" />}
                          </>
                        )}
                        <span className="flex-1">{option}</span>
                      </div>
                    </Button>
                  );
                })}
              </div>

              {showExplanation && currentQuestion.explanation && (
                <Card className="bg-background/50 border-primary/20">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-football-green mt-0.5" />
                      <div>
                        <p className="font-medium mb-1">Explanation</p>
                        <p className="text-sm text-muted-foreground">{currentQuestion.explanation}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="flex justify-end">
              <Button
                onClick={handleNext}
                disabled={!selectedAnswer || showExplanation}
                className="bg-gradient-primary"
              >
                {currentQuestionIndex === questions.length - 1 ? "Finish Quiz" : "Next Question"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};