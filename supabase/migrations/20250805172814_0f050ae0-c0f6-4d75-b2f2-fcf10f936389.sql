-- Fix function search path security issue
CREATE OR REPLACE FUNCTION public.update_news_article_counters()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;