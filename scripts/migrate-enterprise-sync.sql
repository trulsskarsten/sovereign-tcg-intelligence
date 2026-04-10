-- Migration: Enterprise Sync, Staging & Precise Identification
-- Adds columns for TCG identification, ROI tracking, and staging area.

-- 1. Inventory Extensions
ALTER TABLE inventory 
ADD COLUMN IF NOT EXISTS gtin TEXT, -- EAN/Barcode
ADD COLUMN IF NOT EXISTS set_code TEXT, -- e.g., SV4A
ADD COLUMN IF NOT EXISTS card_number TEXT, -- e.g., 123/190
ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'English',
ADD COLUMN IF NOT EXISTS product_category TEXT DEFAULT 'Sealed', -- Sealed vs Single
ADD COLUMN IF NOT EXISTS metadata_health_status TEXT DEFAULT 'Healthy',
ADD COLUMN IF NOT EXISTS performance_data JSONB DEFAULT '{}'::jsonb; -- ROI data

-- 2. Staging Area (Soft-Staging)
CREATE TABLE IF NOT EXISTS staged_updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL, -- Shopify Product ID
  field_name TEXT NOT NULL, -- e.g., 'title', 'price', 'metafield.set_name'
  original_value TEXT,
  suggested_value TEXT,
  reason TEXT, -- e.g., 'Google SEO Standard', 'Market Price Drop'
  status TEXT DEFAULT 'pending', -- pending, pushed, ignored
  created_at TIMESTAMP WITH TIMEZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIMEZONE DEFAULT NOW()
);

-- 3. Store Performance & Flags
ALTER TABLE stores
ADD COLUMN IF NOT EXISTS beta_flags JSONB DEFAULT '{"autopilot": false, "seo_auto": false, "show_sealed_only": true}'::jsonb,
ADD COLUMN IF NOT EXISTS auto_fix_metadata BOOLEAN DEFAULT false;

-- Enable RLS for the new table
ALTER TABLE staged_updates ENABLE ROW LEVEL SECURITY;

-- Policy: Stores can only see their own staged updates
CREATE POLICY "Stores can see their own staged updates" 
ON staged_updates FOR ALL 
USING (store_id IN (SELECT id FROM stores));

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_staged_updates_updated_at
BEFORE UPDATE ON staged_updates
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
