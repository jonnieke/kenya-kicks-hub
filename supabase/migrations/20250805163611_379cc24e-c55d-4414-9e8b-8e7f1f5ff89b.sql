-- Fix the generate_affiliate_code function search path
CREATE OR REPLACE FUNCTION public.generate_affiliate_code()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  code TEXT;
  exists_code BOOLEAN;
BEGIN
  LOOP
    code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
    SELECT EXISTS(SELECT 1 FROM public.affiliates WHERE affiliate_code = code) INTO exists_code;
    IF NOT exists_code THEN
      EXIT;
    END IF;
  END LOOP;
  RETURN code;
END;
$function$;

-- Fix the generate_tracking_code function search path
CREATE OR REPLACE FUNCTION public.generate_tracking_code()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  code TEXT;
  exists_code BOOLEAN;
BEGIN
  LOOP
    code := LOWER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 12));
    SELECT EXISTS(SELECT 1 FROM public.affiliate_links WHERE tracking_code = code) INTO exists_code;
    IF NOT exists_code THEN
      EXIT;
    END IF;
  END LOOP;
  RETURN code;
END;
$function$;

-- Create a function to properly insert predictions with sample data
CREATE OR REPLACE FUNCTION public.generate_sample_predictions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Clear existing predictions if any
  DELETE FROM predictions;
  
  -- Insert sample predictions using actual match UUIDs or create temp matches
  INSERT INTO predictions (match_id, predicted_score, confidence_score, reasoning, ai_model_used, home_win_odds, draw_odds, away_win_odds)
  VALUES 
    (gen_random_uuid(), '2-1', 75, 'Home team has strong recent form and home advantage', 'gemini-1.5-flash', 2.1, 3.2, 3.8),
    (gen_random_uuid(), '1-1', 60, 'Both teams evenly matched with solid defenses', 'gemini-1.5-flash', 2.5, 3.0, 2.9),
    (gen_random_uuid(), '3-0', 85, 'Away team missing key players, home team in excellent form', 'gemini-1.5-flash', 1.8, 3.5, 4.2);
END;
$function$;