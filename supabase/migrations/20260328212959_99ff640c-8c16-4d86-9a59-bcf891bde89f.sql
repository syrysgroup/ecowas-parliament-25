
-- Create invitations table
CREATE TABLE public.invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  role public.app_role NOT NULL,
  invited_by uuid NOT NULL,
  token uuid NOT NULL DEFAULT gen_random_uuid(),
  accepted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(token),
  UNIQUE(email, role)
);

ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- Super admins can manage invitations
CREATE POLICY "Super admins manage invitations" ON public.invitations
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- Admins can read invitations
CREATE POLICY "Admins can read invitations" ON public.invitations
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Create events table
CREATE TABLE public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  date timestamptz NOT NULL,
  end_date timestamptz,
  location text,
  country text,
  programme text,
  capacity integer,
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Events are publicly readable" ON public.events
  FOR SELECT TO public
  USING (is_published = true);

CREATE POLICY "Admins manage events" ON public.events
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

-- Create event registrations table
CREATE TABLE public.event_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  name text NOT NULL,
  email text NOT NULL,
  country text,
  organisation text,
  status text NOT NULL DEFAULT 'registered',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(event_id, email)
);

ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can register for events" ON public.event_registrations
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own registrations" ON public.event_registrations
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins manage registrations" ON public.event_registrations
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

-- Update RLS policies to include super_admin everywhere admin is checked

-- user_roles: super_admin can manage all roles
CREATE POLICY "Super admins manage all roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- super_admin can view roles
CREATE POLICY "Super admins can view roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

-- Users can read their own roles
CREATE POLICY "Users can read own roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- applications: super_admin access
CREATE POLICY "Super admins can read all applications" ON public.applications
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can update applications" ON public.applications
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- nominations: super_admin access
CREATE POLICY "Super admins can update nominations" ON public.nominations
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- representatives: super_admin access
CREATE POLICY "Super admins manage representatives" ON public.representatives
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- profiles: super_admin can read all
CREATE POLICY "Super admins can read all profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

-- admin_activity_logs: super_admin access
CREATE POLICY "Super admins can read activity logs" ON public.admin_activity_logs
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins write activity logs" ON public.admin_activity_logs
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = actor_user_id AND public.has_role(auth.uid(), 'super_admin'));

-- Trigger: auto-assign role when invited user signs up
CREATE OR REPLACE FUNCTION public.handle_invitation_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Check if this new user's email has a pending invitation
  INSERT INTO public.user_roles (user_id, role)
  SELECT NEW.id, i.role
  FROM public.invitations i
  WHERE i.email = NEW.email AND i.accepted_at IS NULL
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Mark invitations as accepted
  UPDATE public.invitations
  SET accepted_at = now()
  WHERE email = NEW.email AND accepted_at IS NULL;

  RETURN NEW;
END;
$$;

-- Attach trigger to profiles table (fires when handle_new_user creates a profile)
CREATE TRIGGER on_profile_created_assign_invitation_role
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_invitation_role();
