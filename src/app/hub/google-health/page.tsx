"use client";

import React, { useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import { 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCcw, 
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Search,
  ArrowRight
} from "lucide-react";
import { i18n } from "@/lib/i18n";

export default function GoogleHealthHub() {
  const [activeTab, setActiveTab] = useState("at-risk");
  
  // Mock data for the Health Check
  const atRiskProducts = [
    { 
      id: 1, 
      name: "Paldean Fates Booster Box", 
      issue: "Mangler Språk-attributt", 
      improvement: "Pokémon TCG: Paldean Fates Booster Box - English",
      impact: "Høy"
    },
    { 
      id: 2, 
      name: "151 UPC", 
      issue: "Tittel er for kort", 
      improvement: "Pokémon TCG: Scarlet & Violet—151 Ultra Premium Collection - English", 
      impact: "Medium"
    },
    { 
      id: 3, 
      name: "VSTAR Universe", 
      issue: "Mangler Merke (Brand)", 
      improvement: "Pokémon TCG: VSTAR Universe Booster Box (s12a) - Japanese", 
      impact: "Høy"
    },
  ];

  return (
    <DashboardShell>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-[#202223] tracking-tight">Google Merchant Center Master Hub</h1>
            <p className="text-sm text-[#6d7175] mt-1">Optimaliser din produkt-data for maksimal synlighet i Google søk.</p>
          </div>
          <div className="flex space-x-3">
            <button className="polaris-btn-secondary flex items-center">
              <RefreshCcw size={16} className="mr-2" /> Oppdater status
            </button>
            <button className="polaris-btn-primary bg-[#108043] border-[#108043]">
              Fiks alle (BETA)
            </button>
          </div>
        </div>

        {/* Health Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="polaris-card p-6 border-l-4 border-l-[#f02d44]">
            <p className="text-xs font-bold text-[#6d7175] uppercase tracking-wider">Ufullstendig data</p>
            <div className="flex items-center mt-2">
              <span className="text-3xl font-bold text-[#202223]">{atRiskProducts.length}</span>
              <span className="ml-2 text-xs text-[#f02d44] font-medium flex items-center">
                <AlertTriangle size={12} className="mr-1" /> Krever tiltak
              </span>
            </div>
          </div>
          <div className="polaris-card p-6 border-l-4 border-l-[#108043]">
            <p className="text-xs font-bold text-[#6d7175] uppercase tracking-wider">Alt OK</p>
            <div className="flex items-center mt-2">
              <span className="text-3xl font-bold text-[#202223]">142</span>
              <span className="ml-2 text-xs text-[#108043] font-medium flex items-center">
                <CheckCircle2 size={12} className="mr-1" /> Godkjent
              </span>
            </div>
          </div>
          <div className="polaris-card p-6 border-l-4 border-l-[#005bd3]">
            <p className="text-xs font-bold text-[#6d7175] uppercase tracking-wider">Google Synlighet</p>
            <div className="flex items-center mt-2">
              <span className="text-3xl font-bold text-[#202223]">94%</span>
              <span className="ml-2 text-xs text-[#005bd3] font-medium flex items-center">
                <ShieldCheck size={12} className="mr-1" /> Optimalt
              </span>
            </div>
          </div>
        </div>

        {/* Health Checklist Hub */}
        <div className="polaris-card overflow-hidden bg-white">
          <div className="border-b border-[#f1f2f3]">
            <nav className="flex px-6 space-x-8">
              <button 
                onClick={() => setActiveTab("at-risk")}
                className={cn(
                  "py-4 text-xs font-bold border-b-2 transition-colors uppercase tracking-widest",
                  activeTab === "at-risk" ? "border-[#005bd3] text-[#005bd3]" : "border-transparent text-[#6d7175]"
                )}
              >
                Risiko Produkter ({atRiskProducts.length})
              </button>
              <button 
                onClick={() => setActiveTab("setup")}
                className={cn(
                  "py-4 text-xs font-bold border-b-2 transition-colors uppercase tracking-widest",
                  activeTab === "setup" ? "border-[#005bd3] text-[#005bd3]" : "border-transparent text-[#6d7175]"
                )}
              >
                Oppsett-guide
              </button>
            </nav>
          </div>

          <div className="p-0">
            {activeTab === "at-risk" ? (
              <div className="divide-y divide-[#f1f2f3]">
                {atRiskProducts.map((item) => (
                  <div key={item.id} className="p-6 hover:bg-[#f9fafb] transition-colors group">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h3 className="text-sm font-bold text-[#202223] flex items-center">
                          {item.name}
                          <span className={cn(
                            "ml-3 px-2 py-0.5 rounded text-[9px] uppercase font-bold",
                            item.impact === "Høy" ? "bg-[#fff4f4] text-[#c02d2d]" : "bg-[#f1f2f3] text-[#202223]"
                          )}>
                            Innvirkning: {item.impact}
                          </span>
                        </h3>
                        <p className="text-xs text-[#6d7175] flex items-center">
                          <AlertTriangle size={14} className="mr-2 text-[#f49342]" /> {item.issue}
                        </p>
                      </div>
                      <button className="polaris-btn-secondary py-1.5 px-3 flex items-center text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                        Klargjør forbedring <ArrowRight size={14} className="ml-2" />
                      </button>
                    </div>
                    
                    <div className="mt-4 p-3 bg-[#f1f8fe] rounded-lg border border-[#d2d5d9] flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-bold text-[#005bd3] uppercase">Forslag:</span>
                        <code className="text-xs text-[#202223] font-medium">{item.improvement}</code>
                      </div>
                      <CheckCircle2 size={16} className="text-[#005bd3] cursor-pointer hover:scale-110 transition-transform" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center space-y-4">
                <div className="w-16 h-16 bg-[#f1f2f3] rounded-full flex items-center justify-center mx-auto text-[#6d7175]">
                  <ExternalLink size={32} />
                </div>
                <h3 className="text-lg font-bold">Koble til Google Merchant Center</h3>
                <p className="text-sm text-[#6d7175] max-w-sm mx-auto">
                  For å se faktiske godkjennings-feil fra Google, må du koble din Shopify-feed til Merchant Center.
                </p>
                <button className="polaris-btn-primary">Start oppsett</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
