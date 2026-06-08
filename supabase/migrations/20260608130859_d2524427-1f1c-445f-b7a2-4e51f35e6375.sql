
-- Patch audit triggers to no-op when there is no authenticated actor
CREATE OR REPLACE FUNCTION public.log_role_permission_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;
  INSERT INTO public.admin_activity_logs(actor_user_id, action, entity_type, entity_id, details)
  VALUES (
    auth.uid(),
    lower(TG_OP),
    'role_permission',
    COALESCE(NEW.id, OLD.id),
    jsonb_build_object(
      'role',   COALESCE(NEW.role::text,   OLD.role::text),
      'module', COALESCE(NEW.module,        OLD.module),
      'old',    CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE to_jsonb(OLD) END,
      'new',    CASE WHEN TG_OP = 'DELETE' THEN NULL ELSE to_jsonb(NEW) END
    )
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE OR REPLACE FUNCTION public.log_user_role_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;
  INSERT INTO public.admin_activity_logs(actor_user_id, action, entity_type, entity_id, details)
  VALUES (
    auth.uid(),
    lower(TG_OP),
    'user_role',
    COALESCE(NEW.user_id, OLD.user_id),
    jsonb_build_object(
      'role',    COALESCE(NEW.role::text, OLD.role::text),
      'user_id', COALESCE(NEW.user_id,     OLD.user_id)
    )
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Seed missing module permissions
INSERT INTO public.role_permissions (role, module, can_view, can_create, can_edit, can_delete)
VALUES
  ('admin'::app_role,                  'volunteer', true,  true,  true,  true),
  ('communications_officer'::app_role, 'volunteer', true,  true,  true,  false),
  ('programme_lead'::app_role,         'volunteer', true,  true,  true,  false),
  ('moderator'::app_role,              'volunteer', true,  true,  true,  false),

  ('admin'::app_role,                  'media-accreditation', true, true, true, true),
  ('communications_officer'::app_role, 'media-accreditation', true, true, true, false),
  ('marketing_manager'::app_role,      'media-accreditation', true, true, true, false),

  ('admin'::app_role,           'legal-pages', true, true, true, true),
  ('website_editor'::app_role,  'legal-pages', true, true, true, false),

  ('admin'::app_role,           'youth-sub-pillars', true, true, true, true),
  ('website_editor'::app_role,  'youth-sub-pillars', true, true, true, false),
  ('programme_lead'::app_role,  'youth-sub-pillars', true, true, true, false),

  ('admin'::app_role,           'sponsor-portal-config', true, true, true, true),
  ('sponsor_manager'::app_role, 'sponsor-portal-config', true, true, true, false),

  ('admin'::app_role,                  'timeline', true, true, true, true),
  ('website_editor'::app_role,         'timeline', true, true, true, false),
  ('programme_lead'::app_role,         'timeline', true, true, true, false),
  ('communications_officer'::app_role, 'timeline', true, true, true, false),

  ('admin'::app_role,                  'pages', true, true, true, true),
  ('website_editor'::app_role,         'pages', true, true, true, false),
  ('communications_officer'::app_role, 'pages', true, true, true, false),

  ('admin'::app_role,                  'forms', true, true, true, true),
  ('website_editor'::app_role,         'forms', true, true, true, false),
  ('communications_officer'::app_role, 'forms', true, true, true, false),

  ('admin'::app_role,             'marketplace', true, true, true, true),
  ('project_director'::app_role,  'marketplace', true, true, true, false),
  ('programme_lead'::app_role,    'marketplace', true, true, true, false),
  ('sponsor_manager'::app_role,   'marketplace', true, true, true, false),

  ('admin'::app_role,                  'parliament-tour', true, true, true, true),
  ('website_editor'::app_role,         'parliament-tour', true, true, true, false),
  ('communications_officer'::app_role, 'parliament-tour', true, true, true, false),

  ('media'::app_role, 'profile',  true, false, true,  false),
  ('media'::app_role, 'settings', true, false, false, false)
ON CONFLICT (role, module) DO UPDATE SET
  can_view   = EXCLUDED.can_view,
  can_create = EXCLUDED.can_create,
  can_edit   = EXCLUDED.can_edit,
  can_delete = EXCLUDED.can_delete;
