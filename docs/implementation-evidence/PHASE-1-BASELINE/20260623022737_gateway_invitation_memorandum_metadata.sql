ALTER TABLE public.gateway_invitations
ADD COLUMN IF NOT EXISTS invited_email text,
ADD COLUMN IF NOT EXISTS phone_number text,
ADD COLUMN IF NOT EXISTS note text;
