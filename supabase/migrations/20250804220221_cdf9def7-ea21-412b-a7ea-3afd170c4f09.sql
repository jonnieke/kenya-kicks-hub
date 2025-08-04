-- Allow admins to manage matches
CREATE POLICY "Admins can insert matches" 
ON public.matches 
FOR INSERT 
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update matches" 
ON public.matches 
FOR UPDATE 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete matches" 
ON public.matches 
FOR DELETE 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));