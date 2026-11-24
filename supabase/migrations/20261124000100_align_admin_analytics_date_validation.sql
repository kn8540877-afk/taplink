BEGIN;

CREATE OR REPLACE FUNCTION public.taplink_admin_analytics(
  p_start_date timestamptz DEFAULT now() - interval '30 days',
  p_end_date timestamptz DEFAULT now()
)
RETURNS TABLE (
  total_views bigint,
  total_qr_scans bigint,
  total_contact_clicks bigint,
  total_social_clicks bigint,
  total_events bigint
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

  IF p_start_date IS NULL
     OR p_end_date IS NULL
     OR p_start_date >= p_end_date THEN
    RAISE EXCEPTION 'Invalid date range';
  END IF;

  RETURN QUERY
  SELECT
    count(*) FILTER (WHERE pa.event_type = 'profile_view'),
    count(*) FILTER (WHERE pa.event_type = 'qr_scan'),
    count(*) FILTER (WHERE pa.event_type = 'contact_click'),
    count(*) FILTER (WHERE pa.event_type = 'social_click'),
    count(*)
  FROM public.profile_analytics pa
  WHERE pa.created_at >= p_start_date
    AND pa.created_at <= p_end_date;
END;
$function$;

COMMIT;
