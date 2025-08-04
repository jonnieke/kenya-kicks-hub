-- Add missing columns to matches table for scores
ALTER TABLE public.matches 
ADD COLUMN IF NOT EXISTS home_score INTEGER DEFAULT NULL,
ADD COLUMN IF NOT EXISTS away_score INTEGER DEFAULT NULL,
ADD COLUMN IF NOT EXISTS start_time TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS minute TEXT DEFAULT NULL;

-- Update existing matches to have start_time from match_date if not set
UPDATE public.matches 
SET start_time = match_date 
WHERE start_time IS NULL;

-- Create league_tables table for team standings
CREATE TABLE IF NOT EXISTS public.league_tables (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  league TEXT NOT NULL,
  team_name TEXT NOT NULL,
  position INTEGER NOT NULL,
  matches_played INTEGER DEFAULT 0,
  wins INTEGER DEFAULT 0,
  draws INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  goals_for INTEGER DEFAULT 0,
  goals_against INTEGER DEFAULT 0,
  goal_difference INTEGER DEFAULT 0,
  points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(league, team_name)
);

-- Enable RLS on league_tables
ALTER TABLE public.league_tables ENABLE ROW LEVEL SECURITY;

-- Create policy for league_tables to be publicly readable
CREATE POLICY "League tables are publicly readable" 
ON public.league_tables 
FOR SELECT 
USING (true);

-- Create trigger for automatic timestamp updates on league_tables
CREATE TRIGGER update_league_tables_updated_at
  BEFORE UPDATE ON public.league_tables
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for matches and league_tables
ALTER TABLE public.matches REPLICA IDENTITY FULL;
ALTER TABLE public.league_tables REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.matches;
ALTER PUBLICATION supabase_realtime ADD TABLE public.league_tables;