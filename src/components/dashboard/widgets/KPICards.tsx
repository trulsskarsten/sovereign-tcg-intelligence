"use client";

import React, { useState, useEffect } from "react";
import { 
  TrendingUp, 
  Package, 
  BarChart3, 
  Gem,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/i18n";
import { useUI } from "@/components/Providers";
import { clientLogger } from "@/lib/client-logger";

interface KPIData {
  totalValueWithVat?: number;
  totalValueNok?: number;
  potentialProfitNok?: number;
  [key: string]: unknown;
}

export function KPICards() {
  const { priceMode } = useUI();
  const [data, setData] = useState<KPIData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/stats');
        const json = await res.json();
        if (json.success) setData(json.data);
      } catch (err: unknown) {
        clientLogger.error("Failed to fetch kpis", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const stats = [
    { 
      label: "Total Lagerverdi", 
      value: loading ? "---" : formatCurrency(priceMode === "gross" ? (data?.totalValueWithVat ?? 0) : (data?.totalValueNok ?? 0)), 
      trend: "+2.1%", 
      icon: Gem, 
      color: "text-[#005bd3]", 
      bg: "bg-blue-50" 
    },
    { 
      label: "Urealisert Gevinst", 
      value: loading ? "---" : formatCurrency(data?.potentialProfitNok ?? 0), 
      trend: "+5.4%", 
      icon: TrendingUp, 
      color: "text-[#108043]", 
      bg: "bg-green-50" 
    },
    { 
      label: "Lagerbeholdning", 
      value: loading ? "---" : `${data?.stockCount ?? 0} stk`, 
      trend: "Stabil", 
      icon: Package, 
      color: "text-[#1a1a1a]", 
      bg: "bg-gray-50" 
    },
    { 
      label: "Margin-gjennomsnitt", 
      value: loading ? "---" : `${(data?.avgMarginPercentage || 0).toFixed(1)}%`, 
      trend: "Stabil", 
      icon: BarChart3, 
      color: "text-[#005bd3]", 
      bg: "bg-blue-50" 
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-full">
      {stats.map((stat, i) => (
        <div key={i} className="glass-panel p-6 flex flex-col justify-between group h-full">
          <div className="flex items-center justify-between mb-4">
            <div className={cn("p-3 rounded-xl shadow-sm", stat.bg, stat.color)}>
              <stat.icon size={20} />
            </div>
            {loading ? (
              <Loader2 size={12} className="animate-spin text-[#d2d5d9]" />
            ) : (
              <span className={cn(
                "text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter border",
                stat.trend.startsWith('+') ? "bg-green-50 text-[#108043] border-green-100" : 
                stat.trend === 'Stabil' ? "bg-gray-50 text-gray-600 border-gray-100" : "bg-red-50 text-red-600 border-red-100"
              )}>
                {stat.trend}
              </span>
            )}
          </div>
          <div className="space-y-1">
            <p className="text-[9px] font-black text-[#6d7175] uppercase tracking-widest">{stat.label}</p>
            <h3 className="text-xl font-black text-[#1a1a1a] tracking-tighter">
              {loading ? (
                <div className="h-6 w-20 bg-[#f1f2f3] animate-pulse rounded-md" />
              ) : stat.value}
            </h3>
          </div>
        </div>
      ))}
    </div>
  );
}
