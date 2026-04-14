"use client";

import React from 'react';
import DashboardShell from '@/components/DashboardShell';
import {
  HelpCircle,
  BookOpen,
  ShieldCheck,
  ChevronRight,
  Clock
} from 'lucide-react';
import FeedbackWidget from '@/components/support/FeedbackWidget';

export default function SupportHub() {
  const faqs = [
    {
      q: "Hva er ABC-klassifiseringen?",
      a: "Systemet deler lageret ditt i tre: Klasse A (Grails/Premium), Klasse B (Stabil vekst) og Klasse C (Volumvarer). Dette hjelper deg å prioritere prising."
    },
    {
      q: "Hva gjør 'Panic Lock'?",
      a: "Hvis markedet faller med mer enn 5% på 24 timer, fryser systemet alle automatiske oppdateringer for å beskytte din kapital."
    },
    {
      q: "Hvor ofte oppdateres prisene?",
      a: "Som standard sjekker vi markedet hver time, men du kan velge hyppigere intervaller i dine innstillinger."
    }
  ];

  return (
    <DashboardShell>
      <div className="max-w-5xl mx-auto py-12 px-6">
        <div className="mb-12">
           <h1 className="text-3xl font-black text-[#1a1a1a] tracking-tight mb-2">Support & Veiledning</h1>
           <p className="text-[#6d7175] text-sm font-medium">Alt du trenger for å drifte din butikk med Sovereign-intelligens.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* Documentation Cards */}
          <div className="premium-card p-8 group">
             <div className="w-12 h-12 bg-blue-50 text-[#005bd3] rounded-2xl flex items-center justify-center mb-6">
                <BookOpen size={24} />
             </div>
             <h3 className="text-lg font-black text-[#1a1a1a] mb-2">Brukermanual</h3>
             <p className="text-xs text-[#6d7175] leading-relaxed mb-6">
                Lær hvordan du setter opp din første synkronisering og konfigurerer dine profitt-marginer korrekt.
             </p>
             <button className="flex items-center text-xs font-black text-[#005bd3] uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                Les Guiden <ChevronRight size={14} className="ml-1" />
             </button>
          </div>

          <div className="premium-card p-8 group">
             <div className="w-12 h-12 bg-green-50 text-[#108043] rounded-2xl flex items-center justify-center mb-6">
                <ShieldCheck size={24} />
             </div>
             <h3 className="text-lg font-black text-[#1a1a1a] mb-2">Sikkerhet & Samsvar</h3>
             <p className="text-xs text-[#6d7175] leading-relaxed mb-6">
                Informasjon om hvordan vi håndterer dine data og sikrer at dine Shopify-fullmakter alltid er trygge.
             </p>
             <button className="flex items-center text-xs font-black text-[#108043] uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                Se Retningslinjer <ChevronRight size={14} className="ml-1" />
             </button>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="glass-panel p-10 rounded-[3rem] mb-12 bg-white/40 border-white/60">
           <div className="flex items-center space-x-3 mb-10">
              <HelpCircle size={24} className="text-[#1a1a1a]" />
              <h2 className="text-xl font-black text-[#1a1a1a]">Ofte Stilte Spørsmål</h2>
           </div>
           
           <div className="space-y-8">
              {faqs.map((faq, i) => (
                <div key={i} className="space-y-2">
                   <p className="text-sm font-black text-[#1a1a1a]">{faq.q}</p>
                   <p className="text-xs text-[#6d7175] leading-relaxed">{faq.a}</p>
                </div>
              ))}
           </div>
        </div>

        {/* Maintenance Info */}
        <div className="flex flex-col md:flex-row items-center justify-between p-8 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
           <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <Clock size={20} className="text-[#6d7175]" />
              <div>
                 <p className="text-xs font-bold text-[#1a1a1a]">Neste Systemvedlikehold</p>
                 <p className="text-[10px] text-[#6d7175]">Søndag 12. April, kl. 03:00 - 04:00</p>
              </div>
           </div>
           <div className="flex items-center space-x-2 text-[10px] font-black uppercase text-[#108043] bg-green-50 px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-[#108043] rounded-full animate-pulse" />
              Alt Systemer Operative
           </div>
        </div>
      </div>
      
      {/* Integrated Feedback Widget */}
      <FeedbackWidget />
    </DashboardShell>
  );
}
