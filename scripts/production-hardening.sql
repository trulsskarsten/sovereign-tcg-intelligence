-- Production Security Hardening (Multi-Tenant RLS)
-- Ensures absolute data isolation between different Shopify merchants

-- 1. Enable RLS on all sensitive tables
ALTER TABLE shopify_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

-- 2. Create the "Tenant Context" Policy
-- We assume the 'store_id' in the database matches the 'sub' or a claim in the JWT
-- If using Service Role (Automation), RLS is bypassed.

-- Policy for shopify_variants
CREATE POLICY store_isolation_variants ON shopify_variants
FOR ALL TO authenticated
USING (store_id = (auth.jwt() ->> 'store_id')::UUID)
WITH CHECK (store_id = (auth.jwt() ->> 'store_id')::UUID);

-- Policy for inventory_snapshots
CREATE POLICY store_isolation_snapshots ON inventory_snapshots
FOR ALL TO authenticated
USING (store_id = (auth.jwt() ->> 'store_id')::UUID)
WITH CHECK (store_id = (auth.jwt() ->> 'store_id')::UUID);

-- Policy for store_settings
CREATE POLICY store_isolation_settings ON store_settings
FOR ALL TO authenticated
USING (id = (auth.jwt() ->> 'store_id')::UUID)
WITH CHECK (id = (auth.jwt() ->> 'store_id')::UUID);

-- 3. Automation Bypass (Internal Service Role)
-- Service role (used by our sync engines) defaults to bypassing RLS.

-- 4. Audit Log Lockdown (Append-only for users)
CREATE POLICY store_isolation_logs ON audit_logs
FOR SELECT TO authenticated
USING (store_id = (auth.jwt() ->> 'store_id')::UUID);

CREATE POLICY store_append_logs ON audit_logs
FOR INSERT TO authenticated
WITH CHECK (store_id = (auth.jwt() ->> 'store_id')::UUID);
