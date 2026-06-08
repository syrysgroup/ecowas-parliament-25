UPDATE public.site_settings
SET value = to_jsonb(btrim(value #>> '{}', '"'))
WHERE jsonb_typeof(value) = 'string'
  AND value #>> '{}' LIKE '"%"';