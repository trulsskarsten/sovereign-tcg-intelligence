-- Sovereign Audit Trail Migration --
-- Enables deep accountability and historical price tracking --

-- 1. Price History Table --
-- Stores every single price shift for all products --
CREATE TABLE IF NOT EXISTS public.price_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    variant_id TEXT NOT NULL,
    old_price_net DECIMAL(15, 2),
    new_price_net DECIMAL(15, 2) NOT NULL,
    old_price_gross DECIMAL(15, 2),
    new_price_gross DECIMAL(15, 2) NOT NULL,
    source TEXT NOT NULL, -- 'system', 'manual', 'bulk'
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Index for fast history rendering in the UI --
CREATE INDEX IF NOT EXISTS idx_price_history_variant_id ON public.price_history(variant_id);
CREATE INDEX IF NOT EXISTS idx_price_history_created_at ON public.price_history(created_at DESC);

-- 2. Audit Logs Table --
-- Tracks critical system events and user actions --
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL, -- 'auth', 'sync', 'settings_change', 'security_breach'
    severity TEXT DEFAULT 'info', -- 'info', 'warning', 'critical'
    description TEXT,
    payload JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type ON public.audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- 3. Extend Inventory Table --
-- Add ABC classification and health metrics if not exists --
ALTER TABLE public.inventory 
ADD COLUMN IF NOT EXISTS abc_class TEXT DEFAULT 'C' CHECK (abc_class IN ('A', 'B', 'C')),
ADD COLUMN IF NOT EXISTS health_status TEXT DEFAULT 'healthy',
ADD COLUMN IF NOT EXISTS last_price_check_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS market_price_net DECIMAL(15, 2),
ADD COLUMN IF NOT EXISTS barcode TEXT,
ADD COLUMN IF NOT EXISTS brand TEXT DEFAULT 'Ukjent',
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'TCG';

-- RLS (Row Level Security) --
ALTER TABLE public.price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Simple policy for the app user --
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'price_history' AND policyname = 'Allow authenticated read'
    ) THEN
        CREATE POLICY "Allow authenticated read" ON public.price_history FOR SELECT TO authenticated USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'audit_logs' AND policyname = 'Allow service_role full access'
    ) THEN
        CREATE POLICY "Allow service_role full access" ON public.audit_logs FOR ALL TO service_role USING (true);
    END IF;
END $$;
