ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;

-- Trigger (ako želiš da se updated_at menja)
CREATE OR REPLACE FUNCTION user_set_timestamp()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_set_timestamp ON public.users;
CREATE TRIGGER trg_users_set_timestamp
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE PROCEDURE user_set_timestamp();