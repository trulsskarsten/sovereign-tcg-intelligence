"use client";

import DashboardShell from "@/components/DashboardShell";
import { 
  Key, 
  ShoppingBag, 
  Database, 
  MessageSquare,
  Copy,
  CheckCircle2,
  ExternalLink,
  ShieldAlert
} from "lucide-react";
import { useState } from "react";

export default function SetupPage() {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <DashboardShell>
      <div className="max-w-4xl mx-auto py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[#202223]">Oppsett & Konfigurasjon</h2>
          <p className="text-[#6d7175] mt-1">Fullfør disse stegene for å koble ditt TCG-økosystem sammen.</p>
        </div>

        <div className="space-y-6">
          {/* Shopify Setup */}
          <div className="polaris-card bg-white p-8">
            <div className="flex items-center mb-6">
              <div className="p-3 bg-blue-50 rounded-lg mr-4">
                <ShoppingBag className="h-6 w-6 text-[#005bd3]" />
              </div>
              <h3 className="text-lg font-bold text-[#202223]">1. Shopify Admin API</h3>
            </div>
            <div className="space-y-4 text-sm text-[#6d7175] leading-relaxed">
              <p>Opprett en Custom App i Shopify for å gi dette dashbordet tilgang:</p>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>Gå til <strong>Innstillinger &gt; Apper og salgskanaler &gt; Utvikle apper</strong>.</li>
                <li>Klikk <strong>Opprett en app</strong> og kall den "TCG Ops".</li>
                <li>Under <strong>Konfigurasjon</strong>, gi <code>write_products</code> og <code>write_inventory</code> rettigheter.</li>
                <li>Kopier din <strong>Admin API access token</strong> (starter med <code>shpat_</code>).</li>
              </ol>
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-md flex items-start mt-4">
                <ShieldAlert className="h-5 w-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" />
                <p className="text-xs text-amber-800">
                  <strong>Er butikken passordbeskyttet?</strong> Admin API-nøkkelen din fungerer uavhengig av passordet, men sørg for at du bruker din <code>.myshopify.com</code> nettadresse i oppsettet.
                </p>
              </div>
            </div>
          </div>

          {/* Database Initialization */}
          <div className="polaris-card bg-white p-8 border-l-4 border-l-[#005bd3]">
            <div className="flex items-center mb-6">
              <div className="p-3 bg-blue-50 rounded-lg mr-4">
                <Database className="h-6 w-6 text-[#005bd3]" />
              </div>
              <h3 className="text-lg font-bold text-[#202223]">2. Database-installasjon</h3>
            </div>
            <div className="space-y-4 text-sm text-[#6d7175]">
              <p>For å klargjøre din Supabase-database, må du kjøre følgende SQL i ditt Supabase Dashboard:</p>
              <div className="bg-[#f6f6f7] p-4 rounded-md font-mono text-[11px] relative border border-[#d2d5d9]">
                <button 
                  onClick={() => copyToClipboard("node scripts/init-db.mjs", "sql")}
                  className="absolute top-4 right-4 text-[#6d7175] hover:text-[#202223]"
                >
                  {copied === "sql" ? <CheckCircle2 className="h-4 w-4 text-[#008060]" /> : <Copy className="h-4 w-4" />}
                </button>
                <div className="space-y-1">
                  <p className="text-gray-500">// Kjør denne kommandoen for å se SQL-skriptet:</p>
                  <p className="text-[#202223]">node scripts/init-db.mjs</p>
                </div>
              </div>
            </div>
          </div>

          {/* Environment Reminder */}
          <div className="polaris-card bg-[#f1f2f3] p-6 text-center border-dashed">
            <h4 className="font-bold text-[#202223] mb-2">Trenger du hjelp med .env-filen?</h4>
            <p className="text-xs text-[#6d7175] mb-4">Sørg for at alle nøkler er lagret i <code>.env.local</code> for at endringene skal tre i kraft.</p>
            <div className="flex justify-center space-x-4">
              <button className="text-xs font-bold text-[#005bd3] hover:underline flex items-center">
                Sjekk status <ExternalLink className="h-3 w-3 ml-1" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
