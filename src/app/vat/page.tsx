"use client";

import React, { useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import { 
  Receipt, 
  ArrowUpRight, 
  ArrowDownRight, 
  Info,
  Calendar
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function VATPage() {
  // Mock MVA data for preview
  const vatStats = [
    { name: "Inngående MVA (Betalt)", value: 42500, icon: ArrowDownRight, color: "text-green-500" },
    { name: "Utgående MVA (Krevd)", value: 58900, icon: ArrowUpRight, color: "text-[#f02d44]" },
    { name: "Netto MVA-termin", value: 16400, icon: Receipt, color: "text-white" },
  ];

  return (
    <DashboardShell>
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">MVA-Oversikt</h2>
            <p className="text-gray-400 mt-1">Oversikt over inngående og utgående merverdiavgift.</p>
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 bg-[#111] border border-[#222] rounded-lg text-sm text-gray-400 hover:text-white transition-colors">
            <Calendar className="h-4 w-4" />
            <span>Jan - Feb 2026</span>
          </button>
        </div>

        {/* VAT Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {vatStats.map((stat) => (
            <div key={stat.name} className="bg-[#0a0a0a] border border-[#222] p-6 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <p className="text-2xl font-bold text-white">{formatCurrency(stat.value)}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Detailed Breakdown */}
          <div className="bg-[#0a0a0a] border border-[#222] rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-6 flex items-center">
              <Info className="h-5 w-5 mr-2 text-blue-500" />
              Beregning og Grunnopplysninger
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between py-3 border-b border-[#222]">
                <span className="text-gray-400">Total varekjøp (Inlk. MVA)</span>
                <span className="text-white font-medium">{formatCurrency(212500)}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-[#222]">
                <span className="text-gray-400">Netto varekjøp (Eks. MVA)</span>
                <span className="text-white font-medium">{formatCurrency(170000)}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-[#222]">
                <span className="text-gray-400">Gjennomsnittlig MVA-sats</span>
                <span className="text-white font-medium">25%</span>
              </div>
              <div className="mt-8 p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                <p className="text-xs text-blue-400 leading-relaxed">
                  Basert på norske mva-regler for handel med samleobjekter og kortspill. 
                  Husk at du må være registrert i MVA-registeret for å kunne fradragsføre inngående avgift.
                </p>
              </div>
            </div>
          </div>

          {/* Export / Report */}
          <div className="bg-[#0a0a0a] border border-[#222] rounded-xl p-8 flex flex-col items-center justify-center text-center">
            <Receipt className="h-12 w-12 text-gray-700 mb-4" />
            <h3 className="text-xl font-bold mb-2">Eksportér MVA-rapport</h3>
            <p className="text-gray-500 text-sm max-w-xs mb-8">
              Trenger du tallene til regnskapsfører? Last ned detaljert rapport for valgt periode.
            </p>
            <button className="px-8 py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors">
              Last ned PDF / Excel
            </button>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
