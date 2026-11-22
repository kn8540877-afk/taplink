CREATE SCHEMA IF NOT EXISTS private;

CREATE TABLE private.taplink_admins (
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

REVOKE ALL ON FUNCTION public.is_taplink_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_taplink_admin() TO authenticated, service_role;


CREATE TABLE public.profiles (
  id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_type text DEFAULT 'personal' NOT NULL,
  slug text NOT NULL UNIQUE,
  name text DEFAULT '' NOT NULL,
  role text,
  bio text,
  photo_url text,
  phone text,
  alternate_phone text,
  email text,
  location text,
  website text,
  is_published boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT profiles_profile_type_check
    CHECK (profile_type IN ('personal', 'business')),
  CONSTRAINT profiles_slug_check
    CHECK (
      slug = lower(slug)
      AND slug ~ '^[a-z0-9]+([a-z0-9-]*[a-z0-9])?$'
    )
);

CREATE INDEX profiles_owner_id_idx ON public.profiles(owner_id);


CREATE TABLE public.profile_socials (
  id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  platform text NOT NULL,
  url text NOT NULL,
  sort_order integer DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT profile_socials_profile_id_platform_key UNIQUE (profile_id, platform)
);

CREATE INDEX profile_socials_profile_id_idx
  ON public.profile_socials(profile_id);


CREATE TABLE public.profile_analytics (
  id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  event_target text,
  created_at timestamptz DEFAULT now() NOT NULL,
  visitor_hash text,
  CONSTRAINT profile_analytics_event_type_check
    CHECK (event_type IN ('profile_view', 'qr_scan', 'contact_click', 'social_click'))
);

CREATE INDEX idx_profile_analytics_event_type
  ON public.profile_analytics(event_type);

CREATE INDEX idx_profile_analytics_profile_created
  ON public.profile_analytics(profile_id, created_at DESC);

CREATE INDEX idx_profile_analytics_visitor
  ON public.profile_analytics(visitor_hash);


ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_socials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_analytics ENABLE ROW LEVEL SECURITY;


CREATE POLICY "Owners can create profiles"
ON public.profiles FOR INSERT TO authenticated
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can delete their profiles"
ON public.profiles FOR DELETE TO authenticated
USING (auth.uid() = owner_id);

CREATE POLICY "Owners can update their profiles"
ON public.profiles FOR UPDATE TO authenticated
USING (auth.uid() = owner_id)
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can view their profiles"
ON public.profiles FOR SELECT TO authenticated
USING (auth.uid() = owner_id);

CREATE POLICY "Public can view published profiles"
ON public.profiles FOR SELECT TO anon, authenticated
USING (is_published = true);


CREATE POLICY "Owners can add socials to their profiles"
ON public.profile_socials FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = profile_socials.profile_id
      AND p.owner_id = auth.uid()
  )
);

CREATE POLICY "Owners can delete socials from their profiles"
ON public.profile_socials FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = profile_socials.profile_id
      AND p.owner_id = auth.uid()
  )
);

CREATE POLICY "Owners can update socials on their profiles"
ON public.profile_socials FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = profile_socials.profile_id
      AND p.owner_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = profile_socials.profile_id
      AND p.owner_id = auth.uid()
  )
);

CREATE POLICY "Owners can view socials for their profiles"
ON public.profile_socials FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = profile_socials.profile_id
      AND p.owner_id = auth.uid()
  )
);

CREATE POLICY "Public can view socials for published profiles"
ON public.profile_socials FOR SELECT TO anon, authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = profile_socials.profile_id
      AND p.is_published = true
  )
);


CREATE POLICY "Owners can view their profile analytics"
ON public.profile_analytics FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = profile_analytics.profile_id
      AND p.owner_id = auth.uid()
  )
);


GRANT ALL ON TABLE public.profiles TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.profile_socials TO anon, authenticated, service_role;
GRANT SELECT ON TABLE public.profile_analytics TO authenticated;
GRANT ALL ON TABLE public.profile_analytics TO service_role;


