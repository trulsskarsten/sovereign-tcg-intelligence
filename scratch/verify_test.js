
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function checkFinalTest() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  console.log('--- SOVEREIGN TEST VERIFICATION ---');

  // 1. Check Stores
  const { data: stores, error: storeError } = await supabase
    .from('stores')
    .select('id, shop_domain, is_active, updated_at')
    .eq('shop_domain', 'pokemon-butikken-2.myshopify.com')
    .single();

  if (storeError) {
    console.error('Store Check Error:', storeError.message);
  } else {
    console.log('Store Status:', stores.is_active ? 'ACTIVE ✅' : 'INACTIVE ❌');
    console.log('Last Updated:', stores.updated_at);
  }

  // 2. Check Audit Logs
  const { data: logs, error: logError } = await supabase
    .from('audit_logs')
    .select('action, message, created_at')
    .eq('store_id', stores?.id)
    .order('created_at', { ascending: false })
    .limit(5);

  if (logError) {
    console.error('Audit Log Check Error:', logError.message);
  } else {
    console.log('\n--- Recent Activity ---');
    logs?.forEach(log => {
      console.log(`[${log.created_at}] ${log.action}: ${log.message}`);
    });
  }
}

checkFinalTest();
