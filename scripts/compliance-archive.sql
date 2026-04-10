-- 5-Year Compliance & Audit Archive
-- Implements Bokføringsloven (Primary Documentation) requirements

-- 1. Daily Aggregated Snapshots (Primary Audit Trail)
CREATE TABLE IF NOT EXISTS inventory_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL,
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_variants INTEGER NOT NULL,
  total_value_net DECIMAL(15,2) NOT NULL,
  total_value_gross DECIMAL(15,2) NOT NULL,
  avg_margin_pct DECIMAL(5,2),
  compliance_hash TEXT, -- For tamper-evidence (Future-proofing)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(store_id, snapshot_date)
);

-- 2. Audit Trail Indices
CREATE INDEX IF NOT EXISTS idx_snapshots_store_date ON inventory_snapshots(store_id, snapshot_date DESC);

-- 3. Retention Policy (5 Years = 1825 Days)
-- We use a stored procedure to allow for the 7-day "Watchdog" warning before deletion
CREATE OR REPLACE FUNCTION check_compliance_retention()
RETURNS TABLE (store_id UUID, days_until_purge INTEGER, data_period TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.store_id,
    (1825 - EXTRACT(DAY FROM (NOW() - s.created_at)))::INTEGER as days_until_purge,
    TO_CHAR(s.snapshot_date, 'YYYY-MM') as data_period
  FROM inventory_snapshots s
  WHERE s.created_at < NOW() - INTERVAL '1818 days' -- 7 days before 5 years
  GROUP BY s.store_id, days_until_purge, data_period;
END;
$$ LANGUAGE plpgsql;

-- 4. Automated Snapshot Generator
-- This would be triggered daily by pg_cron
CREATE OR REPLACE FUNCTION generate_daily_snapshot(target_store_id UUID)
RETURNS VOID AS $$
DECLARE
  v_count INTEGER;
  v_value_net DECIMAL;
  v_value_gross DECIMAL;
BEGIN
  SELECT 
    COUNT(*), 
    SUM(price), 
    SUM(price * 1.25)
  INTO v_count, v_value_net, v_value_gross
  FROM shopify_variants
  WHERE store_id = target_store_id;

  INSERT INTO inventory_snapshots (store_id, total_variants, total_value_net, total_value_gross)
  VALUES (target_store_id, v_count, COALESCE(v_value_net, 0), COALESCE(v_value_gross, 0))
  ON CONFLICT (store_id, snapshot_date) DO UPDATE SET
    total_variants = EXCLUDED.total_variants,
    total_value_net = EXCLUDED.total_value_net,
    total_value_gross = EXCLUDED.total_value_gross;
END;
$$ LANGUAGE plpgsql;
