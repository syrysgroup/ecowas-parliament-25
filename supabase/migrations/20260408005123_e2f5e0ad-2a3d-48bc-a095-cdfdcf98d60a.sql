
-- Add contact fields to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS linkedin_url text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS twitter_url text;

-- Add read/delivered tracking to direct_messages
ALTER TABLE public.direct_messages ADD COLUMN IF NOT EXISTS read_at timestamptz;
ALTER TABLE public.direct_messages ADD COLUMN IF NOT EXISTS delivered_at timestamptz DEFAULT now();

-- Add read/delivered tracking to channel_messages
ALTER TABLE public.channel_messages ADD COLUMN IF NOT EXISTS read_at timestamptz;
ALTER TABLE public.channel_messages ADD COLUMN IF NOT EXISTS delivered_at timestamptz DEFAULT now();
