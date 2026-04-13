-- Migration: Market Data Storage
-- Ensures market_prices exists with required indices for Phase 2 Intelligence

CREATE TABLE IF NOT EXISTS market_prices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sku TEXT NOT NULL,
  source TEXT NOT NULL, -- e.g., 'pokepris.no', 'cardmarket'
  price DECIMAL(15,2) NOT NULL,
  currency TEXT DEFAULT 'NOK',
  in_stock BOOLEAN DEFAULT TRUE,
  url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIMEZONE DEFAULT NOW()
);

-- Indices for fast price retrieval by SKU
CREATE INDEX IF NOT EXISTS idx_market_prices_sku ON market_prices(sku);
CREATE INDEX IF NOT EXISTS idx_market_prices_created_at ON market_prices(created_at DESC);

-- Enable RLS
ALTER TABLE market_prices ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users (admins) can see all market price history
CREATE POLICY "Admins can see market prices" 
ON market_prices FOR SELECT
USING (auth.role() = 'authenticated');
