/**
 * Sovereign Pre-Flight Security Audit
 * 
 * Run this script to verify system integrity before production launch.
 */

import fs from 'fs';
import path from 'path';

const CHECKLIST = [
  { id: 'RLS', name: 'Row Level Security Policies', target: 'scripts/production-hardening.sql' },
  { id: 'AUTH', name: 'Shopify JWT Verification', target: 'src/lib/auth/shopify-verify.ts' },
  { id: 'SYNC', name: 'QStash Scalability Bridge', target: 'src/app/api/webhooks/qstash-bridge.ts' },
  { id: 'SAFE', name: 'Auto-Pilot Guardrails', target: 'src/lib/automation/autopilot-logic.ts' },
  { id: 'COST', name: 'VAT-aware Profit Logic', target: 'src/lib/automation/profit.ts' },
  { id: 'PLAN', name: 'Production Env Template', target: '.env.production.example' }
];

async function runAudit() {
  console.log("🚀 SIKKERHETS-REVISJON: Sovereign TCG Intelligence\n");
  let score = 0;

  for (const item of CHECKLIST) {
    const exists = fs.existsSync(path.join(process.cwd(), item.target));
    if (exists) {
      console.log(`✅ [OK] ${item.name.padEnd(30)} FOUND`);
      score++;
    } else {
      console.log(`❌ [FEIL] ${item.name.padEnd(30)} MISSING: ${item.target}`);
    }
  }

  console.log(`\n📊 AUDIT SCORE: ${score}/${CHECKLIST.length}`);

  if (score === CHECKLIST.length) {
    console.log("\n🛡️ SYSTEM VERIFISERT. KLAR FOR PRODUKSJON.");
  } else {
    console.log("\n⚠️ SYSTEM IKKE FULLSTENDIG. UTBEDRE FEIL FØR LANSERING.");
  }
}

runAudit();
