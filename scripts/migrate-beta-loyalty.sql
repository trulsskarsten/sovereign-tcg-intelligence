-- Migration: Beta Loyalty & Tax Identity
-- Adds enrollment tracking and tax mode for B2B merchants.

ALTER TABLE stores
ADD COLUMN IF NOT EXISTS beta_enrolled_at TIMESTAMP WITH TIMEZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS tax_mode TEXT DEFAULT 'private'; -- 'private' | 'business'

COMMENT ON COLUMN stores.beta_enrolled_at IS 'Logs the date the merchant joined the beta for future grace-period logic.';
COMMENT ON COLUMN stores.tax_mode IS 'Determines if ROI is calculated Gross (Private) or Net (Business/MVA-registered).';
