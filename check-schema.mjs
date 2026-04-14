import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing Supabase environment variables in .env.local");
  process.exit(1);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkSchema() {
  const tables = ['stores', 'inventory', 'staged_updates', 'audit_logs', 'price_history'];
  
  console.log("--- SCHEMA CHECK ---");
  
  for (const table of tables) {
    try {
      const { _data, error } = await supabase
        .from(table)
        .select('count')
        .limit(1);
        
      if (error) {
        console.log(`❌ Table '${table}' ERROR: ${error.message}`);
      } else {
        console.log(`✅ Table '${table}' exists.`);
      }
    } catch (err) {
      console.log(`❌ Table '${table}' CRASH: ${err.message}`);
    }
  }

  console.log("\n--- COLUMN CHECK (inventory) ---");
  const columnsToCheck = [
    'abc_class', 'health_status', 'last_price_check_at', 'market_price_net', 'barcode', 'brand', 'category',
    'gtin', 'set_code', 'card_number', 'language', 'product_category', 'metadata_health_status', 'performance_data'
  ];

  for (const col of columnsToCheck) {
    try {
      const { error } = await supabase.from('inventory').select(col).limit(1);
      if (error) {
        console.log(`❌ Column '${col}' missing.`);
      } else {
        console.log(`✅ Column '${col}' exists.`);
      }
    } catch (err) {
      console.log(`❌ Column '${col}' CRASH: ${err.message}`);
    }
  }
}

checkSchema();
