-- Migration: Add widget_layout to stores
-- Enables persistence of dashboard bento layout per store

ALTER TABLE stores 
ADD COLUMN IF NOT EXISTS widget_layout JSONB DEFAULT '{}'::jsonb;

-- Update RLS if necessary (stores table should already have isolation)
