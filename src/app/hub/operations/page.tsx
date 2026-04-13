"use client";

import React, { useState, useEffect } from 'react';
import DashboardShell from '@/components/DashboardShell';
import { 
  Activity, 
  Database, 
  Globe, 
  ShieldCheck, 
  Terminal, 
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

import { clientLogger } from '@/lib/client-logger';

export default function OperationsHub() {
  const [health, setHealth] = useState<any>(null);
  const [diagnostics, setDiagnostics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [hRes, dRes] = await Promise.all([
        fetch('/api/health'),
        fetch('/api/diagnostics')
      ]);
      const hJson = await hRes.json();
      const dJson = await dRes.json();
      
      if (hJson.success) setHealth(hJson);
      if (dJson.success) setDiagnostics(dJson.diagnostics);
    } catch (err) {
      clientLogger.error("Failed to fetch ops data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <DashboardShell>
      <div className="max-w-7xl mx-auto py-10 px-6 space-y-10">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-[#1a1a1a] tracking-tighter">Systemdrift & Helsetall</h1>
            <p className="text-sm text-[#6d7175] font-medium tracking-tight">Status for dine integrasjoner og automatiserte prosesser.</p>
          </div>
          <button 
            onClick={fetchData}
            disabled={loading}
            className="p-3 bg-white border border-[#f1f2f3] rounded-2xl hover:bg-gray-50 transition-all shadow-sm"
          >
            <RefreshCw size={20} className={cn(loading && "animate-spin")} />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Health Status Cards */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-panel p-8 space-y-6 bg-white/40">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-blue-50 text-[#005bd3] rounded-xl">
                  <Globe size={24} />
                </div>
                <div className="flex flex-col items-end">
                  <span className={cn(
                    "text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border mb-2",
                    health?.services?.shopify === "healthy" ? "bg-green-50 text-green-600 border-green-100" : "bg-red-50 text-red-600 border-red-100"
                  )}>
                    {health?.services?.shopify || "UNKNOWN"}
                  </span>
                  {health?.metrics?.shopify_latency_ms > 0 && (
                    <span className="text-[9px] font-bold text-[#6d7175]">{health.metrics.shopify_latency_ms}ms respons</span>
                  )}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-black text-[#1a1a1a] tracking-tight">Shopify API</h3>
                <p className="text-xs text-[#6d7175] font-medium leading-relaxed">Tilkobling til butikkens Admin API er aktiv og svarer.</p>
              </div>
            </div>

            <div className="glass-panel p-8 space-y-6 bg-white/40">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-emerald-50 text-[#108043] rounded-xl">
                  <Database size={24} />
                </div>
                <span className={cn(
                  "text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border",
                  health?.services?.database === "healthy" ? "bg-green-50 text-green-600 border-green-100" : "bg-red-50 text-red-600 border-red-100"
                )}>
                  {health?.services?.database || "UNKNOWN"}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-black text-[#1a1a1a] tracking-tight">Supabase DB</h3>
                <p className="text-xs text-[#6d7175] font-medium leading-relaxed">Databasen er operasjonell med RLS isolasjon aktivert.</p>
              </div>
            </div>
          </div>

          <div className="glass-panel p-8 bg-[#1a1a1a] text-white border-none shadow-2xl relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-br from-[#005bd3]/20 to-transparent pointer-events-none" />
             <div className="relative z-10 flex flex-col h-full justify-between">
               <div className="space-y-6">
                 <div className="flex items-center justify-between">
                    <Activity size={24} className="text-blue-400" />
                    <span className="text-[10px] font-black bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full uppercase tracking-widest animate-pulse">Live</span>
                 </div>
                 <h3 className="text-xl font-black tracking-tight leading-none">Automatisering</h3>
                 <div className="space-y-4">
                    <div className="flex justify-between items-center text-xs">
                       <span className="text-white/60 font-medium whitespace-nowrap">Lager-poster</span>
                       <span className="font-black font-mono">{health?.metrics?.inventory_items || 0}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                       <span className="text-white/60 font-medium whitespace-nowrap">Venter på endring</span>
                       <span className="font-black font-mono text-blue-400">{health?.metrics?.pending_updates || 0}</span>
                    </div>
                 </div>
               </div>
               <div className="pt-8 border-t border-white/10 mt-8">
                  <div className="flex items-center text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">
                    Sist sjekket: {new Date().toLocaleTimeString('no-NO')}
                  </div>
               </div>
             </div>
          </div>
        </div>

        {/* Audit Logs */}
        <div className="glass-panel p-10 space-y-8">
           <div className="flex items-center justify-between">
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#1a1a1a] flex items-center">
                 <Terminal size={20} className="mr-4 text-[#005bd3]" /> Siste Hendelseslogg
              </h3>
              <button className="text-[10px] font-black text-[#6d7175] uppercase tracking-widest hover:text-[#1a1a1a]">Se full logg →</button>
           </div>

           <div className="bg-white/40 rounded-3xl border border-[#f1f2f3] overflow-hidden">
             <div className="divide-y divide-[#f1f2f3]">
               {loading ? (
                 <div className="p-20 flex flex-col items-center justify-center space-y-4">
                    <Loader2 size={32} className="animate-spin text-[#d2d5d9]" />
                    <p className="text-[10px] text-[#6d7175] font-black uppercase tracking-widest">Henter logger...</p>
                 </div>
               ) : diagnostics?.recent_activity?.length > 0 ? (
                 diagnostics.recent_activity.map((log: any) => (
                    <div key={log.id} className="p-6 flex items-center justify-between group hover:bg-[#f9fafb] transition-colors">
                       <div className="flex items-center space-x-6">
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center",
                            log.severity === 'error' ? "bg-red-50 text-red-600" : "bg-blue-50 text-[#005bd3]"
                          )}>
                             {log.severity === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
                          </div>
                          <div className="space-y-1">
                             <p className="text-sm font-bold text-[#1a1a1a]">{log.action}</p>
                             <p className="text-[10px] text-[#6d7175] font-medium">{new Date(log.created_at).toLocaleString('no-NO')}</p>
                          </div>
                       </div>
                       <div className="text-[10px] font-black text-[#6d7175] uppercase tracking-tighter bg-white px-3 py-1 rounded-lg border border-[#f1f2f3]">
                          {log.entity_type}
                       </div>
                    </div>
                 ))
               ) : (
                 <div className="p-20 text-center text-[#6d7175]">
                    <Activity size={32} className="mx-auto mb-4 text-[#d2d5d9]" />
                    <p className="text-xs font-black uppercase tracking-widest">Ingen nylige hendelser</p>
                 </div>
               )}
             </div>
           </div>
        </div>
      </div>
    </DashboardShell>
  );
}
