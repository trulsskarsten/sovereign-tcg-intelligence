"use client";

import React from 'react';
import { 
  ShieldCheck, 
  TrendingUp, 
  Zap, 
  Globe, 
  Lock, 
  ChevronRight,
  Gem,
  BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function PublicShowcase() {
  return (
    <div className="min-h-screen bg-[#fdfdfd] text-[#1a1a1a] selection:bg-blue-100 selection:text-blue-900">
      {/* Dynamic Nav */}
      <nav className="fixed top-0 w-full z-50 glass-panel px-8 py-4 flex items-center justify-between">
         <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-[#1a1a1a] rounded-xl flex items-center justify-center text-white">
               <ShieldCheck size={18} />
            </div>
            <span className="font-black tracking-tighter text-lg uppercase">Sovereign TCG</span>
         </div>
         <div className="hidden md:flex items-center space-x-8 text-[11px] font-black uppercase tracking-widest text-[#6d7175]">
            <a href="#metrics" className="hover:text-[#1a1a1a] transition-colors">Metrics</a>
            <a href="#security" className="hover:text-[#1a1a1a] transition-colors">Sikkerhet</a>
            <Link href="/" className="px-4 py-2 bg-[#1a1a1a] text-white rounded-xl hover:bg-black transition-all">Launch Dashboard</Link>
         </div>
      </nav>

      <main className="pt-32 pb-24 px-6 max-w-7xl mx-auto space-y-32">
         {/* Hero Section */}
         <section className="text-center space-y-8 max-w-4xl mx-auto">
            <div className="inline-flex items-center px-4 py-1.5 bg-blue-50 text-[#005bd3] rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100 animate-pulse">
               <Zap size={14} className="mr-2" /> Live Markeds-Intelligens
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[0.9] text-balance">
               Verifisert Operasjonell <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#005bd3] to-[#008060]">Gevinst</span>.
            </h1>
            <p className="text-lg text-[#6d7175] font-medium max-w-2xl mx-auto leading-relaxed">
               En anonymisert sanntids-oversikt over suksessen til Sovereign-nettverket. Vi beskytter dine data, men feirer dine resultater.
            </p>
         </section>

         {/* Big Metrics Grid */}
         <section id="metrics" className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="premium-card p-10 flex flex-col justify-between">
               <div className="p-4 bg-green-50 text-[#108043] rounded-2xl w-fit mb-8">
                  <TrendingUp size={32} />
               </div>
               <div>
                  <p className="text-[11px] font-bold text-[#6d7175] uppercase tracking-widest mb-2">Total Ekstra Gevinst</p>
                  <h3 className="text-4xl font-black tracking-tight">312,400 kr</h3>
                  <p className="text-xs text-[#6d7175] mt-4 leading-relaxed">
                    Hentet inn gjennom automatisk prissammenligning og strategisk arbitrage.
                  </p>
               </div>
            </div>

            <div className="premium-card p-10 flex flex-col justify-between relative overflow-hidden group">
               <div className="p-4 bg-blue-50 text-[#005bd3] rounded-2xl w-fit mb-8">
                  <Gem size={32} />
               </div>
               <div className="relative z-10">
                  <p className="text-[11px] font-bold text-[#6d7175] uppercase tracking-widest mb-2">Lagerverdi Beskyttet</p>
                  <h3 className="text-4xl font-black tracking-tight">4.2M kr</h3>
                  <p className="text-xs text-[#6d7175] mt-4 leading-relaxed">
                    Overvåkes 24/7 av "Panic Lock" og autonome sikkerhets-rails.
                  </p>
               </div>
               <BarChart3 size={120} className="absolute right-[-2rem] bottom-[-2rem] text-[#1a1a1a]/5 -rotate-12 group-hover:rotate-0 transition-transform duration-700" />
            </div>

            <div className="premium-card p-10 flex flex-col justify-between">
               <div className="p-4 bg-gray-50 text-[#1a1a1a] rounded-2xl w-fit mb-8">
                  <Globe size={32} />
               </div>
               <div>
                  <p className="text-[11px] font-bold text-[#6d7175] uppercase tracking-widest mb-2">Globale Prispunkter</p>
                  <h3 className="text-4xl font-black tracking-tight">1.2M+</h3>
                  <p className="text-xs text-[#6d7175] mt-4 leading-relaxed">
                    Analyseres daglig for å finne de beste mulighetene for din butikk.
                  </p>
               </div>
            </div>
         </section>

         {/* Trust & Privacy Section */}
         <section id="security" className="glass-panel p-16 rounded-[4rem] text-center space-y-12">
            <div className="max-w-2xl mx-auto space-y-6">
               <h2 className="text-3xl font-black tracking-tight">Total Anonymitet. Full Innsikt.</h2>
               <p className="text-sm text-[#6d7175] leading-relaxed">
                 Public Showcase bruker aggregerte data. Vi viser aldri din kost-pris, ditt butikknavn eller dine spesielle produktdetaljer til omverdenen. Sovereign-laget er bygget for konfidensialitet.
               </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
               {[
                 { label: "End-to-End Encryption", icon: Lock },
                 { label: "Verified Data Punts", icon: CheckCircle2 },
                 { label: "GDPR Compliant", icon: ShieldCheck },
                 { label: "SOC2 Ready Layers", icon: Zap }
               ].map((item, i) => (
                 <div key={i} className="flex flex-col items-center space-y-3">
                    <div className="w-10 h-10 bg-white/60 rounded-xl flex items-center justify-center border border-white/80 shadow-sm">
                       <item.icon size={18} className="text-[#1a1a1a]" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#1a1a1a]/80">{item.label}</span>
                 </div>
               ))}
            </div>
         </section>

         {/* Call to Action */}
         <section className="text-center space-y-10 py-16">
            <h2 className="text-4xl font-black tracking-tight leading-none italic">
               Ready to go Sovereign?
            </h2>
            <div className="flex items-center justify-center space-x-6">
               <Link href="/setup" className="px-8 py-4 bg-[#1a1a1a] text-white rounded-2xl font-black text-sm flex items-center shadow-2xl hover:bg-black transition-all active:scale-95 group">
                  Start Beta Setup <ChevronRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
               </Link>
            </div>
         </section>
      </main>

      <footer className="px-6 py-12 border-t border-[#f1f2f3] text-center">
         <p className="text-[10px] font-bold text-[#6d7175] uppercase tracking-widest">
            © 2026 Sovereign TCG Intelligence. Built for high-velocity merchants.
         </p>
      </footer>
    </div>
  );
}

function CheckCircle2({ size, className }: { size: number, className: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/>
    </svg>
  );
}
