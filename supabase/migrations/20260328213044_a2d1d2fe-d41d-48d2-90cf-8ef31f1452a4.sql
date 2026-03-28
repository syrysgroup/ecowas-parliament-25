
-- Assign super_admin role to specified user
INSERT INTO public.user_roles (user_id, role)
VALUES ('0b5747ee-cf4a-4c22-8592-a649fca67e45', 'super_admin')
ON CONFLICT (user_id, role) DO NOTHING;
