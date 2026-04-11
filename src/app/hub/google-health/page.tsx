"use client";

import React, { useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import { 
  ShieldCheck, 
  AlertTriangle, 
  Search, 
  FileWarning, 
  CheckCircle2, 
  BarChart3,
  Zap,
  ArrowRight,
  Info
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function GoogleHealthHub() {
  const [filter, setFilter] = useState<"all" | "critical" | "healthy">("all");

  const stats = [
    { label: "Sunkre Produkter", value: "1,142", icon: CheckCircle2, color: "text-emerald-500" },
    { label: "Kritiske Mangler", value: "142", icon: AlertTriangle, color: "text-red-500" },
    { label: "Optimaliseringer", value: "86", icon: Zap, color: "text-blue-500" },
  ];

  const issues = [
    { id: 1, product: "Pikachu & Zekrom GX - Team Up", issue: "Mangler EAN/Strekkode", severity: "critical", impact: "Vises ikke i Google Shopping" },
    { id: 2, product: "151 Booster Bundle", issue: "Kort beskrivelse", severity: "warning", impact: "Lavere rangerings-score" },
    { id: 3, product: "Charizard ex - Paldean Fates", issue: "Mangler Merkevare (Vendor)", severity: "critical", impact: "Feil kategorisering" },
    { id: 4, product: "Silver Tempest Booster Box", issue: "Mangler GTIN", severity: "critical", impact: "Blokkert av Google" },
  ];

  const filteredIssues = issues.filter(i => {
    if (filter === "all") return true;
    if (filter === "critical") return i.severity === "critical";
    return i.severity !== "critical";
  });

  return (
    <DashboardShell>
      <div className="max-w-7xl mx-auto space-y-10 font-sans">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">Merchant Center Intelligence</span>
            </div>
            <h1 className="text-4xl font-extrabold text-[#1a1a1a] tracking-tight">Google Health Hub</h1>
            <p className="text-sm text-[#6d7175] mt-2 font-medium">Sørg for at dine produkter møter Googles krav for maksimal synlighet.</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button className="glass-panel px-6 py-3 text-[10px] font-black uppercase tracking-widest text-[#1a1a1a] hover:bg-white transition-all shadow-lg">
              Start Full Analyse
            </button>
            <button className="bg-[#1a1a1a] text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-black/10 hover:bg-black transition-all">
              Quick Fix All
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, idx) => (
            <motion.div 
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="premium-card p-8 flex items-center space-x-6"
            >
              <div className={cn("w-14 h-14 glass-panel flex items-center justify-center", stat.color)}>
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#6d7175] mb-1">{stat.label}</p>
                <p className="text-3xl font-black text-[#1a1a1a]">{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Issue List */}
          <div className="lg:col-span-2 glass-panel overflow-hidden border-none p-0 flex flex-col">
            <div className="px-8 py-6 border-b border-[#f1f2f3] flex items-center justify-between bg-white/40">
              <div className="flex items-center space-x-4">
                <div className="flex bg-[#f1f2f3]/50 p-1 rounded-xl">
                  <button 
                    onClick={() => setFilter("all")}
                    className={cn("px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all", filter === "all" ? "bg-white text-[#1a1a1a] shadow-sm" : "text-[#6d7175]")}
                  >
                    Alle
                  </button>
                  <button 
                    onClick={() => setFilter("critical")}
                    className={cn("px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all", filter === "critical" ? "bg-white text-red-600 shadow-sm" : "text-[#6d7175]")}
                  >
                    Kritiske
                  </button>
                </div>
              </div>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6d7175]" />
                <input 
                  type="text" 
                  placeholder="Søk i produkter..." 
                  className="pl-9 pr-4 py-2 bg-[#f1f2f3]/50 border-none rounded-xl text-xs font-bold w-64 focus:ring-2 focus:ring-[#005bd3]/20 transition-all"
                />
              </div>
            </div>

            <div className="divide-y divide-[#f1f2f3] flex-1">
              {filteredIssues.map((item) => (
                <div key={item.id} className="px-8 py-6 hover:bg-white/40 transition-colors group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                      <div className={cn(
                        "w-10 h-10 rounded-2xl flex items-center justify-center",
                        item.severity === "critical" ? "bg-red-50 text-red-500" : "bg-blue-50 text-blue-500"
                      )}>
                        {item.severity === "critical" ? <FileWarning size={18} /> : <Info size={18} />}
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-[#1a1a1a] mb-0.5">{item.product}</h3>
                        <div className="flex items-center space-x-3">
                          <span className={cn(
                            "text-[10px] font-black uppercase px-2 py-0.5 rounded-md",
                            item.severity === "critical" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                          )}>
                            {item.issue}
                          </span>
                          <span className="text-[10px] text-[#6d7175] font-bold italic">{item.impact}</span>
                        </div>
                      </div>
                    </div>
                    <button className="opacity-0 group-hover:opacity-100 transition-all p-2 hover:bg-[#1a1a1a] hover:text-white rounded-xl">
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 bg-white/20 border-t border-[#f1f2f3] text-center">
              <p className="text-[10px] font-black text-[#6d7175] uppercase tracking-widest">
                Totalt 142 produkter krever din oppmerksomhet
              </p>
            </div>
          </div>

          {/* Guidelines Sidebar */}
          <div className="space-y-6">
            <div className="premium-card p-8 bg-[#1a1a1a] text-white">
              <BarChart3 size={24} className="text-[#005bd3] mb-6" />
              <h2 className="text-lg font-black tracking-tighter mb-4">Googles TCG Standard</h2>
              <ul className="space-y-4">
                <li className="flex items-start space-x-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#005bd3] mt-1.5 shrink-0" />
                  <p className="text-[11px] font-medium leading-relaxed opacity-80">
                    <span className="font-black">Titler:</span> Google krever formatet [Merke] [Sett] [Produkt] - [Språk] for optimal rangering.
                  </p>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#005bd3] mt-1.5 shrink-0" />
                  <p className="text-[11px] font-medium leading-relaxed opacity-80">
                    <span className="font-black">GTIN/EAN:</span> Produkter uten unike strekkoder blir ofte nedprioritert eller blokkert fra Shopping-resultater.
                  </p>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#005bd3] mt-1.5 shrink-0" />
                  <p className="text-[11px] font-medium leading-relaxed opacity-80">
                    <span className="font-black">Bilder:</span> Bruk høyoppløselige bilder med hvit bakgrunn for 25% høyere klikkfrekvens.
                  </p>
                </li>
              </ul>
              <button className="w-full mt-8 py-3 bg-white/10 hover:bg-white/20 transition-all rounded-xl text-[10px] font-black uppercase tracking-widest">
                Lær Mer om SEO
              </button>
            </div>

            <div className="glass-panel p-6 border-none bg-gradient-to-br from-emerald-500/5 to-transparent">
              <div className="flex items-center text-emerald-600 mb-4">
                <ShieldCheck size={20} className="mr-2" />
                <span className="text-[10px] font-black uppercase tracking-widest">Automatisk Fix</span>
              </div>
              <p className="text-[11px] text-[#6d7175] leading-relaxed font-medium">
                Vår AI-motor kan automatisk standardisere dine titler og legge til manglende merkevarenavn basert på sett-informasjon.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
