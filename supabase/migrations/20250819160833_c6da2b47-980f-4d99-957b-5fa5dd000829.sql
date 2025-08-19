-- Fix affiliate conversions security by adding proper access controls for financial data

-- Drop existing policy and create more secure ones
DROP POLICY IF EXISTS "Affiliates can view their conversions" ON public.affiliate_conversions;

-- Create restrictive policy for affiliates - only approved affiliates can view their own conversions
CREATE POLICY "Approved affiliates can view their conversions"
ON public.affiliate_conversions
FOR SELECT
TO authenticated
USING (
  affiliate_id IN (
    SELECT id FROM public.affiliates 
    WHERE user_id = auth.uid() AND status = 'approved'
  )
);

-- Admin policy for full access to manage financial data
CREATE POLICY "Admins can manage all conversions"
ON public.affiliate_conversions
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Prevent direct user inserts - only system/edge functions should create conversions
CREATE POLICY "Only system can insert conversions"
ON public.affiliate_conversions
FOR INSERT
WITH CHECK (false);

-- Prevent user updates - only admins can modify financial data
CREATE POLICY "Only admins can update conversions"
ON public.affiliate_conversions
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Prevent user deletes - only admins can delete financial records
CREATE POLICY "Only admins can delete conversions"
ON public.affiliate_conversions
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));