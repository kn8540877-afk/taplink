CREATE OR REPLACE FUNCTION public.taplink_admin_daily_trends(
  p_start_date timestamptz,
  p_end_date timestamptz
)
RETURNS TABLE (
  trend_date date,
  total_views bigint,
  total_qr_scans bigint,
  total_contact_clicks bigint,
  total_social_clicks bigint
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM private.taplink_admins a
    WHERE a.user_id = (SELECT auth.uid())
  ) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  IF p_start_date IS NULL
     OR p_end_date IS NULL
     OR p_start_date >= p_end_date
     OR p_end_date > now() + interval '1 day' THEN
    RAISE EXCEPTION 'Invalid date range';
  END IF;

  RETURN QUERY
  WITH days AS (
    SELECT generate_series(
      (p_start_date AT TIME ZONE 'UTC')::date,
      ((p_end_date - interval '1 microsecond') AT TIME ZONE 'UTC')::date,
      interval '1 day'
    )::date AS day
  ),
  event_counts AS (
    SELECT
      (pa.created_at AT TIME ZONE 'UTC')::date AS day,
      count(*) FILTER (WHERE pa.event_type = 'profile_view') AS views,
      count(*) FILTER (WHERE pa.event_type = 'qr_scan') AS qr_scans,
      count(*) FILTER (WHERE pa.event_type = 'contact_click') AS contact_clicks,
      count(*) FILTER (WHERE pa.event_type = 'social_click') AS social_clicks
    FROM public.profile_analytics pa
    WHERE pa.created_at >= p_start_date
      AND pa.created_at < p_end_date
    GROUP BY (pa.created_at AT TIME ZONE 'UTC')::date
  )
  SELECT
    d.day,
    coalesce(ec.views, 0),
    coalesce(ec.qr_scans, 0),
    coalesce(ec.contact_clicks, 0),
    coalesce(ec.social_clicks, 0)
  FROM days d
  LEFT JOIN event_counts ec ON ec.day = d.day
  ORDER BY d.day;
END;
$function$;

REVOKE ALL ON FUNCTION public.taplink_admin_daily_trends(timestamptz, timestamptz)
FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.taplink_admin_daily_trends(timestamptz, timestamptz)
TO authenticated;


CREATE OR REPLACE FUNCTION public.taplink_admin_top_profiles(
  p_start_date timestamptz,
  p_end_date timestamptz,
  p_limit integer DEFAULT 10
)
RETURNS TABLE (
  profile_id uuid,
  profile_name text,
  slug text,
  profile_type text,
  total_views bigint,
  total_qr_scans bigint,
  total_events bigint
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM private.taplink_admins a
    WHERE a.user_id = (SELECT auth.uid())
  ) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  IF p_start_date IS NULL
     OR p_end_date IS NULL
     OR p_start_date >= p_end_date
     OR p_end_date > now() + interval '1 day'
     OR p_limit IS NULL
     OR p_limit < 1
     OR p_limit > 50 THEN
    RAISE EXCEPTION 'Invalid parameters';
  END IF;

  RETURN QUERY
  SELECT
    p.id,
    p.name::text,
    p.slug::text,
    p.profile_type::text,
    count(pa.id) FILTER (WHERE pa.event_type = 'profile_view'),
    count(pa.id) FILTER (WHERE pa.event_type = 'qr_scan'),
    count(pa.id)
  FROM public.profiles p
  LEFT JOIN public.profile_analytics pa
    ON pa.profile_id = p.id
    AND pa.created_at >= p_start_date
    AND pa.created_at < p_end_date
  GROUP BY p.id, p.name, p.slug, p.profile_type
  HAVING count(pa.id) > 0
  ORDER BY
    count(pa.id) FILTER (WHERE pa.event_type = 'profile_view') DESC,
    count(pa.id) FILTER (WHERE pa.event_type = 'qr_scan') DESC,
    count(pa.id) DESC
  LIMIT p_limit;
END;
$function$;

REVOKE ALL ON FUNCTION public.taplink_admin_top_profiles(timestamptz, timestamptz, integer)
FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.taplink_admin_top_profiles(timestamptz, timestamptz, integer)
TO authenticated;

