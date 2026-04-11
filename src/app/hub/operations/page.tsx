"use client";

import React, { useState, useEffect } from "react";
import DashboardShell from "@/components/DashboardShell";
import { 
  Activity, 
  Server, 
  RefreshCcw, 
  ShieldCheck, 
  AlertCircle,
  CheckCircle2,
  Clock,
  Terminal,
  Database,
  Cpu,
  Globe,
  Lock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function OperationalHealth() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setPulse(p => (p + 1) % 100), 2000);
    return () => clearInterval(interval);
  }, []);

  const services = [
    { 
      name: "Stealth Scraper", 
      status: "aktiv", 
      lastPulse: "3 min siden", 
      health: 98, 
      icon: Globe,
      description: "Markedsovervåking (Outland, Pokepris)"
    },
    { 
      name: "Shopify Sync", 
      status: "aktiv", 
      lastPulse: "Nå", 
      health: 100, 
      icon: RefreshCcw,
      description: "Sanntids lager- og pris-synkronisering"
    },
    { 
      name: "Assistent Engine", 
      status: "aktiv", 
      lastPulse: "12 min siden", 
      health: 100, 
      icon: Cpu,
      description: "AI-drevet beslutningsstøtte"
    },
    { 
      name: "Panic Lock", 
      status: "klar", 
      lastPulse: "Nå", 
      health: 100, 
      icon: Lock,
      description: "Sikkerhetsmargin-sperre"
    },
  ];

  const auditLogs = [
    { id: 1, type: "info", message: "Automatisk ABC-kategorisering fullført for 1,294 produkter.", time: "12:45", date: "IDAG" },
    { id: 2, type: "warning", message: "Sikkerhetssperre utløst: '151 Ultra Premium' endring blokkert (Margin < 15%)", time: "11:20", date: "IDAG" },
    { id: 3, type: "success", message: "Bulk-oppdatering vellykket: 42 priser synkronisert til Shopify.", time: "09:00", date: "IDAG" },
    { id: 4, type: "info", message: "System-vask fullført: Fjernet 12 utgåtte variabler fra lokal cache.", time: "06:15", date: "GÅR" },
  ];

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1500);
  };

  return (
    <DashboardShell>
      <div className="max-w-7xl mx-auto space-y-10 font-sans">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">Sovereign Live Telemetry</span>
            </div>
            <h1 className="text-4xl font-extrabold text-[#1a1a1a] tracking-tight">Operasjonell Status</h1>
            <p className="text-sm text-[#6d7175] mt-2 font-medium">Overvåking av systemets kjerne-tjenester og sikkerhetslogg.</p>
          </div>
          
          <button 
            onClick={handleRefresh}
            className="glass-panel px-6 py-3 text-[11px] font-black uppercase tracking-widest text-[#1a1a1a] hover:bg-white transition-all flex items-center shadow-lg active:scale-95"
          >
            <RefreshCcw size={14} className={cn("mr-2 text-[#005bd3]", isRefreshing && "animate-spin")} /> 
            Oppdater Telemetri
          </button>
        </div>

        {/* Server Status Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, idx) => (
            <motion.div 
              key={service.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="premium-card p-6 flex flex-col group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <service.icon size={64} />
              </div>

              <div className="flex items-start justify-between mb-6">
                <div className="w-10 h-10 glass-panel flex items-center justify-center text-[#005bd3]">
                  <service.icon size={20} />
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black text-[#1a1a1a] uppercase block">Helse</span>
                  <span className="text-lg font-black text-[#005bd3]">{service.health}%</span>
                </div>
              </div>

              <h3 className="text-sm font-black text-[#1a1a1a] mb-1">{service.name}</h3>
              <p className="text-[10px] text-[#6d7175] font-bold mb-4">{service.description}</p>

              <div className="mt-auto pt-4 border-t border-[#f1f2f3] flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2" />
                  <span className="text-[9px] font-black uppercase text-emerald-600 tracking-tighter">{service.status}</span>
                </div>
                <span className="text-[9px] text-[#6d7175] font-bold">{service.lastPulse}</span>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Security Log */}
          <div className="lg:col-span-2 glass-panel overflow-hidden border-none p-0">
            <div className="px-8 py-6 border-b border-[#f1f2f3] flex items-center justify-between bg-white/40">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-[#1a1a1a] rounded-lg text-white">
                  <Terminal size={14} />
                </div>
                <div>
                  <h2 className="text-sm font-black text-[#1a1a1a] uppercase tracking-tighter">Hendelseslogg</h2>
                  <p className="text-[10px] text-[#6d7175] font-bold">Audit-logger for B2B compliance</p>
                </div>
              </div>
            </div>

            <div className="divide-y divide-[#f1f2f3]">
              {auditLogs.map((log) => (
                <div key={log.id} className="px-8 py-5 hover:bg-white/40 transition-colors group cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                      <div className="text-center w-12 border-r border-[#f1f2f3] pr-6">
                        <p className="text-[11px] font-black text-[#1a1a1a]">{log.time}</p>
                        <p className="text-[8px] font-black text-[#6d7175] uppercase">{log.date}</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        {log.type === "warning" ? (
                          <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                            <ShieldCheck size={14} />
                          </div>
                        ) : log.type === "success" ? (
                          <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
                            <CheckCircle2 size={14} />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                            <Activity size={14} />
                          </div>
                        )}
                        <p className={cn(
                          "text-xs font-bold",
                          log.type === "warning" ? "text-red-600" : "text-[#1a1a1a]"
                        )}>
                          {log.message}
                        </p>
                      </div>
                    </div>
                    {log.type === "warning" && (
                      <span className="text-[8px] font-black transition-all bg-red-100 text-red-700 px-2 py-1 rounded-full uppercase tracking-tighter">Action Required</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-6 bg-white/20 border-t border-[#f1f2f3] text-center">
              <button className="text-[10px] font-black text-[#005bd3] hover:tracking-widest transition-all uppercase">
                Last ned fullstendig Audit-rapport (CSV)
              </button>
            </div>
          </div>

          {/* Infrastructure Metrics */}
          <div className="space-y-6">
            <div className="premium-card p-8">
              <div className="flex items-center space-x-3 mb-8">
                <Database size={20} className="text-[#005bd3]" />
                <h2 className="text-sm font-black text-[#1a1a1a] uppercase tracking-tighter">Systemkapasitet</h2>
              </div>
              
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-[10px] font-black uppercase mb-2">
                    <span className="text-[#6d7175]">Database-belastning</span>
                    <span className="text-[#1a1a1a]">12%</span>
                  </div>
                  <div className="h-1.5 bg-[#f1f2f3] rounded-full overflow-hidden">
                    <div className="bg-[#005bd3] h-full w-[12%] rounded-full shadow-[0_0_8px_rgba(0,91,211,0.5)]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[10px] font-black uppercase mb-2">
                    <span className="text-[#6d7175]">Shopify API Quota</span>
                    <span className="text-[#1a1a1a]">98%</span>
                  </div>
                  <div className="h-1.5 bg-[#f1f2f3] rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full w-[98%] rounded-full shadow-[0_0_8px_rgba(16,128,67,0.5)]" />
                  </div>
                </div>

                <div className="pt-4 grid grid-cols-2 gap-4">
                  <div className="p-4 bg-[#f8f9fa] rounded-2xl text-center border border-[#f1f2f3]">
                    <p className="text-[10px] font-black text-[#6d7175] uppercase mb-1">Prispunkter</p>
                    <p className="text-xl font-black text-[#1a1a1a]">12.8k</p>
                  </div>
                  <div className="p-4 bg-[#f8f9fa] rounded-2xl text-center border border-[#f1f2f3]">
                    <p className="text-[10px] font-black text-[#6d7175] uppercase mb-1">Reprices</p>
                    <p className="text-xl font-black text-emerald-600">842</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-panel p-6 bg-gradient-to-br from-[#005bd3]/5 to-transparent border-none">
              <div className="flex items-center text-[#005bd3] mb-4">
                <ShieldCheck size={20} className="mr-2" />
                <span className="text-[10px] font-black uppercase tracking-widest">Assistent Status</span>
              </div>
              <p className="text-[11px] text-[#6d7175] leading-relaxed font-medium">
                Assistenten overvåker nå markedet hvert 15. minutt. Alle priser er innenfor de norske regnskaps-standardene.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
