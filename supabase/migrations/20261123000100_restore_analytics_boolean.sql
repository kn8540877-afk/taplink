BEGIN;

DROP FUNCTION IF EXISTS public.record_profile_analytics_event(text, text, text, text);

CREATE FUNCTION public.record_profile_analytics_event(
  p_profile_slug text,
  p_event_type text,
  p_event_target text,
  p_visitor_hash text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  v_profile_id uuid;
  v_last_event timestamptz;
  v_cooldown interval;
BEGIN
  IF p_event_type NOT IN ('profile_view', 'qr_scan', 'contact_click', 'social_click') THEN
    RETURN false;
  END IF;

  IF p_visitor_hash IS NULL OR p_visitor_hash !~ '^[0-9a-f]{64}$' THEN
    RETURN false;
  END IF;

  IF p_profile_slug IS NULL OR length(p_profile_slug) > 100 THEN
    RETURN false;
  END IF;

  IF p_event_target IS NOT NULL AND length(p_event_target) > 80 THEN
    RETURN false;
  END IF;

  SELECT p.id
  INTO v_profile_id
  FROM public.profiles AS p
  WHERE p.slug = p_profile_slug
    AND p.is_published = true
  LIMIT 1;

  IF v_profile_id IS NULL THEN
    RETURN false;
  END IF;

  v_cooldown := CASE
    WHEN p_event_type IN ('profile_view', 'qr_scan') THEN interval '30 minutes'
    ELSE interval '5 seconds'
  END;

  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(
      v_profile_id::text || ':' || p_event_type || ':' || p_visitor_hash,
      0
    )
  );

  SELECT pa.created_at
  INTO v_last_event
  FROM public.profile_analytics AS pa
  WHERE pa.profile_id = v_profile_id
    AND pa.event_type = p_event_type
    AND pa.visitor_hash = p_visitor_hash
  ORDER BY pa.created_at DESC
  LIMIT 1;

  IF v_last_event IS NOT NULL
     AND pg_catalog.now() - v_last_event < v_cooldown THEN
    RETURN false;
  END IF;

  INSERT INTO public.profile_analytics (
    profile_id,
    event_type,
    event_target,
    visitor_hash
  )
  VALUES (
    v_profile_id,
    p_event_type,
    NULLIF(pg_catalog.btrim(p_event_target), ''),
    p_visitor_hash
  );

  RETURN true;
END;
$function$;

REVOKE ALL ON FUNCTION public.record_profile_analytics_event(text, text, text, text)
FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.record_profile_analytics_event(text, text, text, text)
TO service_role;

COMMIT;
