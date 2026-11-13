-- TAPLINK Subscription History and Admin Audit Log

CREATE TABLE public.subscription_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  old_plan_id uuid REFERENCES public.subscription_plans(id) ON DELETE SET NULL,
  new_plan_id uuid NOT NULL REFERENCES public.subscription_plans(id) ON DELETE RESTRICT,
  changed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  old_status text,
  new_status text NOT NULL,
  old_expires_at timestamptz,
  new_expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX subscription_history_user_created_idx
ON public.subscription_history (user_id, created_at DESC);

CREATE INDEX subscription_history_created_idx
ON public.subscription_history (created_at DESC);

ALTER TABLE public.subscription_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscription history"
ON public.subscription_history
FOR SELECT
TO authenticated
USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Admins can view all subscription history"
ON public.subscription_history
FOR SELECT
TO authenticated
USING ((SELECT public.is_taplink_admin()));

REVOKE ALL ON public.subscription_history FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.subscription_history TO authenticated;


-- Record every admin-managed subscription plan change atomically.
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
  previous_plan_id uuid;
  previous_status text;
  previous_expires_at timestamptz;
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

  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(target_user_id::text, 1)
  );

  SELECT plan_id, status, expires_at
  INTO previous_plan_id, previous_status, previous_expires_at
  FROM public.user_subscriptions
  WHERE user_id = target_user_id
  FOR UPDATE;

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

  INSERT INTO public.subscription_history (
    user_id,
    old_plan_id,
    new_plan_id,
    changed_by,
    old_status,
    new_status,
    old_expires_at,
    new_expires_at
  )
  VALUES (
    target_user_id,
    previous_plan_id,
    selected_plan_id,
    (SELECT auth.uid()),
    previous_status,
    'active',
    previous_expires_at,
    NULL
  );

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.taplink_admin_set_user_plan(uuid, text)
FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.taplink_admin_set_user_plan(uuid, text)
TO authenticated;
