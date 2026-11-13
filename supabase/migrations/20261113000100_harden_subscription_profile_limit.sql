-- Harden subscription profile limits against concurrent inserts.
-- Serialize profile creation per owner within the current transaction.

CREATE OR REPLACE FUNCTION public.enforce_subscription_profile_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  v_profile_limit integer;
  v_plan_slug text;
  v_current_count bigint;
BEGIN
  -- Prevent concurrent profile inserts for the same owner.
  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(NEW.owner_id::text, 0)
  );

  SELECT
    CASE
      WHEN us.status = 'active'
       AND (us.expires_at IS NULL OR us.expires_at > now())
      THEN sp.profile_limit
      ELSE 1
    END,
    CASE
      WHEN us.status = 'active'
       AND (us.expires_at IS NULL OR us.expires_at > now())
      THEN sp.slug
      ELSE 'free'
    END
  INTO v_profile_limit, v_plan_slug
  FROM public.user_subscriptions us
  JOIN public.subscription_plans sp ON sp.id = us.plan_id
  WHERE us.user_id = NEW.owner_id
    AND sp.is_active = true;

  IF NOT FOUND THEN
    SELECT profile_limit, slug
    INTO v_profile_limit, v_plan_slug
    FROM public.subscription_plans
    WHERE slug = 'free'
      AND is_active = true;
  END IF;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Subscription plan unavailable'
      USING ERRCODE = 'P0001';
  END IF;

  SELECT COUNT(*)
  INTO v_current_count
  FROM public.profiles
  WHERE owner_id = NEW.owner_id;

  IF v_profile_limit IS NOT NULL
     AND v_current_count >= v_profile_limit THEN
    RAISE EXCEPTION 'PROFILE_LIMIT_REACHED: Your % plan allows % profile(s). Upgrade your plan to create more profiles.',
      v_plan_slug, v_profile_limit
      USING ERRCODE = 'P0001';
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.enforce_subscription_profile_limit()
FROM PUBLIC, anon, authenticated;
