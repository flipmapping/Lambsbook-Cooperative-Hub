BEGIN;

CREATE TABLE meh.notification_credit_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_key text NOT NULL UNIQUE,
  monthly_allowance integer NOT NULL CHECK (monthly_allowance >= 0),
  credit_value_vnd numeric(18,2) NOT NULL CHECK (credit_value_vnd > 0),
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO meh.notification_credit_policies (
  policy_key,
  monthly_allowance,
  credit_value_vnd
)
VALUES ('free_member_notification', 100, 100)
ON CONFLICT (policy_key) DO NOTHING;


CREATE TABLE meh.notification_credit_entitlements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL REFERENCES meh.members(id) ON DELETE RESTRICT,
  policy_id uuid NOT NULL REFERENCES meh.notification_credit_policies(id) ON DELETE RESTRICT,
  period_start date NOT NULL,
  period_end date NOT NULL,
  granted_credits integer NOT NULL CHECK (granted_credits >= 0),
  consumed_credits integer NOT NULL DEFAULT 0 CHECK (consumed_credits >= 0),
  reserved_credits integer NOT NULL DEFAULT 0 CHECK (reserved_credits >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (period_end > period_start),
  CHECK (consumed_credits + reserved_credits <= granted_credits),
  UNIQUE (member_id, period_start)
);


CREATE TABLE meh.notification_credit_quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL REFERENCES meh.members(id) ON DELETE RESTRICT,
  entitlement_id uuid NOT NULL REFERENCES meh.notification_credit_entitlements(id) ON DELETE RESTRICT,
  requested_credits integer NOT NULL CHECK (requested_credits > 0),
  available_credits integer NOT NULL CHECK (available_credits >= 0),
  projected_balance integer NOT NULL CHECK (projected_balance >= 0),
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);


CREATE TABLE meh.notification_credit_reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id uuid NOT NULL REFERENCES meh.notification_credit_quotes(id) ON DELETE RESTRICT,
  member_id uuid NOT NULL REFERENCES meh.members(id) ON DELETE RESTRICT,
  entitlement_id uuid NOT NULL REFERENCES meh.notification_credit_entitlements(id) ON DELETE RESTRICT,
  reserved_credits integer NOT NULL CHECK (reserved_credits > 0),
  consumed_credits integer NOT NULL DEFAULT 0 CHECK (consumed_credits >= 0),
  released_credits integer NOT NULL DEFAULT 0 CHECK (released_credits >= 0),
  status text NOT NULL DEFAULT 'reserved'
    CHECK (status IN ('reserved', 'partially_consumed', 'consumed', 'released')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (consumed_credits + released_credits <= reserved_credits),
  UNIQUE (quote_id)
);


CREATE TABLE meh.notification_credit_consumptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id uuid NOT NULL REFERENCES meh.notification_credit_reservations(id) ON DELETE RESTRICT,
  member_id uuid NOT NULL REFERENCES meh.members(id) ON DELETE RESTRICT,
  credits integer NOT NULL CHECK (credits > 0),
  created_at timestamptz NOT NULL DEFAULT now()
);


CREATE INDEX notification_credit_entitlements_member_idx
  ON meh.notification_credit_entitlements(member_id, period_start);

CREATE INDEX notification_credit_reservations_member_idx
  ON meh.notification_credit_reservations(member_id, created_at);

CREATE INDEX notification_credit_consumptions_reservation_idx
  ON meh.notification_credit_consumptions(reservation_id);


ALTER TABLE meh.notification_credit_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE meh.notification_credit_entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE meh.notification_credit_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE meh.notification_credit_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE meh.notification_credit_consumptions ENABLE ROW LEVEL SECURITY;


CREATE POLICY notification_credit_policies_select
ON meh.notification_credit_policies
FOR SELECT TO authenticated
USING (active = true);

CREATE POLICY notification_credit_entitlements_select_own
ON meh.notification_credit_entitlements
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM meh.members m
    WHERE m.id = member_id AND m.user_id = auth.uid()
  )
);

CREATE POLICY notification_credit_quotes_select_own
ON meh.notification_credit_quotes
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM meh.members m
    WHERE m.id = member_id AND m.user_id = auth.uid()
  )
);

CREATE POLICY notification_credit_reservations_select_own
ON meh.notification_credit_reservations
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM meh.members m
    WHERE m.id = member_id AND m.user_id = auth.uid()
  )
);

