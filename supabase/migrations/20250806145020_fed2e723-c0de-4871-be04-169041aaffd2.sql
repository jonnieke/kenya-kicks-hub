-- Create competitions table for better league management
CREATE TABLE public.competitions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  short_name TEXT NOT NULL,
  api_id INTEGER NOT NULL UNIQUE,
  country TEXT NOT NULL,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#1f2937',
  secondary_color TEXT DEFAULT '#374151',
  category TEXT NOT NULL DEFAULT 'domestic', -- domestic, european, international
  priority INTEGER NOT NULL DEFAULT 100, -- lower = higher priority
  is_active BOOLEAN NOT NULL DEFAULT true,
  current_season TEXT,
  format TEXT DEFAULT 'league', -- league, knockout, group_knockout
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.competitions ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Competitions are publicly readable" 
ON public.competitions 
FOR SELECT 
USING (true);

-- Create policy for admin management
CREATE POLICY "Admins can manage competitions" 
ON public.competitions 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert the target European competitions
INSERT INTO public.competitions (name, short_name, api_id, country, category, priority, format) VALUES
('Premier League', 'EPL', 39, 'England', 'domestic', 1, 'league'),
('La Liga EA SPORTS', 'La Liga', 140, 'Spain', 'domestic', 2, 'league'),
('Serie A', 'Serie A', 135, 'Italy', 'domestic', 3, 'league'),
('Bundesliga', 'Bundesliga', 78, 'Germany', 'domestic', 4, 'league'),
('UEFA Champions League', 'UCL', 2, 'Europe', 'european', 5, 'group_knockout'),
('UEFA Europa League', 'UEL', 3, 'Europe', 'european', 6, 'group_knockout'),
('UEFA Europa Conference League', 'UECL', 848, 'Europe', 'european', 7, 'group_knockout');

-- Add competition_id to matches table for better organization
ALTER TABLE public.matches ADD COLUMN competition_id UUID REFERENCES public.competitions(id);

-- Add competition_id to league_tables table
ALTER TABLE public.league_tables ADD COLUMN competition_id UUID REFERENCES public.competitions(id);

-- Add indexes for better performance
CREATE INDEX idx_matches_competition_id ON public.matches(competition_id);
CREATE INDEX idx_matches_start_time ON public.matches(start_time);
CREATE INDEX idx_league_tables_competition_id ON public.league_tables(competition_id);
CREATE INDEX idx_competitions_priority ON public.competitions(priority);
CREATE INDEX idx_competitions_category ON public.competitions(category);

-- Create trigger for updated_at
CREATE TRIGGER update_competitions_updated_at
BEFORE UPDATE ON public.competitions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();