-- Restore TAPLINK admin membership schema and authorization function.

CREATE SCHEMA IF NOT EXISTS private;

CREATE TABLE IF NOT EXISTS private.taplink_admins (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE private.taplink_admins ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE private.taplink_admins FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.is_taplink_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM private.taplink_admins AS a
    WHERE a.user_id = (SELECT auth.uid())
  );
$function$;

REVOKE ALL ON FUNCTION public.is_taplink_admin()
FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.is_taplink_admin()
TO authenticated, service_role;
