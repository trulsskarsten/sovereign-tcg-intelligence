"use client";

import React, { useState } from 'react';
import DashboardShell from '@/components/DashboardShell';
import { 
  ShieldCheck, 
  Download, 
  History, 
  FileText, 
  AlertTriangle,
  Calendar,
  Layers,
  Search
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ComplianceHub() {
  const [activeTab, setActiveTab] = useState('archive');

  const historyData = [
    { date: "2024-03-31", value: "1,245,600 kr", items: 1294, status: "Låst (Fryst)" },
    { date: "2024-02-29", value: "1,180,200 kr", items: 1240, status: "Låst (Fryst)" },
    { date: "2024-01-31", value: "1,150,000 kr", items: 1210, status: "Låst (Fryst)" },
    { date: "2023-12-31", value: "1,040,000 kr", items: 1150, status: "Låst (Fryst)" },
  ];

  return (
    <DashboardShell>
      <div className="max-w-6xl mx-auto py-10 px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#202223] mb-1">Compliance & Arkiv</h1>
            <p className="text-sm text-[#6d7175]">Juridisk arkivering og verdi-rapportering (Bokføringsloven)</p>
          </div>
          <div className="flex items-center space-x-2 bg-[#f1f2f3] p-1 rounded-lg">
            <button 
              onClick={() => setActiveTab('archive')}
              className={cn(
                "px-4 py-2 text-xs font-bold rounded-md transition-all",
                activeTab === 'archive' ? "bg-white text-[#005bd3] shadow-sm" : "text-[#6d7175] hover:text-[#202223]"
              )}
            >
              Arkiv-oversikt
            </button>
            <button 
              onClick={() => setActiveTab('reports')}
              className={cn(
                "px-4 py-2 text-xs font-bold rounded-md transition-all",
                activeTab === 'reports' ? "bg-white text-[#005bd3] shadow-sm" : "text-[#6d7175] hover:text-[#202223]"
              )}
            >
              Månedsrapporter
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Health Banner */}
            <div className="polaris-card bg-[#f0f7ff] border-none p-6 flex items-start">
              <div className="p-3 bg-white rounded-xl shadow-sm mr-6 text-[#005bd3]">
                <ShieldCheck size={28} />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-[#202223] mb-1">Ditt 5-års arkiv er aktivt</h3>
                <p className="text-xs text-[#6d7175] leading-relaxed mb-4">
                  Vi tar daglige snapshots av din lagerverdi. Eldste dokumenter i databasen er fra **10. januar 2024**. 
                  Neste planlagte sletting pga. utløpsdato er om **1,420 dager**.
                </p>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center text-[11px] font-bold text-[#005bd3]">
                    <Layers size={14} className="mr-1" /> 1,294 Aktive Snapshots
                  </div>
                  <div className="flex items-center text-[11px] font-bold text-[#108043]">
                    <History size={14} className="mr-1" /> 100% Integritet
                  </div>
                </div>
              </div>
            </div>

            {/* Archive Table */}
            <div className="polaris-card overflow-hidden">
              <div className="px-6 py-4 border-b border-[#f1f2f3] flex items-center justify-between">
                <h2 className="font-semibold text-[#202223] flex items-center">
                  <FileText size={18} className="mr-2 text-[#005bd3]" /> Avstemmings-rapporter
                </h2>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6d7175]" />
                  <input 
                    placeholder="Søk dato..." 
                    className="pl-9 pr-4 py-1.5 text-xs bg-[#f6f6f7] border-none rounded-md w-48 focus:ring-1 ring-[#005bd3]"
                  />
                </div>
              </div>
              <div className="divide-y divide-[#f1f2f3]">
                {historyData.map((row) => (
                  <div key={row.date} className="px-6 py-4 flex items-center justify-between hover:bg-[#f9fafb] transition-colors">
                    <div className="flex items-center">
                      <div className="mr-4 text-[#6d7175]">
                        <Calendar size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#202223]">{row.date}</p>
                        <p className="text-[10px] text-[#6d7175]">{row.items} varer i beholdningen</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="text-right">
                        <p className="text-sm font-bold text-[#202223]">{row.value}</p>
                        <span className="text-[10px] font-bold text-[#108043] uppercase tracking-tighter">{row.status}</span>
                      </div>
                      <button className="p-2 text-[#6d7175] hover:text-[#005bd3] hover:bg-white rounded-lg shadow-sm transition-all border border-transparent hover:border-[#f1f2f3]">
                        <Download size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="polaris-card p-6">
              <h2 className="font-semibold text-[#202223] flex items-center mb-6">
                <AlertTriangle size={18} className="mr-2 text-[#f49342]" /> Samsvars-kontroll
              </h2>
              <div className="space-y-4">
                <div className="p-3 bg-[#fff4e5] rounded-lg border border-[#ffe1ba]">
                  <p className="text-[11px] font-bold text-[#663c00] mb-1">Bokføringsloven § 13</p>
                  <p className="text-[10px] text-[#805000] leading-relaxed">
                    Primærdokumentasjon må oppbevares i 5 år. Arkivet ditt er konfigurert til å møte dette kravet automatisk.
                  </p>
                </div>
                <div className="p-3 bg-[#eaf5ef] rounded-lg border border-[#c3e6d3]">
                  <p className="text-[11px] font-bold text-[#108043] mb-1">Arkiv-lås Aktiv</p>
                  <p className="text-[10px] text-[#108043] leading-relaxed">
                    Snapshots kan ikke slettes manuelt. Sletting skjer kun automatisk etter 1,825 dager.
                  </p>
                </div>
              </div>
            </div>

            <div className="polaris-card p-6 bg-gradient-to-br from-[#005bd3] to-[#004eaf] text-white border-none shadow-lg">
              <h3 className="font-bold mb-2">Behøver du hjelp med revisjon?</h3>
              <p className="text-xs text-blue-100 leading-relaxed mb-6">
                Generer en full års-ekstrakt for regnskapsfører med alle prispunkter og margin-bevegelser.
              </p>
              <button className="w-full py-2.5 bg-white text-[#005bd3] rounded-lg font-bold text-xs hover:bg-blue-50 transition-colors shadow-sm">
                Generer Årsrapport (2023)
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
