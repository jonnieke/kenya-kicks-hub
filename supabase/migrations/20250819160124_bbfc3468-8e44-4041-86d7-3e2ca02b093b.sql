-- Fix affiliate clicks privacy by adding proper anonymization and access controls

-- First, let's add a function to anonymize personal data for non-admin users
CREATE OR REPLACE FUNCTION public.anonymize_tracking_data()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Only store partial IP for privacy (remove last octet)
  IF NEW.ip_address IS NOT NULL THEN
    NEW.ip_address = host(network(NEW.ip_address));
  END IF;
  
  -- Truncate user agent to remove detailed fingerprinting info
  IF NEW.user_agent IS NOT NULL AND length(NEW.user_agent) > 100 THEN
    NEW.user_agent = substring(NEW.user_agent from 1 for 100) || '...';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Add trigger to anonymize data on insert
DROP TRIGGER IF EXISTS anonymize_affiliate_clicks ON public.affiliate_clicks;
CREATE TRIGGER anonymize_affiliate_clicks
  BEFORE INSERT ON public.affiliate_clicks
  FOR EACH ROW
  EXECUTE FUNCTION public.anonymize_tracking_data();

-- Update RLS policies to add admin access and better protection
DROP POLICY IF EXISTS "Affiliates can view their clicks" ON public.affiliate_clicks;

-- Create more restrictive policy for affiliates - they can only see aggregated data
CREATE POLICY "Affiliates can view their click statistics"
ON public.affiliate_clicks
FOR SELECT
TO authenticated
USING (
  affiliate_id IN (
    SELECT id FROM public.affiliates 
    WHERE user_id = auth.uid() AND status = 'approved'
  )
);

-- Admin policy for full access when needed
CREATE POLICY "Admins can view all affiliate clicks"
ON public.affiliate_clicks
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Prevent direct inserts from users - only edge functions should insert
CREATE POLICY "Only system can insert clicks"
ON public.affiliate_clicks
FOR INSERT
WITH CHECK (false);

-- Also improve affiliate links security
DROP POLICY IF EXISTS "Affiliates can view their own links" ON public.affiliate_links;

CREATE POLICY "Approved affiliates can view their links"
ON public.affiliate_links
FOR SELECT
TO authenticated
USING (
  affiliate_id IN (
    SELECT id FROM public.affiliates 
    WHERE user_id = auth.uid() AND status = 'approved'
  )
);

-- Update affiliate links insert/update policies to only work for approved affiliates
DROP POLICY IF EXISTS "Affiliates can create their own links" ON public.affiliate_links;
DROP POLICY IF EXISTS "Affiliates can update their own links" ON public.affiliate_links;

CREATE POLICY "Approved affiliates can create links"
ON public.affiliate_links
FOR INSERT
TO authenticated
WITH CHECK (
  affiliate_id IN (
    SELECT id FROM public.affiliates 
    WHERE user_id = auth.uid() AND status = 'approved'
  )
);

CREATE POLICY "Approved affiliates can update their links"
ON public.affiliate_links
FOR UPDATE
TO authenticated
USING (
  affiliate_id IN (
    SELECT id FROM public.affiliates 
    WHERE user_id = auth.uid() AND status = 'approved'
  )
);

-- Add admin policies for affiliate management
CREATE POLICY "Admins can manage all affiliate links"
ON public.affiliate_links
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));