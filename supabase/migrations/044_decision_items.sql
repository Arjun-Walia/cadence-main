-- Decision runs for the sales queue.
-- One run is a ranked list built from open deals. Each item cites the
-- records behind its reason. Status stays pending until a person
-- approves, skips, or snoozes it.

CREATE TABLE IF NOT EXISTS decision_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  summary TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS decision_runs_account_created_idx
  ON decision_runs (account_id, created_at DESC);

CREATE TABLE IF NOT EXISTS decision_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID NOT NULL REFERENCES decision_runs(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  rank INTEGER NOT NULL,
  score NUMERIC(6,2) NOT NULL,
  reason TEXT NOT NULL,
  citations JSONB NOT NULL DEFAULT '[]'::jsonb,
  snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'skipped', 'snoozed')),
  decided_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  decided_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS decision_items_run_rank_idx
  ON decision_items (run_id, rank);

ALTER TABLE decision_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE decision_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS decision_runs_select ON decision_runs;
CREATE POLICY decision_runs_select ON decision_runs
  FOR SELECT USING (is_account_member(account_id));

DROP POLICY IF EXISTS decision_runs_insert ON decision_runs;
CREATE POLICY decision_runs_insert ON decision_runs
  FOR INSERT WITH CHECK (is_account_member(account_id, 'agent'));

DROP POLICY IF EXISTS decision_items_select ON decision_items;
CREATE POLICY decision_items_select ON decision_items
  FOR SELECT USING (is_account_member(account_id));

DROP POLICY IF EXISTS decision_items_insert ON decision_items;
CREATE POLICY decision_items_insert ON decision_items
  FOR INSERT WITH CHECK (is_account_member(account_id, 'agent'));

DROP POLICY IF EXISTS decision_items_update ON decision_items;
CREATE POLICY decision_items_update ON decision_items
  FOR UPDATE USING (is_account_member(account_id, 'agent'));
