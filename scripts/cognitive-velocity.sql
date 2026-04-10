-- Cognitive Velocity & ABC Classification
-- Enhances the variants table for weighted value distribution

-- 1. Add Classification Columns
ALTER TABLE shopify_variants 
ADD COLUMN IF NOT EXISTS abc_class CHAR(1) DEFAULT 'C',
ADD COLUMN IF NOT EXISTS is_immortal BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS last_sold_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS weighted_value DECIMAL(15,2) GENERATED ALWAYS AS (price * inventory_quantity) STORED;

-- 2. Indices for Fast Distribution Calculation
CREATE INDEX IF NOT EXISTS idx_variants_weighted_value ON shopify_variants(weighted_value DESC);
CREATE INDEX IF NOT EXISTS idx_variants_abc_class ON shopify_variants(abc_class);

-- 3. Stored Procedure: Update ABC Percentiles
-- Logic: Top 10% (by weighted value) = A, Next 20% = B, Rest = C
CREATE OR REPLACE FUNCTION update_inventory_abc_classes()
RETURNS VOID AS $$
DECLARE
  v_total_rows INTEGER;
  v_a_limit INTEGER;
  v_b_limit INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_total_rows FROM shopify_variants;
  
  IF v_total_rows = 0 THEN RETURN; END IF;

  v_a_limit := (v_total_rows * 0.10);
  v_b_limit := (v_total_rows * 0.30); -- Cumulative 10% + 20%

  -- Class A: Top 10%
  UPDATE shopify_variants
  SET abc_class = 'A'
  WHERE id IN (
    SELECT id FROM shopify_variants ORDER BY weighted_value DESC LIMIT v_a_limit
  );

  -- Class B: Next 20%
  UPDATE shopify_variants
  SET abc_class = 'B'
  WHERE abc_class != 'A' AND id IN (
    SELECT id FROM shopify_variants ORDER BY weighted_value DESC LIMIT v_b_limit
  );

  -- Class C: The rest
  UPDATE shopify_variants
  SET abc_class = 'C'
  WHERE abc_class NOT IN ('A', 'B');
  
  -- Apply Immortal Override
  -- Items manually marked as immortal are effectively treated as Class A regardless of value
  UPDATE shopify_variants
  SET abc_class = 'A'
  WHERE is_immortal = TRUE;

END;
$$ LANGUAGE plpgsql;
