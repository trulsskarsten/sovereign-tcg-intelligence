"use client";

import React, { useState } from 'react';
import DashboardShell from '@/components/DashboardShell';
import { 
  Package, 
  Search, 
  DollarSign, 
  ShoppingBag, 
  ChevronRight, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function AddSealedProduct() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Mock search results for sealed products
  const searchResults = [
    { id: 1, name: "Scarlet & Violet: 151 Booster Pack", marketPrice: 65, type: "Pack" },
    { id: 2, name: "Crown Zenith Elite Trainer Box", marketPrice: 599, type: "Box" },
    { id: 3, name: "Paldean Fates Booster Bundle", marketPrice: 285, type: "Bundle" }
  ];

  return (
    <DashboardShell>
      <div className="max-w-4xl mx-auto py-12 px-6">
        <div className="mb-10 text-center">
           <h1 className="text-3xl font-black text-[#1a1a1a] tracking-tight mb-2">Nytt Sealed Product</h1>
           <p className="text-[#6d7175] text-sm font-medium">Legg til Packs, Boxer og Bundles i din beholdning.</p>
        </div>

        {/* Stepper Wizard (Apple Style) */}
        <div className="flex items-center justify-center space-x-4 mb-12">
           {[1, 2, 3].map((s) => (
             <div key={s} className="flex items-center">
               <div className={cn(
                 "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                 step >= s ? "bg-[#1a1a1a] text-white" : "bg-[#f1f2f3] text-[#6d7175]"
               )}>
                 {step > s ? <CheckCircle2 size={16} /> : s}
               </div>
               {s < 3 && <div className={cn("w-12 h-0.5 mx-2", step > s ? "bg-[#1a1a1a]" : "bg-[#edeeef]")} />}
             </div>
           ))}
        </div>

        <div className="glass-panel p-10 rounded-[3rem] shadow-2xl relative overflow-hidden bg-white/40 border-white/60">
           {step === 1 && (
             <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                <div>
                   <label className="block text-xs font-bold text-[#1a1a1a] uppercase tracking-widest mb-4">Søk etter produkt</label>
                   <div className="relative group">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6d7175] group-focus-within:text-[#1a1a1a] transition-colors" size={20} />
                      <input 
                        type="text" 
                        placeholder="f.eks. 151 Booster Pack..."
                        className="w-full pl-12 pr-4 py-4 bg-white/60 border border-white/80 rounded-2xl focus:ring-4 focus:ring-blue-500/5 focus:border-[#005bd3] transition-all outline-none text-md font-medium"
                      />
                   </div>
                </div>

                <div className="space-y-3">
                   {searchResults.map((res) => (
                     <button 
                       key={res.id}
                       onClick={() => setStep(2)}
                       className="w-full p-4 bg-white/40 hover:bg-white/80 border border-white/60 rounded-2xl flex items-center justify-between group transition-all"
                     >
                       <div className="flex items-center">
                         <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center mr-4 shadow-sm group-hover:scale-110 transition-transform">
                            <Package size={20} className="text-[#6d7175]" />
                         </div>
                         <div className="text-left">
                            <p className="text-sm font-bold text-[#1a1a1a]">{res.name}</p>
                            <p className="text-[10px] text-[#6d7175] font-black uppercase tracking-tighter">{res.type}</p>
                         </div>
                       </div>
                       <ChevronRight size={18} className="text-[#6d7175]" />
                     </button>
                   ))}
                </div>
             </div>
           )}

           {step === 2 && (
             <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                <div className="flex items-center space-x-4 p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                   <Package className="text-[#005bd3]" size={24} />
                   <div>
                      <p className="text-sm font-bold text-[#1a1a1a]">Scarlet & Violet: 151 Booster Pack</p>
                      <p className="text-xs text-[#6d7175]">Markedsverdi: 65 kr</p>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="block text-[10px] font-bold text-[#6d7175] uppercase tracking-widest">Innkjøpspris (Cost)</label>
                      <div className="relative">
                        <DollarSign size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6d7175]" />
                        <input type="number" placeholder="42" className="w-full pl-10 pr-4 py-3 bg-white/60 border border-white/80 rounded-xl focus:ring-4 focus:ring-blue-500/5 outline-none font-bold" />
                      </div>
                   </div>
                   <div className="space-y-2">
                      <label className="block text-[10px] font-bold text-[#6d7175] uppercase tracking-widest">Antall (Qty)</label>
                      <input type="number" placeholder="36" className="w-full px-4 py-3 bg-white/60 border border-white/80 rounded-xl focus:ring-4 focus:ring-blue-500/5 outline-none font-bold" />
                   </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                   <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-[#6d7175]">Forventet Margin</span>
                      <span className="text-xs font-bold text-[#108043]">35.4%</span>
                   </div>
                   <div className="flex items-center justify-between">
                      <span className="text-xs text-[#6d7175]">ROI (ROI)</span>
                      <span className="text-xs font-bold text-[#108043]">54.7%</span>
                   </div>
                </div>

                <button 
                  onClick={() => setStep(3)}
                  className="w-full py-4 bg-[#1a1a1a] text-white rounded-2xl font-bold flex items-center justify-center shadow-xl shadow-black/10 hover:bg-black transition-all"
                >
                   Syntetiser & Legg til Shopify
                </button>
             </div>
           )}

           {step === 3 && (
             <div className="text-center space-y-6 py-8 animate-in zoom-in-95">
                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                   <CheckCircle2 size={48} className="text-[#108043]" />
                </div>
                <h2 className="text-2xl font-black text-[#1a1a1a]">Produktet er lagt til!</h2>
                <p className="text-sm text-[#6d7175] max-w-xs mx-auto">
                   151 Booster Packs er nå synkronisert med din Shopify-butikk og vaktmester-motoren er aktivert.
                </p>
                <div className="pt-6 flex flex-col space-y-3">
                  <Link 
                    href="/"
                    className="w-full py-3 bg-[#f1f2f3] text-[#1a1a1a] rounded-xl font-bold text-xs"
                  >
                    Tilbake til Dashbord
                  </Link>
                  <button 
                    onClick={() => setStep(1)}
                    className="w-full py-3 text-[#005bd3] font-bold text-xs hover:underline"
                  >
                    Legg til enda et produkt
                  </button>
                </div>
             </div>
           )}
        </div>
      </div>
    </DashboardShell>
  );
}
