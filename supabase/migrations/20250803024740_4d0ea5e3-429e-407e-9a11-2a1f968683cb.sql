-- Create quiz tables
CREATE TABLE public.quiz_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id TEXT NOT NULL,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  difficulty TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.quiz_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id TEXT NOT NULL,
  user_id UUID,
  score INTEGER NOT NULL DEFAULT 0,
  total_questions INTEGER NOT NULL,
  answers JSONB NOT NULL DEFAULT '{}',
  completed_at TIMESTAMP WITH TIME ZONE,
  time_taken INTEGER, -- in seconds
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for quiz questions (public read)
CREATE POLICY "Quiz questions are publicly readable"
ON public.quiz_questions
FOR SELECT
USING (true);

-- Create policies for quiz sessions (users can manage their own)
CREATE POLICY "Users can view their own quiz sessions"
ON public.quiz_sessions
FOR SELECT
USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Users can create quiz sessions"
ON public.quiz_sessions
FOR INSERT
WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Users can update their own quiz sessions"
ON public.quiz_sessions
FOR UPDATE
USING (user_id = auth.uid() OR user_id IS NULL);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_quiz_sessions_updated_at
BEFORE UPDATE ON public.quiz_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample quiz questions
INSERT INTO public.quiz_questions (quiz_id, question, options, correct_answer, explanation, difficulty) VALUES
('premier-league-legends', 'Who scored the most goals in a single Premier League season?', '["Alan Shearer", "Mohamed Salah", "Harry Kane", "Thierry Henry"]', 'Mohamed Salah', 'Mohamed Salah scored 32 goals in the 2017-18 season, breaking the Premier League record.', 'Medium'),
('premier-league-legends', 'Which team has won the most Premier League titles?', '["Manchester United", "Manchester City", "Chelsea", "Arsenal"]', 'Manchester United', 'Manchester United has won 13 Premier League titles since 1992.', 'Easy'),
('premier-league-legends', 'Who holds the record for most assists in a Premier League season?', '["Kevin De Bruyne", "Thierry Henry", "Frank Lampard", "Cesc Fabregas"]', 'Kevin De Bruyne', 'Kevin De Bruyne recorded 20 assists in the 2019-20 season.', 'Hard'),

('kenyan-football-heroes', 'What is the nickname of the Kenyan national football team?', '["Harambee Stars", "Lions of Kenya", "Kenyan Warriors", "Safari Stars"]', 'Harambee Stars', 'Harambee means "pull together" in Swahili and represents unity.', 'Easy'),
('kenyan-football-heroes', 'Which Kenyan footballer played for Tottenham Hotspur?', '["Victor Wanyama", "Dennis Oliech", "McDonald Mariga", "Michael Olunga"]', 'Victor Wanyama', 'Victor Wanyama played for Tottenham from 2016 to 2020.', 'Medium'),
('kenyan-football-heroes', 'In which year did Kenya first qualify for the Africa Cup of Nations?', '["1972", "1988", "1992", "2004"]', '1972', 'Kenya first qualified for AFCON in 1972 and reached the final.', 'Hard'),

('world-cup-trivia', 'Which country has won the most FIFA World Cups?', '["Brazil", "Germany", "Argentina", "Italy"]', 'Brazil', 'Brazil has won the World Cup 5 times (1958, 1962, 1970, 1994, 2002).', 'Easy'),
('world-cup-trivia', 'Who scored the fastest goal in World Cup history?', '["Hakan Şükür", "Alan Shearer", "Clint Dempsey", "Tim Cahill"]', 'Hakan Şükür', 'Hakan Şükür scored after 11 seconds for Turkey vs South Korea in 2002.', 'Hard'),
('world-cup-trivia', 'Which World Cup had the highest average goals per game?', '["1954 Switzerland", "1970 Mexico", "1982 Spain", "1998 France"]', '1954 Switzerland', 'The 1954 World Cup averaged 5.38 goals per game.', 'Hard'),

('transfer-market-madness', 'What was the transfer fee for Neymar to PSG in 2017?', '["€200 million", "€222 million", "€250 million", "€300 million"]', '€222 million', 'Neymar''s €222 million transfer broke all previous records.', 'Medium'),
('transfer-market-madness', 'Which player holds the record for most expensive goalkeeper transfer?', '["Kepa Arrizabalaga", "Alisson Becker", "Ederson", "Gianluigi Donnarumma"]', 'Kepa Arrizabalaga', 'Chelsea paid €80 million for Kepa in 2018.', 'Medium'),
('transfer-market-madness', 'From which club did Manchester City sign Erling Haaland?', '["Borussia Dortmund", "Red Bull Salzburg", "Molde", "Bayern Munich"]', 'Borussia Dortmund', 'Haaland joined Manchester City from Borussia Dortmund in 2022.', 'Easy');