-- Payload schema migrations are disabled in production (PAYLOAD_DB_PUSH=false).
-- Keep the SQL change explicit and idempotent so the JSON field can be deployed safely.
ALTER TABLE public.ttt_payload_posts
  ADD COLUMN IF NOT EXISTS tags jsonb DEFAULT '[]'::jsonb;

ALTER TABLE public._ttt_payload_posts_v
  ADD COLUMN IF NOT EXISTS version_tags jsonb DEFAULT '[]'::jsonb;
