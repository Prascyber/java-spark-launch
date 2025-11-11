-- Insert first admin user (using the most recently logged in user from auth logs)
-- This bypasses RLS policies to create the initial admin
INSERT INTO public.user_roles (user_id, role)
VALUES ('a84cdc68-8ce6-4adf-be99-b5c58eb332ec', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;