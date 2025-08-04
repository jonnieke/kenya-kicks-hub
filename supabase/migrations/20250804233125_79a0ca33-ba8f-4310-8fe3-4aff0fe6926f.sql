-- Grant admin role to admin@ballmtaani.com
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role 
FROM auth.users 
WHERE email = 'admin@ballmtaani.com'
ON CONFLICT (user_id, role) DO NOTHING;