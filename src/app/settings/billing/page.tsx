"use client";

import React, { useState } from 'react';
import DashboardShell from '@/components/DashboardShell';
import { 
  CheckCircle2, 
  CreditCard, 
  Crown, 
  Star, 
  ShieldCheck,
  Zap,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { BILLING_PLANS } from '@/lib/billing/shopify-billing';

export default function BillingSettings() {
  const [currentPlan, setCurrentPlan] = useState("Hobbyist (Free)");

  return (
    <DashboardShell>
      <div className="max-w-6xl mx-auto py-12 px-6">
        <div className="mb-12">
           <h1 className="text-3xl font-black text-[#1a1a1a] tracking-tight mb-2">Abonnement & Planer</h1>
           <p className="text-[#6d7175] text-sm font-medium">Velg nivået som passer din butikkdrift.</p>
        </div>

        {/* Plan Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {Object.values(BILLING_PLANS).map((plan) => (
            <div 
              key={plan.name} 
              className={cn(
                "premium-card flex flex-col p-8 transition-all relative overflow-hidden",
                currentPlan === plan.name ? "ring-2 ring-[#005bd3] shadow-2xl" : "opacity-80 grayscale-[0.5] hover:opacity-100 hover:grayscale-0"
              )}
            >
              {currentPlan === plan.name && (
                <div className="absolute top-4 right-4 bg-[#005bd3] text-white text-[10px] font-black px-2 py-1 rounded-full uppercase">
                   Aktiv nå
                </div>
              )}

              <div className="mb-8">
                 <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 text-[#1a1a1a]">
                    {plan.name.includes("Pro") ? <Star size={24} /> : 
                     plan.name.includes("Enterprise") ? <Crown size={24} /> : <Zap size={24} />}
                 </div>
                 <h3 className="text-xl font-black text-[#1a1a1a] mb-1">{plan.name}</h3>
                 <div className="flex items-baseline">
                    <span className="text-3xl font-black">{plan.price}</span>
                    <span className="text-sm font-bold text-[#6d7175] ml-1">kr / måned</span>
                 </div>
              </div>

              <div className="space-y-4 mb-10 flex-1">
                 <p className="text-[10px] font-bold text-[#6d7175] uppercase tracking-widest">Inkludert:</p>
                 {plan.features.map((feature, i) => (
                   <div key={i} className="flex items-start space-x-3">
                      <CheckCircle2 size={16} className="text-[#108043] shrink-0 mt-0.5" />
                      <span className="text-xs font-medium text-[#1a1a1a]">{feature}</span>
                   </div>
                 ))}
                 <div className="flex items-start space-x-3 pt-2 border-t border-[#f1f2f3]">
                    <ShieldCheck size={16} className="text-[#005bd3] shrink-0 mt-0.5" />
                    <span className="text-xs font-bold text-[#1a1a1a]">Opp til {plan.limit.toLocaleString()} varer</span>
                 </div>
              </div>

              <button 
                disabled={currentPlan === plan.name}
                className={cn(
                  "w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center transition-all group",
                  currentPlan === plan.name 
                    ? "bg-[#f1f2f3] text-[#6d7175] cursor-default" 
                    : "bg-[#1a1a1a] text-white hover:bg-black shadow-xl shadow-black/10"
                )}
              >
                {currentPlan === plan.name ? "Gjeldende Plan" : "Oppgrader Nå"}
                {currentPlan !== plan.name && <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />}
              </button>
            </div>
          ))}
        </div>

        {/* Security & Trust Footer */}
        <div className="glass-panel p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between text-center md:text-left">
           <div className="flex items-center space-x-6 mb-6 md:mb-0">
              <div className="p-4 bg-white/60 rounded-3xl backdrop-blur-sm border border-white/80 shadow-inner">
                 <CreditCard size={32} className="text-[#1a1a1a]" />
              </div>
              <div>
                 <p className="text-sm font-bold text-[#1a1a1a]">Sikker Fakturering via Shopify</p>
                 <p className="text-xs text-[#6d7175]">Abonnementet ditt belastes direkte på din månedlige Shopify-faktura. Ingen behov for kredittkort her.</p>
              </div>
           </div>
           <div className="flex space-x-4">
              <div className="text-center px-4">
                 <p className="text-lg font-black text-[#1a1a1a]">0kr</p>
                 <p className="text-[10px] uppercase font-bold text-[#6d7175]">Startgebyr</p>
              </div>
              <div className="w-px h-10 bg-[#edeeef]" />
              <div className="text-center px-4">
                 <p className="text-lg font-black text-[#1a1a1a]">1-klikks</p>
                 <p className="text-[10px] uppercase font-bold text-[#6d7175]">Oppsigelse</p>
              </div>
           </div>
        </div>
      </div>
    </DashboardShell>
  );
}
