-- Allow DeepSeek, Groq, and Gemini alongside OpenAI and Anthropic.
-- Both ai_configs and ai_usage_log constrain provider with a CHECK;
-- drop whichever name Postgres assigned and replace it.

DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT rel.relname AS table_name, con.conname AS constraint_name
    FROM pg_constraint con
    JOIN pg_class rel ON rel.oid = con.conrelid
    JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
    WHERE nsp.nspname = 'public'
      AND rel.relname IN ('ai_configs', 'ai_usage_log')
      AND con.contype = 'c'
      AND pg_get_constraintdef(con.oid) ILIKE '%provider%'
  LOOP
    EXECUTE format(
      'ALTER TABLE %I DROP CONSTRAINT %I',
      r.table_name,
      r.constraint_name
    );
  END LOOP;
END $$;

ALTER TABLE ai_configs
  ADD CONSTRAINT ai_configs_provider_check
  CHECK (provider IN ('openai', 'anthropic', 'deepseek', 'groq', 'gemini'));

ALTER TABLE ai_usage_log
  ADD CONSTRAINT ai_usage_log_provider_check
  CHECK (provider IN ('openai', 'anthropic', 'deepseek', 'groq', 'gemini'));
