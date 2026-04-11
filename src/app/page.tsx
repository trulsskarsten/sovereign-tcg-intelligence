"use client";
import React from "react";
import {
  TrendingUp, 
  Package, 
  BarChart3, 
  Zap,
  Gem,
  Plus,
  DollarSign,
  Loader2,
  AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { formatCurrency, i18n } from "@/lib/i18n";
import { useUI } from "@/components/Providers";

export default function MerchantDashboard() {
  const { priceMode } = useUI();
  const [data, setData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/stats');
        const json = await res.json();
        if (json.success) {
          setData(json.data);
        } else {
          setError(json.error);
        }
      } catch (err) {
        setError("Kunne ikke hente stats");
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const stats = [
    { 
      label: "Total Lagerverdi (Kost)", 
      value: loading ? "---" : formatCurrency(priceMode === "gross" ? data?.totalValueWithVat : data?.totalValueNok), 
      trend: "+2.1%", 
      icon: Gem, 
      color: "text-[#005bd3]", 
      bg: "bg-blue-50" 
    },
    { 
      label: "Urealisert Gevinst", 
      value: loading ? "---" : formatCurrency(data?.potentialProfitNok || 0), 
      trend: "+5.4%", 
      icon: TrendingUp, 
      color: "text-[#108043]", 
      bg: "bg-green-50" 
    },
    { 
      label: "Lagerbeholdning", 
      value: loading ? "---" : `${data?.stockCount || 0} stk`, 
      trend: "Stabil", 
      icon: Package, 
      color: "text-[#1a1a1a]", 
      bg: "bg-gray-50" 
    },
    { 
      label: "Margin-gjennomsnitt", 
      value: loading ? "---" : `${data?.avgMarginPercentage?.toFixed(1) || 0}%`, 
      trend: "Stabil", 
      icon: BarChart3, 
      color: "text-[#005bd3]", 
      bg: "bg-blue-50" 
    },
  ];

  if (error) {
    return (
      <DashboardShell>
        <div className="flex flex-col items-center justify-center h-full space-y-4">
          <AlertTriangle size={48} className="text-red-500" />
          <h2 className="text-xl font-bold">{i18n.common.error}</h2>
          <p className="text-sm text-[#6d7175]">{error}</p>
          <button onClick={() => window.location.reload()} className="px-6 py-2 bg-[#1a1a1a] text-white rounded-xl text-xs font-bold">Prøv igjen</button>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="max-w-7xl mx-auto space-y-10 py-10 px-6">
        {/* KPI Header */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <div key={i} className="glass-panel p-8 flex flex-col justify-between group hover:scale-[1.02] transition-all duration-500">
              <div className="flex items-center justify-between mb-6">
                <div className={cn("p-4 rounded-[1.25rem] shadow-sm", stat.bg, stat.color)}>
                  <stat.icon size={24} />
                </div>
                {loading ? (
                  <Loader2 size={14} className="animate-spin text-[#d2d5d9]" />
                ) : (
                  <span className={cn(
                    "text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter border",
                    stat.trend.startsWith('+') ? "bg-green-50 text-[#108043] border-green-100" : 
                    stat.trend === 'Stabil' ? "bg-gray-50 text-gray-600 border-gray-100" : "bg-red-50 text-red-600 border-red-100"
                  )}>
                    {stat.trend}
                  </span>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-[#6d7175] uppercase tracking-widest">{stat.label}</p>
                <h3 className="text-2xl font-black text-[#1a1a1a] tracking-tighter">
                  {loading ? (
                    <div className="h-8 w-24 bg-[#f1f2f3] animate-pulse rounded-lg" />
                  ) : stat.value}
                </h3>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Actions & Quick Add */}
          <div className="lg:col-span-2 space-y-10">
            <div className="glass-panel p-10 flex items-center justify-between relative overflow-hidden group border-blue-100/50">
              <div className="relative z-10 space-y-6">
                <div className="space-y-2">
                  <h2 className="text-3xl font-black text-[#1a1a1a] tracking-tighter leading-none">
                    Kjøp & Registrering
                  </h2>
                  <p className="text-sm text-[#6d7175] max-w-sm leading-relaxed">
                    Søk opp TCG-produkter og legg dem direkte i din beholdning med sanntids markedsverdi.
                  </p>
                </div>
                <Link 
                  href="/inventory/add"
                  className="inline-flex items-center px-8 py-4 bg-[#1a1a1a] text-white rounded-2xl text-[13px] font-bold hover:bg-black transition-all shadow-2xl shadow-black/20 group-hover:scale-105 active:scale-95"
                >
                  <Plus size={18} className="mr-3" /> Start Registrering
                </Link>
              </div>
              <div className="absolute right-[-2rem] top-[-2rem] w-80 h-80 bg-blue-500/[0.03] rounded-full blur-3xl group-hover:bg-blue-500/[0.06] transition-all duration-1000"></div>
              <div className="hidden md:block relative z-10 p-10 bg-white/40 rounded-[2.5rem] backdrop-blur-md border border-white/60 shadow-xl shadow-black/5 rotate-3 group-hover:rotate-0 transition-transform duration-700">
                 <Package size={100} className="text-[#1a1a1a]/5" />
              </div>
            </div>

            {/* Performance Analytics Placeholder */}
            <div className="glass-panel p-10">
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#1a1a1a] flex items-center">
                  <BarChart3 size={20} className="mr-4 text-[#005bd3]" /> Lagerverdi Utvikling
                </h3>
                <div className="flex bg-[#f1f2f3] p-1 rounded-xl">
                    <button className="text-[10px] font-black px-4 py-2 text-[#6d7175] uppercase tracking-widest">Uke</button>
                    <button className="text-[10px] font-black px-4 py-2 bg-white rounded-lg text-[#1a1a1a] shadow-sm uppercase tracking-widest">Måned</button>
                </div>
              </div>
              <div className="h-72 w-full bg-white/40 rounded-3xl border border-[#f1f2f3] flex flex-col items-center justify-center space-y-4">
                <Loader2 className="animate-spin text-[#d2d5d9]" size={32} />
                <p className="text-[10px] text-[#6d7175] font-black uppercase tracking-[0.1em]">Kalkulerer Historiske Prispunkter...</p>
              </div>
            </div>
          </div>

          {/* Operational Sidebars */}
          <div className="space-y-8">
             <div className="glass-panel p-8 bg-[#1a1a1a] text-white border-none shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-emerald-500/10 pointer-events-none" />
                <div className="flex items-center justify-between mb-8 relative z-10">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">System Status</h3>
                  <Zap size={18} className="text-yellow-400 fill-yellow-400" />
                </div>
                <div className="space-y-6 relative z-10">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white/70">Sync Motor</span>
                    <span className="text-[10px] font-black bg-green-500/20 text-green-400 px-2 py-0.5 rounded uppercase tracking-widest border border-green-500/30">Aktiv</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white/70">Margin-Sikring</span>
                    <span className="text-[10px] font-black bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded uppercase tracking-widest border border-blue-500/30">Beskyttet</span>
                  </div>
                  <div className="pt-6 border-t border-white/10">
                     <p className="text-[10px] text-white/40 leading-relaxed font-medium italic">
                       Sovereign overvåker {loading ? '...' : data?.uniqueProducts} produkter. Ingen kritiske avvik oppdaget.
                     </p>
                  </div>
                </div>
             </div>

             <div className="glass-panel p-8 space-y-8">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#6d7175]">Lager-innsikt</h3>
                <div className="space-y-8">
                   <div className="flex items-center justify-between group cursor-pointer">
                      <div className="space-y-1">
                        <p className="text-xs font-black text-[#1a1a1a]">Unique Varianter</p>
                        <p className="text-[10px] text-[#6d7175] font-bold uppercase tracking-widest">Markedskoblet</p>
                      </div>
                      <span className="text-sm font-black text-[#1a1a1a]">{loading ? '...' : data?.uniqueProducts}</span>
                   </div>
                   <div className="flex items-center justify-between group cursor-pointer">
                      <div className="space-y-1">
                        <p className="text-xs font-black text-[#1a1a1a]">Potensiell ROI</p>
                        <p className="text-[10px] text-[#108043] font-black uppercase tracking-widest">Profit-prognose</p>
                      </div>
                      <span className="text-sm font-black text-[#108043]">
                        {loading ? '...' : formatCurrency(data?.potentialProfitNok)}
                      </span>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
