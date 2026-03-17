
-- Create profiles table
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text NOT NULL,
  country text NOT NULL,
  date_of_birth date,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, country)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'country', '')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create applications table
CREATE TABLE public.applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  country text NOT NULL,
  motivation text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own application" ON public.applications
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own applications" ON public.applications
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Create nominations table
CREATE TABLE public.nominations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nominee_user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  nominator_user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  country text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (nominee_user_id, nominator_user_id)
);

ALTER TABLE public.nominations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can nominate" ON public.nominations
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = nominator_user_id);

CREATE POLICY "Anyone authenticated can read nominations" ON public.nominations
  FOR SELECT TO authenticated USING (true);

-- Function to get nomination count
CREATE OR REPLACE FUNCTION public.get_nomination_count(nominee_id uuid)
RETURNS bigint
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*) FROM public.nominations WHERE nominee_user_id = nominee_id;
$$;

-- Allow public read of profiles for nomination search
CREATE POLICY "Authenticated users can search profiles" ON public.profiles
  FOR SELECT TO authenticated USING (true);
