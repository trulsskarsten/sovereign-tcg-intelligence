import { 
  CheckCircle2, 
  ShieldCheck, 
  Zap, 
  ArrowRight, 
  ArrowLeft,
  Play,
  Save,
  Info,
  Key,
  Globe,
  CheckCircle,
  AlertCircle,
  Settings2,
  RefreshCw
} from "lucide-react";
import { i18n } from "@/lib/i18n";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import React, { useState } from "react";
import { motion } from "framer-motion";

export default function SetupWizard() {
  const [step, setStep] = useState(1);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const router = useRouter();
  
  const steps = [
    { title: "Velkomst", icon: Play },
    { title: "Sikkerhet", icon: ShieldCheck },
    { title: "Aktivering", icon: Zap },
  ];

  const nextStep = () => setStep(s => Math.min(s + 1, 3));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const handleStartSync = () => {
    setIsSyncing(true);
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      setSyncProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => router.push("/"), 800);
      }
    }, 150);
  };

  return (
    <DashboardShell>
      <div className="max-w-3xl mx-auto py-12 px-4">
        {/* Progress Tracker */}
        <div className="flex items-center justify-between mb-16 px-8 relative">
          <div className="absolute top-1/2 left-0 w-full h-[1px] bg-[#f1f2f3] -z-10 transform -translate-y-1/2" />
          {steps.map((s, i) => {
            const stepNum = i + 1;
            const isCompleted = step > stepNum;
            const isActive = step === stepNum;
            
            return (
              <div key={s.title} className="flex flex-col items-center bg-[#fdfdfd] px-4">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all duration-500",
                  isCompleted ? "bg-[#1a1a1a] border-[#1a1a1a] text-white shadow-lg" : 
                  isActive ? "bg-white border-[#005bd3] text-[#005bd3] shadow-xl shadow-blue-500/10 scale-110" : 
                  "bg-white border-[#f1f2f3] text-[#6d7175]"
                )}>
                  {isCompleted ? <CheckCircle2 size={24} /> : <s.icon size={22} />}
                </div>
                <span className={cn(
                  "text-[10px] font-black mt-4 uppercase tracking-[0.15em]",
                  isActive ? "text-[#1a1a1a]" : "text-[#6d7175]"
                )}>
                  {s.title}
                </span>
              </div>
            );
          })}
        </div>

        {/* Wizard Content */}
        <div className="glass-panel p-10 min-h-[500px] flex flex-col relative overflow-hidden">
          {/* Subtle Ambient Background */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />
          
          <div className="relative z-10 flex-1 flex flex-col">
            {step === 1 && (
              <div className="text-center space-y-8 py-10">
                <div className="w-24 h-24 bg-[#1a1a1a] text-white rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-2xl rotate-3">
                  <Play size={48} className="fill-white" />
                </div>
                <div className="space-y-3">
                  <h1 className="text-3xl font-black text-[#1a1a1a] tracking-tighter">
                    {i18n.setup.welcomeTitle}
                  </h1>
                  <p className="text-sm text-[#6d7175] max-w-md mx-auto leading-relaxed">
                    Sovereign Intelligens gir deg full kontroll over din TCG-beholdning med sanntids markedsdata og automatisert prissetting.
                  </p>
                </div>
                
                <div className="pt-10 flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
                  <button onClick={() => router.push("/")} className="w-full sm:w-auto px-8 py-4 bg-[#f1f2f3] text-[#1a1a1a] rounded-2xl text-[13px] font-bold hover:bg-[#ebebeb] transition-all">
                    Se Demo først
                  </button>
                  <button onClick={nextStep} className="w-full sm:w-auto px-12 py-4 bg-[#005bd3] text-white rounded-2xl text-[13px] font-bold shadow-xl shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all">
                    Start Konfigurasjon
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-10 py-6">
                <div className="flex items-center justify-between border-b border-[#f1f2f3] pb-6">
                  <h2 className="text-xl font-black text-[#1a1a1a] flex items-center tracking-tight">
                    <ShieldCheck size={28} className="mr-3 text-[#005bd3]" /> Sikkerhetsregler
                  </h2>
                  <span className="text-[10px] font-black bg-blue-50 text-[#005bd3] px-3 py-1 rounded-full border border-blue-100 uppercase tracking-widest">Logic Engine</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <label className="text-[11px] font-black text-[#1a1a1a] uppercase tracking-wider">Minstemargin (Hard Floor)</label>
                      <Info size={14} className="text-[#6d7175]" />
                    </div>
                    <div className="relative">
                      <input 
                        type="number" 
                        defaultValue="15" 
                        className="w-full bg-[#f9fafb] border border-[#f1f2f3] rounded-2xl px-6 py-4 text-xl font-bold focus:ring-2 focus:ring-[#005bd3] outline-none transition-all"
                      />
                      <span className="absolute right-6 top-1/2 -translate-y-1/2 font-bold text-[#6d7175]">%</span>
                    </div>
                    <p className="text-[10px] text-[#6d7175] leading-relaxed">
                      Sovereign vil aldri foreslå eller godkjenne en pris som gir lavere margin enn dette gulvet.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <label className="text-[11px] font-black text-[#1a1a1a] uppercase tracking-wider">Autopilot-tags</label>
                      <Settings2 size={14} className="text-[#6d7175]" />
                    </div>
                    <div className="relative">
                      <input 
                        type="text" 
                        defaultValue="SOV_AUTO" 
                        className="w-full bg-[#f9fafb] border border-[#f1f2f3] rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-[#005bd3] outline-none transition-all uppercase tracking-widest"
                      />
                    </div>
                    <p className="text-[10px] text-[#6d7175] leading-relaxed">
                      Kun produkter med denne taggen i Shopify vil bli håndtert automatisk av prisskjermen.
                    </p>
                  </div>
                </div>

                <div className="p-6 bg-blue-50/50 border border-blue-100 rounded-3xl mt-8">
                  <div className="flex items-start">
                    <Info size={20} className="text-[#005bd3] mr-4 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-[#1a1a1a] mb-1 italic">Sovereign Intelligence beskytter dine verdier</p>
                      <p className="text-[11px] text-[#6d7175] leading-relaxed">
                        Som B2B-klient er du sikret mot prisfeil og margin-dumping gjennom våre krypterte sikkerhetslag. Databasen din er ferdig konfigurert i skyen.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="flex flex-col items-center justify-center flex-1 py-10 space-y-10">
                {!isSyncing ? (
                  <>
                    <div className="text-center space-y-4">
                      <div className="w-24 h-24 bg-[#005bd3] text-white rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-2xl relative">
                        <motion.div 
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="absolute inset-0 bg-[#005bd3]/20 rounded-full blur-xl"
                        />
                        <Zap size={48} className="relative z-10 fill-white" />
                      </div>
                      <h2 className="text-3xl font-black text-[#1a1a1a] tracking-tighter">Klar for Oppskyting?</h2>
                      <p className="text-sm text-[#6d7175] max-w-sm mx-auto leading-relaxed">
                        Vi skal nå hente din varebeholdning fra Shopify og koble den mot gjeldende markedspriser i Norge.
                      </p>
                    </div>

                    <button 
                      onClick={handleStartSync}
                      className="group relative w-full max-w-xs overflow-hidden rounded-2xl bg-[#1a1a1a] px-12 py-5 text-white transition-all hover:scale-105 active:scale-95"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-emerald-500 opacity-0 group-hover:opacity-20 transition-opacity" />
                      <span className="relative z-10 font-black tracking-widest uppercase text-sm flex items-center justify-center">
                        Aktiver Sovereign <ArrowRight className="ml-3 group-hover:translate-x-2 transition-transform" size={20} />
                      </span>
                    </button>
                  </>
                ) : (
                  <div className="w-full max-w-md space-y-8 text-center pt-10">
                    <div className="space-y-4">
                      <RefreshCw size={48} className="animate-spin text-[#005bd3] mx-auto" />
                      <h3 className="text-xl font-bold text-[#1a1a1a]">Synkroniserer Varebeholdning...</h3>
                      <p className="text-[11px] font-black text-[#6d7175] uppercase tracking-widest">Dette tar kun et lite øyeblikk</p>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="w-full h-3 bg-[#f1f2f3] rounded-full overflow-hidden shadow-inner">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${syncProgress}%` }}
                          className="h-full bg-gradient-to-r from-[#005bd3] to-blue-400"
                        />
                      </div>
                      <div className="flex justify-between text-[10px] font-black text-[#1a1a1a] uppercase">
                        <span>Laster Variabler</span>
                        <span>{syncProgress}%</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Navigation Buttons */}
            {!isSyncing && (
              <div className="pt-10 flex items-center justify-between border-t border-[#f1f2f3] mt-auto">
                {step > 1 ? (
                  <button onClick={prevStep} className="flex items-center text-[11px] font-black uppercase tracking-widest text-[#6d7175] hover:text-[#1a1a1a] transition-all">
                    <ArrowLeft size={16} className="mr-2" /> Tilbake
                  </button>
                ) : <div />}
                
                <div className="flex space-x-6 items-center">
                  <span className="text-[10px] font-black text-[#d2d5d9] uppercase tracking-widest">Steg {step} av 3</span>
                  {step < 3 && (
                    <button onClick={nextStep} className="flex items-center text-[11px] font-black uppercase tracking-widest text-[#005bd3] hover:translate-x-1 transition-transform">
                      Neste Trinn <ArrowRight size={16} className="ml-2" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
