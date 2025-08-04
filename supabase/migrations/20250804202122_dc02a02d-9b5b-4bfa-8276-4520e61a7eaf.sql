-- Create affiliate tracking system

-- Create affiliates table
CREATE TABLE public.affiliates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  affiliate_code TEXT NOT NULL DEFAULT generate_affiliate_code(),
  commission_rate NUMERIC NOT NULL DEFAULT 0.05,
  status TEXT NOT NULL DEFAULT 'pending',
  total_clicks INTEGER DEFAULT 0,
  total_conversions INTEGER DEFAULT 0,
  total_earnings NUMERIC DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(affiliate_code)
);

-- Create affiliate_links table
CREATE TABLE public.affiliate_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_id UUID NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
  original_url TEXT NOT NULL,
  tracking_code TEXT NOT NULL DEFAULT generate_tracking_code(),
  campaign_name TEXT,
  is_active BOOLEAN DEFAULT true,
  click_count INTEGER DEFAULT 0,
  conversion_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(tracking_code)
);

-- Create affiliate_clicks table
CREATE TABLE public.affiliate_clicks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_id UUID NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
  affiliate_link_id UUID NOT NULL REFERENCES public.affiliate_links(id) ON DELETE CASCADE,
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
  affiliate_id UUID NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
  affiliate_click_id UUID NOT NULL REFERENCES public.affiliate_clicks(id) ON DELETE CASCADE,
  conversion_type TEXT NOT NULL DEFAULT 'signup',
  conversion_value NUMERIC,
  commission_amount NUMERIC,
  status TEXT NOT NULL DEFAULT 'pending',
  converted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on all tables
ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_conversions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for affiliates table
CREATE POLICY "Users can create affiliate applications" 
ON public.affiliates 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Affiliates can view their own data" 
ON public.affiliates 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Affiliates can update their own data" 
ON public.affiliates 
FOR UPDATE 
USING (user_id = auth.uid());

-- RLS Policies for affiliate_links table
CREATE POLICY "Affiliates can view their own links" 
ON public.affiliate_links 
FOR SELECT 
USING (affiliate_id IN (
  SELECT id FROM public.affiliates WHERE user_id = auth.uid()
));

CREATE POLICY "Affiliates can create their own links" 
ON public.affiliate_links 
FOR INSERT 
WITH CHECK (affiliate_id IN (
  SELECT id FROM public.affiliates WHERE user_id = auth.uid()
));

CREATE POLICY "Affiliates can update their own links" 
ON public.affiliate_links 
FOR UPDATE 
USING (affiliate_id IN (
  SELECT id FROM public.affiliates WHERE user_id = auth.uid()
));

-- RLS Policies for affiliate_clicks table
CREATE POLICY "Affiliates can view their clicks" 
ON public.affiliate_clicks 
FOR SELECT 
USING (affiliate_id IN (
  SELECT id FROM public.affiliates WHERE user_id = auth.uid()
));

-- RLS Policies for affiliate_conversions table
CREATE POLICY "Affiliates can view their conversions" 
ON public.affiliate_conversions 
FOR SELECT 
USING (affiliate_id IN (
  SELECT id FROM public.affiliates WHERE user_id = auth.uid()
));

-- Add triggers for updated_at columns
CREATE TRIGGER update_affiliates_updated_at
  BEFORE UPDATE ON public.affiliates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_affiliate_links_updated_at
  BEFORE UPDATE ON public.affiliate_links
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();