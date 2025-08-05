-- Create news articles table
CREATE TABLE public.news_articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  image_url TEXT,
  author_id UUID NOT NULL,
  published_at TIMESTAMP WITH TIME ZONE,
  is_published BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  category TEXT DEFAULT 'General',
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create news comments table
CREATE TABLE public.news_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID NOT NULL REFERENCES public.news_articles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create news likes table
CREATE TABLE public.news_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID NOT NULL REFERENCES public.news_articles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(article_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE public.news_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_likes ENABLE ROW LEVEL SECURITY;

-- Create policies for news_articles
CREATE POLICY "News articles are publicly readable" 
ON public.news_articles 
FOR SELECT 
USING (is_published = true OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can create articles" 
ON public.news_articles 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update articles" 
ON public.news_articles 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete articles" 
ON public.news_articles 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create policies for news_comments
CREATE POLICY "Comments are publicly readable" 
ON public.news_comments 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create comments" 
ON public.news_comments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" 
ON public.news_comments 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" 
ON public.news_comments 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create policies for news_likes
CREATE POLICY "Likes are publicly readable" 
ON public.news_likes 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can like articles" 
ON public.news_likes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own likes" 
ON public.news_likes 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_news_articles_updated_at
BEFORE UPDATE ON public.news_articles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_news_comments_updated_at
BEFORE UPDATE ON public.news_comments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create functions to update counters
CREATE OR REPLACE FUNCTION public.update_news_article_counters()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF TG_TABLE_NAME = 'news_comments' THEN
      UPDATE public.news_articles 
      SET comment_count = comment_count + 1 
      WHERE id = NEW.article_id;
    ELSIF TG_TABLE_NAME = 'news_likes' THEN
      UPDATE public.news_articles 
      SET like_count = like_count + 1 
      WHERE id = NEW.article_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF TG_TABLE_NAME = 'news_comments' THEN
      UPDATE public.news_articles 
      SET comment_count = comment_count - 1 
      WHERE id = OLD.article_id;
    ELSIF TG_TABLE_NAME = 'news_likes' THEN
      UPDATE public.news_articles 
      SET like_count = like_count - 1 
      WHERE id = OLD.article_id;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for counter updates
CREATE TRIGGER news_comments_counter_trigger
AFTER INSERT OR DELETE ON public.news_comments
FOR EACH ROW
EXECUTE FUNCTION public.update_news_article_counters();

CREATE TRIGGER news_likes_counter_trigger
AFTER INSERT OR DELETE ON public.news_likes
FOR EACH ROW
EXECUTE FUNCTION public.update_news_article_counters();