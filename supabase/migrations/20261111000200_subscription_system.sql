-- TAPLINK Subscription System
-- Initial plans and user subscriptions

CREATE TABLE public.subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  profile_limit integer,
  price_monthly numeric(10, 2) NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT subscription_plans_profile_limit_check
    CHECK (profile_limit IS NULL OR profile_limit > 0),
  CONSTRAINT subscription_plans_price_check
    CHECK (price_monthly >= 0)
);

INSERT INTO public.subscription_plans (slug, name, profile_limit, price_monthly)
VALUES
  ('free', 'Free', 1, 0),
  ('pro', 'Pro', 5, 0),
  ('business', 'Business', NULL, 0);

CREATE TABLE public.user_subscriptions (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id uuid NOT NULL REFERENCES public.subscription_plans(id),
  status text NOT NULL DEFAULT 'active',
  started_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT user_subscriptions_status_check
    CHECK (status IN ('active', 'canceled', 'expired'))
);

INSERT INTO public.user_subscriptions (user_id, plan_id)
SELECT
  u.id,
  p.id
FROM auth.users AS u
CROSS JOIN public.subscription_plans AS p
WHERE p.slug = 'free'
ON CONFLICT (user_id) DO NOTHING;

ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active subscription plans"
ON public.subscription_plans
FOR SELECT
TO anon, authenticated
USING (is_active = true);

CREATE POLICY "Users can view their own subscription"
ON public.user_subscriptions
FOR SELECT
TO authenticated
USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Admins can view all subscriptions"
ON public.user_subscriptions
FOR SELECT
TO authenticated
USING ((SELECT public.is_taplink_admin()));

REVOKE ALL ON public.subscription_plans FROM anon, authenticated;
GRANT SELECT ON public.subscription_plans TO anon, authenticated;

REVOKE ALL ON public.user_subscriptions FROM anon, authenticated;
GRANT SELECT ON public.user_subscriptions TO authenticated;

-- Automatically assign the Free plan to every new user.
CREATE OR REPLACE FUNCTION public.handle_new_user_subscription()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  free_plan_id uuid;
BEGIN
  SELECT id
  INTO free_plan_id
  FROM public.subscription_plans
  WHERE slug = 'free'
    AND is_active = true;

  IF free_plan_id IS NULL THEN
    RAISE EXCEPTION 'Active Free subscription plan not found';
  END IF;

  INSERT INTO public.user_subscriptions (user_id, plan_id)
  VALUES (NEW.id, free_plan_id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.handle_new_user_subscription() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER on_auth_user_created_subscription
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user_subscription();

-- Enforce subscription profile limits before creating a profile.
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

CREATE TRIGGER enforce_subscription_profile_limit_before_insert
BEFORE INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.enforce_subscription_profile_limit();


-- Allow verified admins to assign subscription plans to users.
CREATE OR REPLACE FUNCTION public.taplink_admin_set_user_plan(
  target_user_id uuid,
  target_plan_slug text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  selected_plan_id uuid;
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM private.taplink_admins
    WHERE user_id = (SELECT auth.uid())
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;

  IF target_plan_slug NOT IN ('free', 'pro', 'business') THEN
    RAISE EXCEPTION 'Invalid subscription plan';
  END IF;

  SELECT id
  INTO selected_plan_id
  FROM public.subscription_plans
  WHERE slug = target_plan_slug
    AND is_active = true;

  IF selected_plan_id IS NULL THEN
    RAISE EXCEPTION 'Subscription plan not found or inactive';
  END IF;

  INSERT INTO public.user_subscriptions (
    user_id,
    plan_id,
    status,
    started_at,
    expires_at,
    updated_at
  )
  VALUES (
    target_user_id,
    selected_plan_id,
    'active',
    now(),
    NULL,
    now()
  )
  ON CONFLICT (user_id)
  DO UPDATE SET
    plan_id = EXCLUDED.plan_id,
    status = 'active',
    started_at = now(),
    expires_at = NULL,
    updated_at = now();

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.taplink_admin_set_user_plan(uuid, text)
FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.taplink_admin_set_user_plan(uuid, text)
TO authenticated;