CREATE OR REPLACE FUNCTION public.record_profile_analytics_event(
  p_profile_slug text,
  p_event_type text,
  p_event_target text,
  p_visitor_hash text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  v_profile_id uuid;
  v_cooldown interval;
BEGIN
  IF p_event_type NOT IN ('profile_view', 'qr_scan', 'contact_click', 'social_click') THEN
    RAISE EXCEPTION 'Invalid analytics event type';
  END IF;

  IF p_visitor_hash IS NULL OR p_visitor_hash !~ '^[0-9a-f]{64}$' THEN
    RAISE EXCEPTION 'Invalid visitor hash';
  END IF;

  IF p_profile_slug IS NULL OR length(p_profile_slug) > 100 THEN
    RAISE EXCEPTION 'Invalid profile slug';
  END IF;

  IF p_event_target IS NOT NULL AND length(p_event_target) > 80 THEN
    RAISE EXCEPTION 'Invalid event target';
  END IF;

  SELECT p.id
  INTO v_profile_id
  FROM public.profiles AS p
  WHERE p.slug = p_profile_slug
    AND p.is_published = true
  LIMIT 1;

  IF v_profile_id IS NULL THEN
    RETURN;
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

  IF EXISTS (
    SELECT 1
    FROM public.profile_analytics AS pa
    WHERE pa.profile_id = v_profile_id
      AND pa.event_type = p_event_type
      AND pa.visitor_hash = p_visitor_hash
      AND pa.created_at > now() - v_cooldown
  ) THEN
    RETURN;
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
    p_event_target,
    p_visitor_hash
  );
END;
$function$;

REVOKE ALL ON FUNCTION public.record_profile_analytics_event(text, text, text, text)
FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_profile_analytics_event(text, text, text, text)
TO service_role;


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

  IF p_start_date IS NULL OR p_end_date IS NULL OR p_start_date > p_end_date THEN
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


CREATE OR REPLACE FUNCTION public.taplink_admin_overview()
RETURNS TABLE (
  total_users bigint,
  total_profiles bigint,
  published_profiles bigint,
  draft_profiles bigint
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
    (SELECT count(*) FROM auth.users),
    (SELECT count(*) FROM public.profiles),
    (SELECT count(*) FROM public.profiles WHERE is_published = true),
    (SELECT count(*) FROM public.profiles WHERE is_published = false);
END;
$function$;


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
  JOIN auth.users u ON u.id = p.owner_id
  ORDER BY p.created_at DESC;
END;
$function$;


CREATE OR REPLACE FUNCTION public.taplink_admin_set_profile_published(
  target_profile_id uuid,
  publish_status boolean
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  IF NOT public.is_taplink_admin() THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  UPDATE public.profiles
  SET is_published = publish_status,
      updated_at = now()
  WHERE id = target_profile_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found';
  END IF;

  RETURN true;
END;
$function$;


CREATE OR REPLACE FUNCTION public.taplink_admin_user_profiles(
  target_user_id uuid
)
RETURNS TABLE (
  profile_id uuid,
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
    p.name,
    p.profile_type,
    p.slug,
    p.is_published,
    p.created_at
  FROM public.profiles p
  WHERE p.owner_id = target_user_id
  ORDER BY p.created_at DESC;
END;
$function$;


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
    u.id,
    u.email::text,
    u.created_at,
    count(p.id)
  FROM auth.users u
  LEFT JOIN public.profiles p ON p.owner_id = u.id
  GROUP BY u.id, u.email, u.created_at
  ORDER BY u.created_at DESC;
END;
$function$;


REVOKE ALL ON FUNCTION public.taplink_admin_analytics(timestamptz, timestamptz) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.taplink_admin_overview() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.taplink_admin_profiles() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.taplink_admin_set_profile_published(uuid, boolean) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.taplink_admin_user_profiles(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.taplink_admin_users() FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.taplink_admin_analytics(timestamptz, timestamptz) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.taplink_admin_overview() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.taplink_admin_profiles() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.taplink_admin_set_profile_published(uuid, boolean) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.taplink_admin_user_profiles(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.taplink_admin_users() TO authenticated, service_role;