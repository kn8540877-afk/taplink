-- Align admin profile listing with production.
-- Preserve profiles even when the related auth user is unavailable.

CREATE OR REPLACE FUNCTION public.taplink_admin_profiles()
RETURNS TABLE (
  profile_id uuid,
  owner_email text,
  profile_name text,
  profile_type text,
  slug text,
  is_published boolean,
  created_at timestamptz
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  IF NOT public.is_taplink_admin() THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  RETURN QUERY
  SELECT
    p.id,
    u.email::text,
    p.name,
    p.profile_type,
    p.slug,
    p.is_published,
    p.created_at
  FROM public.profiles p
  LEFT JOIN auth.users u ON u.id = p.owner_id
  ORDER BY p.created_at DESC;
END;
$function$;

REVOKE ALL ON FUNCTION public.taplink_admin_profiles()
FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.taplink_admin_profiles()
TO authenticated, service_role;
