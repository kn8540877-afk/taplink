-- Align admin user profile count return type with production.

CREATE OR REPLACE FUNCTION public.taplink_admin_users()
RETURNS TABLE (
  user_id uuid,
  email text,
  created_at timestamptz,
  profile_count bigint
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
    u.id AS user_id,
    u.email::text AS email,
    u.created_at,
    count(p.id)::bigint AS profile_count
  FROM auth.users u
  LEFT JOIN public.profiles p ON p.owner_id = u.id
  GROUP BY u.id, u.email, u.created_at
  ORDER BY u.created_at DESC;
END;
$function$;

REVOKE ALL ON FUNCTION public.taplink_admin_users()
FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.taplink_admin_users()
TO authenticated, service_role;
