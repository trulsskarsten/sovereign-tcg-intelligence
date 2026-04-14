"use client";

import React, { useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import {
  Plus,
  Package,
  Search
} from "lucide-react";
import { i18n, formatCurrency, formatPercent } from "@/lib/i18n";
import { useUI } from "@/components/Providers";
import { formatPrice } from "@/lib/pricing";

export default function PurchasesPage() {
  const { priceMode } = useUI();
  
  const investedAmount = 42500;

  return (
    <DashboardShell>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-[#202223] tracking-tight">{i18n.common.purchases} & WAC</h1>
            <p className="text-sm text-[#6d7175] mt-1">Registrer nye varer og oppdater automatisk gjennomsnittlig innkjøpspris (WAC).</p>
          </div>
          <button
            className="polaris-btn-primary flex items-center"
          >
            <Plus size={16} className="mr-2" /> Nytt Innkjøp
          </button>
        </div>

        {/* Investment Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="polaris-card p-6 bg-white border border-[#d2d5d9]">
            <h3 className="text-[10px] font-bold text-[#6d7175] uppercase tracking-wider mb-4">
              Investert Siste 30 dager ({priceMode === "net" ? "Eks." : "Inkl."} MVA)
            </h3>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold text-[#202223]">{formatCurrency(formatPrice(investedAmount, priceMode))}</span>
              <span className="text-xs text-[#108043] font-bold">+12% fra forrige mnd</span>
            </div>
            <p className="text-[10px] text-[#6d7175] mt-1">Totalt investert i nytt lager</p>
          </div>
          <div className="polaris-card p-6 bg-white border border-[#d2d5d9]">
            <h3 className="text-[10px] font-bold text-[#6d7175] uppercase tracking-wider mb-4">WAC-Nøyaktighet</h3>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold text-[#202223]">98.2%</span>
              <span className="text-xs text-[#005bd3] font-bold">Optimal</span>
            </div>
            <p className="text-[10px] text-[#6d7175] mt-1">Data-integritet for lagerverdi</p>
          </div>
        </div>

        {/* History Table */}
        <div className="polaris-card overflow-hidden">
          <div className="px-6 py-4 border-b border-[#f1f2f3] flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
            <h3 className="text-sm font-bold text-[#202223]">{i18n.common.purchases}historikk</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#6d7175]" />
              <input 
                type="text" 
                placeholder="Finn innkjøp..." 
                className="polaris-input pl-9 h-9 w-64 text-xs"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#f9fafb] border-b border-[#f1f2f3]">
                <tr>
                  <th className="px-6 py-3 text-[10px] font-bold text-[#202223] uppercase tracking-wider">Produkt</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-[#202223] uppercase tracking-wider text-right">Antall</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-[#202223] uppercase tracking-wider text-right">
                    Enhetspris ({priceMode === "net" ? "Eks." : "Inkl."} MVA)
                  </th>
                  <th className="px-6 py-3 text-[10px] font-bold text-[#202223] uppercase tracking-wider">Leverandør</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-[#202223] uppercase tracking-wider text-right">Dato</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1f2f3]">
                {[1, 2, 3].map((i) => (
                  <tr key={i} className="hover:bg-[#f9fafb] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-[#f1f2f3] rounded flex items-center justify-center mr-3">
                          <Package size={16} className="text-[#6d7175]" />
                        </div>
                        <span className="text-sm font-medium text-[#202223]">Prismatic Evolutions ETB</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-[#202223]">24 stk</td>
                    <td className="px-6 py-4 text-right text-sm text-[#202223] font-medium">
                      {formatCurrency(formatPrice(420, priceMode))}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#6d7175]">A-Holdings AS</td>
                    <td className="px-6 py-4 text-right text-xs text-[#6d7175]">12. apr, 2026</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
