"use client";

import React, { useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import { 
  Cpu, 
  Moon, 
  Sun, 
  BellRing, 
  Mail, 
  Clock, 
  ShieldCheck, 
  Info,
  Save,
  Coffee,
  Activity,
  Package
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function AssistantSettings() {
  const [quietHours, setQuietHours] = useState({ start: "22:00", end: "08:00" });
  const [isDigestEnabled, setIsDigestEnabled] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 1000);
  };

  return (
    <DashboardShell>
      <div className="max-w-4xl mx-auto space-y-10 font-sans">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-[#005bd3] animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#005bd3]">Sovereign Personalization</span>
            </div>
            <h1 className="text-4xl font-extrabold text-[#1a1a1a] tracking-tight">Preferanser for Assistent</h1>
            <p className="text-sm text-[#6d7175] mt-2 font-medium">Tilpass hvordan din personlige B2B-assistent kommuniserer viktige markedshendelser.</p>
          </div>
          
          <button 
            onClick={handleSave}
            className="bg-[#1a1a1a] text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-black/10 hover:bg-black transition-all flex items-center"
          >
            <Save size={14} className={cn("mr-2", isSaving && "animate-pulse")} />
            {isSaving ? "Lagrer..." : "Lagre Endringer"}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {/* Main Controls */}
          <div className="glass-panel p-10 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Quiet Hours */}
              <section className="space-y-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-blue-50 rounded-xl text-[#005bd3]">
                    <Moon size={18} />
                  </div>
                  <h2 className="text-sm font-black text-[#1a1a1a] uppercase tracking-tighter">Stille Timer (Nattmodus)</h2>
                </div>
                <p className="text-[11px] text-[#6d7175] font-medium leading-relaxed">
                  Definer når assistenten skal holde seg i ro. Viktige markedsvarsler vil bli samlet i en rapport i stedet for å sendes som direktevarsler.
                </p>
                <div className="flex items-center space-x-4">
                  <div className="flex-1 space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-[#6d7175]">Start</label>
                    <input 
                      type="time" 
                      value={quietHours.start}
                      onChange={(e) => setQuietHours({...quietHours, start: e.target.value})}
                      className="w-full bg-[#f1f2f3]/50 border-none rounded-xl px-4 py-3 text-sm font-black focus:ring-2 focus:ring-[#005bd3]/20"
                    />
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-[#6d7175]">Slutt</label>
                    <input 
                      type="time" 
                      value={quietHours.end}
                      onChange={(e) => setQuietHours({...quietHours, end: e.target.value})}
                      className="w-full bg-[#f1f2f3]/50 border-none rounded-xl px-4 py-3 text-sm font-black focus:ring-2 focus:ring-[#005bd3]/20"
                    />
                  </div>
                </div>
              </section>

              {/* Digest Policy */}
              <section className="space-y-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
                    <Coffee size={18} />
                  </div>
                  <h2 className="text-sm font-black text-[#1a1a1a] uppercase tracking-tighter">Morgen-Oppsummering</h2>
                </div>
                <p className="text-[11px] text-[#6d7175] font-medium leading-relaxed">
                  Motta en profesjonell &ldquo;Briefing&rdquo; hver morgen med oversikt over nattens markedshendelser, margin-blokkeringer og anbefalte handlinger.
                </p>
                <div className="flex items-center justify-between p-4 bg-[#f8f9fa] rounded-2xl border border-[#f1f2f3]">
                  <div className="flex items-center space-x-3">
                    <Mail size={16} className="text-[#6d7175]" />
                    <span className="text-xs font-bold text-[#1a1a1a]">Aktiver daglig rapport</span>
                  </div>
                  <button 
                    onClick={() => setIsDigestEnabled(!isDigestEnabled)}
                    className={cn(
                      "w-12 h-6 rounded-full transition-all relative",
                      isDigestEnabled ? "bg-[#108043]" : "bg-[#d2d5d9]"
                    )}
                  >
                    <div className={cn(
                      "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                      isDigestEnabled ? "right-1" : "left-1"
                    )} />
                  </button>
                </div>
              </section>
            </div>

            <hr className="border-[#f1f2f3]" />

            {/* Notification Channels */}
            <section className="space-y-8">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-50 rounded-xl text-orange-500">
                  <BellRing size={18} />
                </div>
                <h2 className="text-sm font-black text-[#1a1a1a] uppercase tracking-tighter">Varslingskanaler</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="premium-card p-6 border-none bg-[#f8f9fa] flex flex-col items-center text-center group active:scale-95 transition-all cursor-pointer">
                  <div className="w-12 h-12 glass-panel flex items-center justify-center mb-4 group-hover:bg-white">
                    <Activity size={20} className="text-[#6d7175]" />
                  </div>
                  <h3 className="text-[10px] font-black uppercase text-[#1a1a1a]">Push-varsel</h3>
                  <p className="text-[9px] font-bold text-[#6d7175] mt-1">Når appen er åpen</p>
                  <div className="mt-4 w-2 h-2 rounded-full bg-emerald-500" />
                </div>

                <div className="premium-card p-6 border-none bg-[#f8f9fa] flex flex-col items-center text-center group active:scale-95 transition-all cursor-pointer">
                  <div className="w-12 h-12 glass-panel flex items-center justify-center mb-4 group-hover:bg-white">
                    <Mail size={20} className="text-[#6d7175]" />
                  </div>
                  <h3 className="text-[10px] font-black uppercase text-[#1a1a1a]">E-post</h3>
                  <p className="text-[9px] font-bold text-[#6d7175] mt-1">Ukentlig oppsummering</p>
                  <div className="mt-4 w-2 h-2 rounded-full bg-[#f1f2f3]" />
                </div>

                <div className="premium-card p-6 border-none bg-[#f8f9fa] flex flex-col items-center text-center group active:scale-95 transition-all cursor-pointer">
                  <div className="w-12 h-12 glass-panel flex items-center justify-center mb-4 group-hover:bg-white">
                    <ShieldCheck size={20} className="text-[#6d7175]" />
                  </div>
                  <h3 className="text-[10px] font-black uppercase text-[#1a1a1a]">Discord</h3>
                  <p className="text-[9px] font-bold text-[#6d7175] mt-1">Forretningskritisk</p>
                  <div className="mt-4 w-2 h-2 rounded-full bg-emerald-500" />
                </div>
              </div>
            </section>
          </div>

          {/* Assistant Persona Info */}
          <div className="premium-card p-8 bg-gradient-to-br from-[#005bd3] to-[#00429d] border-none text-white relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-10">
                <Cpu size={120} />
             </div>
             
             <div className="flex items-center space-x-3 mb-6 relative z-10">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                  <Cpu size={18} />
                </div>
                <h2 className="text-xl font-black tracking-tighter uppercase">Møt din Assistent</h2>
             </div>
             
             <p className="text-sm font-medium leading-relaxed opacity-90 relative z-10 max-w-2xl">
                Assistenten er ikke bare en algoritme – den er din forretningspartner. Den analyserer over 12.000 prispunkter hver dag for å sikre at Sovereign-butikken din alltid er optimalisert mot Outland og Pokepris. 
                Sikkerhetsmarginene dine er dens høyeste prioritet.
             </p>

             <div className="mt-8 flex items-center space-x-6 relative z-10">
                <div className="flex flex-col">
                  <span className="text-[9px] font-black uppercase opacity-60">Status</span>
                  <span className="text-xs font-black uppercase">Operasjonell</span>
                </div>
                <div className="w-px h-8 bg-white/20" />
                <div className="flex flex-col">
                  <span className="text-[9px] font-black uppercase opacity-60">Sikkerhetsnivå</span>
                  <span className="text-xs font-black uppercase">Maksimal</span>
                </div>
             </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
