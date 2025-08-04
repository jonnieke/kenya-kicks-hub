-- Create discussions table
CREATE TABLE public.discussions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_pinned BOOLEAN DEFAULT false,
  reply_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0
);

-- Create discussion replies table
CREATE TABLE public.discussion_replies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  discussion_id UUID NOT NULL,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create polls table
CREATE TABLE public.polls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  total_votes INTEGER DEFAULT 0
);

-- Create poll options table
CREATE TABLE public.poll_options (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id UUID NOT NULL,
  option_text TEXT NOT NULL,
  vote_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create poll votes table
CREATE TABLE public.poll_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id UUID NOT NULL,
  poll_option_id UUID NOT NULL,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(poll_id, user_id)
);

-- Enable RLS
ALTER TABLE public.discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discussion_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for discussions
CREATE POLICY "Discussions are publicly readable" 
ON public.discussions 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create discussions" 
ON public.discussions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own discussions" 
ON public.discussions 
FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS Policies for discussion replies
CREATE POLICY "Discussion replies are publicly readable" 
ON public.discussion_replies 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create replies" 
ON public.discussion_replies 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own replies" 
ON public.discussion_replies 
FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS Policies for polls
CREATE POLICY "Polls are publicly readable" 
ON public.polls 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create polls" 
ON public.polls 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own polls" 
ON public.polls 
FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS Policies for poll options
CREATE POLICY "Poll options are publicly readable" 
ON public.poll_options 
FOR SELECT 
USING (true);

CREATE POLICY "Poll creators can manage options" 
ON public.poll_options 
FOR ALL 
USING (poll_id IN (SELECT id FROM polls WHERE user_id = auth.uid()));

-- RLS Policies for poll votes
CREATE POLICY "Users can view poll votes" 
ON public.poll_votes 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can vote" 
ON public.poll_votes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own votes" 
ON public.poll_votes 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Add foreign key constraints
ALTER TABLE public.discussion_replies 
ADD CONSTRAINT fk_discussion_replies_discussion_id 
FOREIGN KEY (discussion_id) REFERENCES public.discussions(id) ON DELETE CASCADE;

ALTER TABLE public.poll_options 
ADD CONSTRAINT fk_poll_options_poll_id 
FOREIGN KEY (poll_id) REFERENCES public.polls(id) ON DELETE CASCADE;

ALTER TABLE public.poll_votes 
ADD CONSTRAINT fk_poll_votes_poll_id 
FOREIGN KEY (poll_id) REFERENCES public.polls(id) ON DELETE CASCADE;

ALTER TABLE public.poll_votes 
ADD CONSTRAINT fk_poll_votes_poll_option_id 
FOREIGN KEY (poll_option_id) REFERENCES public.poll_options(id) ON DELETE CASCADE;

-- Add triggers for updating timestamps
CREATE TRIGGER update_discussions_updated_at
BEFORE UPDATE ON public.discussions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_discussion_replies_updated_at
BEFORE UPDATE ON public.discussion_replies
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_polls_updated_at
BEFORE UPDATE ON public.polls
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();