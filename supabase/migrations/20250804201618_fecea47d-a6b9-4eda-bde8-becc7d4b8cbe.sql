-- Create affiliates table
CREATE TABLE public.affiliates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  affiliate_code TEXT NOT NULL UNIQUE,
  company_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  commission_rate DECIMAL(5,4) NOT NULL DEFAULT 0.05,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
  total_earnings DECIMAL(10,2) DEFAULT 0.00,
  total_clicks INTEGER DEFAULT 0,
  total_conversions INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create affiliate_links table
CREATE TABLE public.affiliate_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_id UUID NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
  original_url TEXT NOT NULL,
  tracking_code TEXT NOT NULL UNIQUE,
  campaign_name TEXT,
  is_active BOOLEAN DEFAULT true,
  click_count INTEGER DEFAULT 0,
  conversion_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create affiliate_clicks table
CREATE TABLE public.affiliate_clicks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_link_id UUID NOT NULL REFERENCES public.affiliate_links(id) ON DELETE CASCADE,
  affiliate_id UUID NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  country TEXT,
  city TEXT,
  device_type TEXT,
  browser TEXT,
  clicked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create affiliate_conversions table
CREATE TABLE public.affiliate_conversions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_click_id UUID NOT NULL REFERENCES public.affiliate_clicks(id) ON DELETE CASCADE,
  affiliate_id UUID NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
  conversion_type TEXT NOT NULL DEFAULT 'signup' CHECK (conversion_type IN ('signup', 'subscription', 'purchase')),
  conversion_value DECIMAL(10,2),
  commission_amount DECIMAL(10,2),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'rejected')),
  converted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on all tables
ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_conversions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for affiliates table
CREATE POLICY "Affiliates can view their own data" 
ON public.affiliates 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can create affiliate applications" 
ON public.affiliates 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Affiliates can update their own data" 
ON public.affiliates 
FOR UPDATE 
USING (user_id = auth.uid());

-- RLS Policies for affiliate_links table
CREATE POLICY "Affiliates can view their own links" 
ON public.affiliate_links 
FOR SELECT 
USING (affiliate_id IN (SELECT id FROM public.affiliates WHERE user_id = auth.uid()));

CREATE POLICY "Affiliates can create their own links" 
ON public.affiliate_links 
FOR INSERT 
WITH CHECK (affiliate_id IN (SELECT id FROM public.affiliates WHERE user_id = auth.uid()));

CREATE POLICY "Affiliates can update their own links" 
ON public.affiliate_links 
FOR UPDATE 
USING (affiliate_id IN (SELECT id FROM public.affiliates WHERE user_id = auth.uid()));

-- RLS Policies for affiliate_clicks table (read-only for affiliates)
CREATE POLICY "Affiliates can view their clicks" 
ON public.affiliate_clicks 
FOR SELECT 
USING (affiliate_id IN (SELECT id FROM public.affiliates WHERE user_id = auth.uid()));

-- RLS Policies for affiliate_conversions table (read-only for affiliates)
CREATE POLICY "Affiliates can view their conversions" 
ON public.affiliate_conversions 
FOR SELECT 
USING (affiliate_id IN (SELECT id FROM public.affiliates WHERE user_id = auth.uid()));

-- Function to generate unique affiliate codes
CREATE OR REPLACE FUNCTION public.generate_affiliate_code()
RETURNS TEXT AS $$
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
$$ LANGUAGE plpgsql;

-- Function to generate unique tracking codes
CREATE OR REPLACE FUNCTION public.generate_tracking_code()
RETURNS TEXT AS $$
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
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at columns
CREATE TRIGGER update_affiliates_updated_at
BEFORE UPDATE ON public.affiliates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_affiliate_links_updated_at
BEFORE UPDATE ON public.affiliate_links
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample affiliate data
INSERT INTO public.affiliates (user_id, affiliate_code, company_name, contact_email, commission_rate, status) VALUES
(NULL, 'SPORTNEWS', 'Sports News Network', 'contact@sportsnews.com', 0.08, 'approved'),
(NULL, 'FOOTYBET', 'Footy Betting Co', 'affiliate@footybet.com', 0.12, 'approved'),
(NULL, 'SOCCERGEAR', 'Soccer Gear Plus', 'partners@soccergear.com', 0.06, 'approved');

-- Insert sample affiliate links
INSERT INTO public.affiliate_links (affiliate_id, original_url, tracking_code, campaign_name) VALUES
((SELECT id FROM public.affiliates WHERE affiliate_code = 'SPORTNEWS'), 'https://sportsnews.com/premium', 'sn001premium', 'Premium Subscription'),
((SELECT id FROM public.affiliates WHERE affiliate_code = 'FOOTYBET'), 'https://footybet.com/signup', 'fb001signup', 'New User Signup'),
((SELECT id FROM public.affiliates WHERE affiliate_code = 'SOCCERGEAR'), 'https://soccergear.com/football-boots', 'sg001boots', 'Football Boots Campaign');