-- Create affiliate management tables
CREATE TABLE public.affiliates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  website_url TEXT,
  logo_url TEXT,
  commission_rate DECIMAL(5,2) DEFAULT 0.00,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create affiliate links table
CREATE TABLE public.affiliate_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_id UUID NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  original_url TEXT NOT NULL,
  tracking_code TEXT NOT NULL UNIQUE,
  placement_type TEXT NOT NULL CHECK (placement_type IN ('banner', 'card', 'text', 'floating', 'popup')),
  page_location TEXT NOT NULL CHECK (page_location IN ('home', 'predictions', 'live-scores', 'news', 'quizzes', 'all')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create affiliate clicks tracking table
CREATE TABLE public.affiliate_clicks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_link_id UUID NOT NULL REFERENCES public.affiliate_links(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  page_url TEXT NOT NULL,
  clicked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create affiliate conversions table (for tracking signups/purchases)
CREATE TABLE public.affiliate_conversions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_click_id UUID NOT NULL REFERENCES public.affiliate_clicks(id) ON DELETE CASCADE,
  conversion_type TEXT NOT NULL CHECK (conversion_type IN ('signup', 'deposit', 'bet', 'other')),
  conversion_value DECIMAL(10,2),
  commission_earned DECIMAL(10,2),
  converted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_conversions ENABLE ROW LEVEL SECURITY;

-- Create policies for affiliates table
CREATE POLICY "Affiliates are publicly readable" 
ON public.affiliates 
FOR SELECT 
USING (status = 'active');

CREATE POLICY "Admins can manage affiliates" 
ON public.affiliates 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Create policies for affiliate_links table
CREATE POLICY "Active affiliate links are publicly readable" 
ON public.affiliate_links 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage affiliate links" 
ON public.affiliate_links 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Create policies for affiliate_clicks table
CREATE POLICY "Users can create affiliate clicks" 
ON public.affiliate_clicks 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can view all affiliate clicks" 
ON public.affiliate_clicks 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

-- Create policies for affiliate_conversions table
CREATE POLICY "Admins can manage affiliate conversions" 
ON public.affiliate_conversions 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Create function to generate unique tracking codes
CREATE OR REPLACE FUNCTION public.generate_tracking_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  exists_check BOOLEAN;
BEGIN
  LOOP
    -- Generate 8 character alphanumeric code
    code := UPPER(substring(encode(gen_random_bytes(6), 'base64') from 1 for 8));
    -- Remove any special characters
    code := regexp_replace(code, '[^A-Z0-9]', '', 'g');
    -- Ensure it's 8 characters
    IF length(code) >= 8 THEN
      code := substring(code from 1 for 8);
      -- Check if code already exists
      SELECT EXISTS(SELECT 1 FROM public.affiliate_links WHERE tracking_code = code) INTO exists_check;
      IF NOT exists_check THEN
        RETURN code;
      END IF;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate tracking codes
CREATE OR REPLACE FUNCTION public.set_tracking_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.tracking_code IS NULL OR NEW.tracking_code = '' THEN
    NEW.tracking_code := public.generate_tracking_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_affiliate_link_tracking_code
  BEFORE INSERT ON public.affiliate_links
  FOR EACH ROW
  EXECUTE FUNCTION public.set_tracking_code();

-- Create updated_at triggers
CREATE TRIGGER update_affiliates_updated_at
  BEFORE UPDATE ON public.affiliates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_affiliate_links_updated_at
  BEFORE UPDATE ON public.affiliate_links
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample affiliate data
INSERT INTO public.affiliates (name, description, website_url, commission_rate, status) VALUES
('Bet365', 'Leading online sports betting platform with competitive odds', 'https://www.bet365.com', 25.00, 'active'),
('1xBet', 'International betting company with extensive African coverage', 'https://1xbet.com', 30.00, 'active'),
('Betway', 'Trusted sports betting with focus on African markets', 'https://betway.com', 20.00, 'active'),
('SportyBet', 'Popular African sports betting platform', 'https://sportybet.com', 35.00, 'active');