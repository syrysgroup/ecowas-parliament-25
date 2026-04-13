
-- Add expires_at and resent_at columns to invitations table
-- (resend-invite edge function already references these but they were missing)
ALTER TABLE public.invitations
  ADD COLUMN IF NOT EXISTS expires_at  timestamptz,
  ADD COLUMN IF NOT EXISTS resent_at   timestamptz;

-- Backfill existing rows so they have a valid expiry
UPDATE public.invitations
  SET expires_at = created_at + INTERVAL '7 days'
  WHERE expires_at IS NULL;

-- Auto-set 7-day expiry for all new invitations at insert time
ALTER TABLE public.invitations
  ALTER COLUMN expires_at SET DEFAULT (now() + INTERVAL '7 days');

-- Replace handle_invitation_role trigger function:
-- Instead of marking accepted_at = now(), DELETE the invitation row so
-- accepted invitations disappear from the invitation center automatically.
-- Role assignment and metadata pre-population logic is preserved.
CREATE OR REPLACE FUNCTION public.handle_invitation_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  inv_rec RECORD;
BEGIN
  -- Find pending invitation matching this user's email
  SELECT i.role, i.metadata INTO inv_rec
  FROM public.invitations i
  WHERE i.email = NEW.email
    AND i.accepted_at IS NULL
  LIMIT 1;

  IF FOUND THEN
    -- Assign role from invitation
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, inv_rec.role)
    ON CONFLICT (user_id, role) DO NOTHING;

    -- Pre-populate profile fields from invitation metadata (only where empty)
    IF inv_rec.metadata IS NOT NULL THEN
      UPDATE public.profiles SET
        full_name    = CASE WHEN (full_name IS NULL OR full_name = '')
                        THEN inv_rec.metadata->>'full_name' ELSE full_name END,
        title        = CASE WHEN title IS NULL
                        THEN inv_rec.metadata->>'title' ELSE title END,
        organisation = CASE WHEN organisation IS NULL
                        THEN inv_rec.metadata->>'organisation' ELSE organisation END,
        bio          = CASE WHEN bio IS NULL
                        THEN inv_rec.metadata->>'bio' ELSE bio END,
        avatar_url   = CASE WHEN avatar_url IS NULL
                        THEN inv_rec.metadata->>'avatar_url' ELSE avatar_url END
      WHERE id = NEW.id;
    END IF;

    -- DELETE the invitation so it disappears from the invitation center
    DELETE FROM public.invitations
    WHERE email = NEW.email AND accepted_at IS NULL;
  END IF;

  RETURN NEW;
END;
$$;