CREATE POLICY notification_credit_consumptions_select_own
ON meh.notification_credit_consumptions
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM meh.members m
    WHERE m.id = member_id AND m.user_id = auth.uid()
  )
);


CREATE OR REPLACE FUNCTION meh.get_available_notification_credits(
  p_member_id uuid
)
RETURNS TABLE (
  member_id uuid,
  monthly_allowance integer,
  available_credits integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = meh, public
AS $$
DECLARE
  v_start date := date_trunc('month', current_date)::date;
  v_end date := (date_trunc('month', current_date) + interval '1 month')::date;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM meh.members m
    WHERE m.id = p_member_id AND m.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'member access denied';
  END IF;

  INSERT INTO meh.notification_credit_entitlements (
    member_id, policy_id, period_start, period_end, granted_credits
  )
  SELECT p_member_id, p.id, v_start, v_end, p.monthly_allowance
  FROM meh.notification_credit_policies p
  WHERE p.policy_key = 'free_member_notification'
    AND p.active = true
  ON CONFLICT ON CONSTRAINT notification_credit_entitlements_member_id_period_start_key
  DO NOTHING;

  RETURN QUERY
  SELECT
    e.member_id,
    e.granted_credits,
    e.granted_credits - e.consumed_credits - e.reserved_credits
  FROM meh.notification_credit_entitlements e
  WHERE e.member_id = p_member_id
    AND e.period_start = v_start
    AND e.period_end = v_end;
END;
$$;


CREATE OR REPLACE FUNCTION meh.quote_notification_credits(
  p_member_id uuid,
  p_requested_credits integer
)
RETURNS TABLE (
  quote_id uuid,
  member_id uuid,
  requested_credits integer,
  available_credits integer,
  projected_balance integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = meh, public
AS $$
DECLARE
  v_entitlement meh.notification_credit_entitlements%ROWTYPE;
  v_quote uuid;
  v_available integer;
BEGIN
  IF p_requested_credits <= 0 THEN
    RAISE EXCEPTION 'requested credits must be positive';
  END IF;

  PERFORM 1 FROM meh.get_available_notification_credits(p_member_id);

  SELECT e.*
  INTO v_entitlement
  FROM meh.notification_credit_entitlements AS e
  WHERE e.member_id = p_member_id
    AND e.period_start = date_trunc('month', current_date)::date
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'entitlement not found';
  END IF;

  v_available :=
    v_entitlement.granted_credits
    - v_entitlement.consumed_credits
    - v_entitlement.reserved_credits;

  IF p_requested_credits > v_available THEN
    RAISE EXCEPTION 'insufficient notification credit entitlement';
  END IF;

  v_quote := gen_random_uuid();

  INSERT INTO meh.notification_credit_quotes (
    id, member_id, entitlement_id, requested_credits,
    available_credits, projected_balance, expires_at
  )
  VALUES (
    v_quote, p_member_id, v_entitlement.id, p_requested_credits,
    v_available, v_available - p_requested_credits,
    now() + interval '10 minutes'
  );

  RETURN QUERY
  SELECT
    v_quote, p_member_id, p_requested_credits,
    v_available, v_available - p_requested_credits;
END;
$$;


CREATE OR REPLACE FUNCTION meh.reserve_notification_credits(
  p_member_id uuid,
  p_quote_id uuid,
  p_credits integer
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = meh, public
AS $$
DECLARE
  q meh.notification_credit_quotes%ROWTYPE;
  e meh.notification_credit_entitlements%ROWTYPE;
  r uuid;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM meh.members m
    WHERE m.id = p_member_id AND m.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'member access denied';
  END IF;

  IF p_credits <= 0 THEN
    RAISE EXCEPTION 'reservation credits must be positive';
  END IF;

  SELECT *
  INTO q
  FROM meh.notification_credit_quotes
  WHERE id = p_quote_id AND member_id = p_member_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'quote not found';
  END IF;

  IF q.expires_at <= now() THEN
    RAISE EXCEPTION 'quote expired';
  END IF;

  IF p_credits > q.requested_credits THEN
    RAISE EXCEPTION 'reservation exceeds quote';
  END IF;

  SELECT *
  INTO e
  FROM meh.notification_credit_entitlements
  WHERE id = q.entitlement_id AND member_id = p_member_id
  FOR UPDATE;

  IF e.consumed_credits + e.reserved_credits + p_credits > e.granted_credits THEN
    RAISE EXCEPTION 'insufficient entitlement';
  END IF;

  UPDATE meh.notification_credit_entitlements
  SET reserved_credits = reserved_credits + p_credits
  WHERE id = e.id;

  r := gen_random_uuid();

  INSERT INTO meh.notification_credit_reservations (
    id, quote_id, member_id, entitlement_id, reserved_credits
  )
  VALUES (r, p_quote_id, p_member_id, e.id, p_credits);

  RETURN r;
END;
$$;


CREATE OR REPLACE FUNCTION meh.release_notification_credits(
  p_reservation_id uuid,
  p_credits integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = meh, public
AS $$
DECLARE
  r meh.notification_credit_reservations%ROWTYPE;
  e meh.notification_credit_entitlements%ROWTYPE;
BEGIN
  SELECT *
  INTO r
  FROM meh.notification_credit_reservations
  WHERE id = p_reservation_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'reservation not found';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM meh.members m
    WHERE m.id = r.member_id AND m.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'member access denied';
  END IF;

  IF p_credits <= 0
     OR p_credits > r.reserved_credits - r.consumed_credits - r.released_credits
  THEN
    RAISE EXCEPTION 'invalid release amount';
  END IF;

  SELECT *
  INTO e
  FROM meh.notification_credit_entitlements
  WHERE id = r.entitlement_id AND member_id = r.member_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'entitlement not found';
  END IF;

  UPDATE meh.notification_credit_entitlements
  SET reserved_credits = reserved_credits - p_credits
  WHERE id = e.id;

  UPDATE meh.notification_credit_reservations
  SET
    released_credits = released_credits + p_credits,
    status = CASE
      WHEN consumed_credits + released_credits + p_credits = reserved_credits
        THEN 'released'
      ELSE 'partially_consumed'
    END,
    updated_at = now()
  WHERE id = r.id;
END;
$$;


CREATE OR REPLACE FUNCTION meh.consume_notification_credits(
  p_reservation_id uuid,
  p_actual_credits integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = meh, public
AS $$
DECLARE
  r meh.notification_credit_reservations%ROWTYPE;
  e meh.notification_credit_entitlements%ROWTYPE;
  remaining integer;
BEGIN
  SELECT *
  INTO r
  FROM meh.notification_credit_reservations
  WHERE id = p_reservation_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'reservation not found';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM meh.members m
    WHERE m.id = r.member_id AND m.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'member access denied';
  END IF;

  remaining :=
    r.reserved_credits - r.consumed_credits - r.released_credits;

  IF p_actual_credits <= 0 OR p_actual_credits > remaining THEN
    RAISE EXCEPTION 'invalid consumption amount';
  END IF;

  SELECT *
  INTO e
  FROM meh.notification_credit_entitlements
  WHERE id = r.entitlement_id AND member_id = r.member_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'entitlement not found';
  END IF;

  UPDATE meh.notification_credit_entitlements
  SET
    reserved_credits = reserved_credits - p_actual_credits,
    consumed_credits = consumed_credits + p_actual_credits
  WHERE id = e.id;

  INSERT INTO meh.notification_credit_consumptions (
    reservation_id, member_id, credits
  )
  VALUES (r.id, r.member_id, p_actual_credits);

  UPDATE meh.notification_credit_reservations
  SET
    consumed_credits = consumed_credits + p_actual_credits,
    status = CASE
      WHEN consumed_credits + p_actual_credits + released_credits = reserved_credits
        THEN 'consumed'
      ELSE 'partially_consumed'
    END,
    updated_at = now()
  WHERE id = r.id;
END;
$$;


REVOKE ALL ON FUNCTION meh.get_available_notification_credits(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION meh.quote_notification_credits(uuid, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION meh.reserve_notification_credits(uuid, uuid, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION meh.release_notification_credits(uuid, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION meh.consume_notification_credits(uuid, integer) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION meh.get_available_notification_credits(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION meh.quote_notification_credits(uuid, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION meh.reserve_notification_credits(uuid, uuid, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION meh.release_notification_credits(uuid, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION meh.consume_notification_credits(uuid, integer) TO authenticated;

COMMIT;
