-- Add metadata column to invitations (stores pre-population data for converted team members)
ALTER TABLE public.invitations ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT NULL;

-- Update handle_invitation_role to also populate profile fields from invitation metadata
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
  WHERE i.email = NEW.email AND i.accepted_at IS NULL
  LIMIT 1;

  IF FOUND THEN
    -- Assign role from invitation
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, inv_rec.role)
    ON CONFLICT (user_id, role) DO NOTHING;

    -- Pre-populate profile fields from invitation metadata (only where profile fields are empty)
    IF inv_rec.metadata IS NOT NULL THEN
      UPDATE public.profiles SET
        full_name    = CASE WHEN (full_name IS NULL OR full_name = '') THEN inv_rec.metadata->>'full_name' ELSE full_name END,
        title        = CASE WHEN title IS NULL THEN inv_rec.metadata->>'title' ELSE title END,
        organisation = CASE WHEN organisation IS NULL THEN inv_rec.metadata->>'organisation' ELSE organisation END,
        bio          = CASE WHEN bio IS NULL THEN inv_rec.metadata->>'bio' ELSE bio END,
        avatar_url   = CASE WHEN avatar_url IS NULL THEN inv_rec.metadata->>'avatar_url' ELSE avatar_url END
      WHERE id = NEW.id;
    END IF;

    -- Mark all pending invitations for this email as accepted
    UPDATE public.invitations
    SET accepted_at = now()
    WHERE email = NEW.email AND accepted_at IS NULL;
  END IF;

  RETURN NEW;
END;
$$;
