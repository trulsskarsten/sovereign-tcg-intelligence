"use client";

import React from "react";
import DashboardShell from "@/components/DashboardShell";
import { 
  TrendingUp, 
  Package, 
  BarChart3, 
  Zap,
  Gem,
  Plus,
  DollarSign
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function MerchantDashboard() {
  const stats = [
    { label: "Total Lagerverdi (Marked)", value: "1,245,600 kr", trend: "+2.1%", icon: Gem, color: "text-[#005bd3]", bg: "bg-blue-50" },
    { label: "Urealisert Gevinst", value: "312,400 kr", trend: "+5.4%", icon: TrendingUp, color: "text-[#108043]", bg: "bg-green-50" },
    { label: "Salg siste 24t", value: "18,250 kr", trend: "-1.2%", icon: DollarSign, color: "text-[#202223]", bg: "bg-gray-50" },
    { label: "Margin-gjennomsnitt", value: "24.2%", trend: "Stabil", icon: BarChart3, color: "text-[#005bd3]", bg: "bg-blue-50" },
  ];

  return (
    <DashboardShell>
      <div className="max-w-7xl mx-auto space-y-10 py-8 px-4">
        {/* KPI Header */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <div key={i} className="premium-card p-6 flex flex-col justify-between group">
              <div className="flex items-center justify-between mb-4">
                <div className={cn("p-3 rounded-2xl", stat.bg, stat.color)}>
                  <stat.icon size={22} />
                </div>
                <span className={cn(
                  "text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter",
                  stat.trend.startsWith('+') ? "bg-green-100 text-[#108043]" : 
                  stat.trend === 'Stabil' ? "bg-gray-100 text-gray-600" : "bg-red-100 text-red-600"
                )}>
                  {stat.trend}
                </span>
              </div>
              <div>
                <p className="text-[11px] font-bold text-[#6d7175] uppercase tracking-wider mb-1">{stat.label}</p>
                <h3 className="text-2xl font-black text-[#1a1a1a] tracking-tight">{stat.value}</h3>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Actions & Quick Add */}
          <div className="lg:col-span-2 space-y-8">
            <div className="glass-panel p-8 rounded-[2.5rem] flex items-center justify-between relative overflow-hidden group">
              <div className="relative z-10">
                <h2 className="text-2xl font-black text-[#1a1a1a] tracking-tight mb-2 text-balance leading-none">
                  Kjøp & Legg til Sealed Product
                </h2>
                <p className="text-sm text-[#6d7175] max-w-sm mb-6">
                  Søk opp Packs, Booster Boxes eller Bundles og legg dem direkte i din beholdning med fersk markedsverdi.
                </p>
                <Link 
                  href="/inventory/add"
                  className="inline-flex items-center px-6 py-3 bg-[#1a1a1a] text-white rounded-2xl text-xs font-bold hover:bg-black transition-all shadow-xl shadow-black/10 group-hover:scale-105 active:scale-95"
                >
                  <Plus size={16} className="mr-2" /> Start Registrering
                </Link>
              </div>
              <div className="absolute right-[-2rem] top-[-2rem] w-64 h-64 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-all duration-700"></div>
              <div className="hidden md:block relative z-10 p-6 bg-white/40 rounded-3xl backdrop-blur-sm border border-white/60 shadow-inner">
                 <Package size={80} className="text-[#1a1a1a]/10" />
              </div>
            </div>

            {/* Performance Analytics Placeholder */}
            <div className="premium-card p-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-bold text-[#1a1a1a] flex items-center">
                  <BarChart3 size={18} className="mr-2 text-[#005bd3]" /> Salg- & Prisstatistikk
                </h3>
                <div className="flex space-x-2">
                   <button className="text-[10px] font-bold px-3 py-1 bg-[#f1f2f3] rounded-lg text-[#6d7175]">Uke</button>
                   <button className="text-[10px] font-bold px-3 py-1 bg-[#1a1a1a] rounded-lg text-white shadow-md">Måned</button>
                </div>
              </div>
              <div className="h-64 w-full bg-[#f9fafb] rounded-2xl border-2 border-dashed border-[#edeeef] flex items-center justify-center">
                <p className="text-xs text-[#6d7175] font-medium">Recharts Visualisering Lasters...</p>
              </div>
            </div>
          </div>

          {/* Operational Sidebars */}
          <div className="space-y-6">
             <div className="premium-card p-6 bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d] text-white border-none shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-white/60">System Health</h3>
                  <Zap size={16} className="text-yellow-400" />
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-white/70">Sync Motor</span>
                    <span className="text-[11px] font-bold text-green-400">AKTIV</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-white/70">MVA-Sjekk</span>
                    <span className="text-[11px] font-bold text-green-400">100% OK</span>
                  </div>
                  <div className="pt-4 border-t border-white/10">
                     <p className="text-[10px] text-white/50 leading-relaxed">
                       Sovereign Intelligence overvåker 1,294 varianter. Ingen margin-brudd oppdaget siste 6t.
                     </p>
                  </div>
                </div>
             </div>

             <div className="premium-card p-6">
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#6d7175] mb-6">Siste 7 dager</h3>
                <div className="space-y-6">
                   <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[11px] font-bold text-[#1a1a1a]">Nye "Grails"</p>
                        <p className="text-[10px] text-[#6d7175]">Klasse A tilførsler</p>
                      </div>
                      <span className="text-xs font-bold">+12</span>
                   </div>
                   <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[11px] font-bold text-[#1a1a1a]">Fisker (ROI > 50%)</p>
                        <p className="text-[10px] text-[#6d7175]">Ekte margin-vinnere</p>
                      </div>
                      <span className="text-xs font-bold text-[#108043]">+4</span>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
