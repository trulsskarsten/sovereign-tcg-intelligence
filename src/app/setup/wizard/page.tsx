"use client";

import React, { useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import { 
  CheckCircle2, 
  Database, 
  ShoppingBag, 
  Bell, 
  ArrowRight, 
  ArrowLeft,
  Play,
  Save,
  Info,
  Key,
  Globe,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { i18n } from "@/lib/i18n";
import { useRouter } from "next/navigation";

export default function SetupWizard() {
  const [step, setStep] = useState(1);
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionSuccess, setConnectionSuccess] = useState<boolean | null>(null);
  const router = useRouter();
  
  const steps = [
    { title: "Velkomst", icon: Play },
    { title: "Database", icon: Database },
    { title: "Shopify", icon: ShoppingBag },
    { title: "Varslinger", icon: Bell },
  ];

  const nextStep = () => setStep(s => Math.min(s + 1, 4));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const handleTestConnection = () => {
    setTestingConnection(true);
    setTimeout(() => {
      setTestingConnection(false);
      setConnectionSuccess(true);
    }, 1500);
  };

  return (
    <DashboardShell>
      <div className="max-w-3xl mx-auto py-8">
        {/* Progress Tracker */}
        <div className="flex items-center justify-between mb-12 px-4 relative">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-[#d2d5d9] -z-10 transform -translate-y-1/2" />
          {steps.map((s, i) => {
            const stepNum = i + 1;
            const isCompleted = step > stepNum;
            const isActive = step === stepNum;
            
            return (
              <div key={s.title} className="flex flex-col items-center bg-[#f6f6f7] px-2">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                  isCompleted ? "bg-[#005bd3] border-[#005bd3] text-white" : 
                  isActive ? "bg-white border-[#005bd3] text-[#005bd3] shadow-md" : 
                  "bg-white border-[#d2d5d9] text-[#6d7175]"
                )}>
                  {isCompleted ? <CheckCircle2 size={20} /> : <s.icon size={20} />}
                </div>
                <span className={cn(
                  "text-[10px] font-bold mt-2 uppercase tracking-wider",
                  isActive ? "text-[#005bd3]" : "text-[#6d7175]"
                )}>
                  {s.title}
                </span>
              </div>
            );
          })}
        </div>

        {/* Wizard Content */}
        <div className="polaris-card p-8 min-h-[450px] flex flex-col">
          {step === 1 && (
            <div className="text-center space-y-6 py-8">
              <div className="w-20 h-20 bg-[#f1f8fe] text-[#005bd3] rounded-full flex items-center justify-center mx-auto mb-6">
                <Play size={40} />
              </div>
              <h1 className="text-2xl font-bold text-[#202223]">{i18n.setup.welcomeTitle}</h1>
              <p className="text-[#6d7175] max-w-lg mx-auto">
                {i18n.setup.welcomeSub} Vi hjelper deg å koble sammen lagerbeholdning og markedspriser på få minutter.
              </p>
              
              <div className="pt-8 flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                <button onClick={() => router.push("/")} className="w-full sm:w-auto polaris-btn-secondary px-8 py-3 flex items-center justify-center group">
                  <Play size={18} className="mr-2 text-[#005bd3] group-hover:scale-110 transition-transform" />
                  {i18n.setup.startDemo}
                </button>
                <button onClick={nextStep} className="w-full sm:w-auto polaris-btn-primary px-12 py-3">
                  Start konfigurasjon
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-[#202223] flex items-center">
                <Database size={24} className="mr-3 text-[#005bd3]" /> 1. Oppsett av Database
              </h2>
              <div className="p-4 bg-[#f9fafb] rounded-lg border border-[#d2d5d9] space-y-4">
                <div className="flex items-start">
                  <div className="w-6 h-6 rounded-full bg-[#005bd3] text-white flex items-center justify-center text-[10px] font-bold mt-0.5 flex-shrink-0">1</div>
                  <p className="ml-3 text-sm text-[#202223]">Kjør SQL-migreringen i din Supabase SQL Editor.</p>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 rounded-full bg-[#005bd3] text-white flex items-center justify-center text-[10px] font-bold mt-0.5 flex-shrink-0">2</div>
                  <p className="ml-3 text-sm text-[#202223]">Lim inn din <code className="bg-[#f1f2f3] px-1 rounded">SUPABASE_URL</code> og <code className="bg-[#f1f2f3] px-1 rounded">SERVICE_ROLE_KEY</code> i din konfigurasjonsfil.</p>
                </div>
              </div>
              <div className="flex items-center p-3 bg-[#fff4f4] rounded-md text-[#c02d2d] text-xs">
                <AlertCircle size={16} className="mr-2 flex-shrink-0" />
                Viktig: Del aldri din Service Role Key med andre.
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-[#202223] flex items-center">
                <ShoppingBag size={24} className="mr-3 text-[#005bd3]" /> 2. Koble til Shopify
              </h2>
              <p className="text-sm text-[#6d7175]">
                Skriv inn dine app-legitimasjoner fra Shopify Partner Dashboard for å aktivere automatisk prissynkronisering.
              </p>
              
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#202223] uppercase tracking-wide">Butikk-domene</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6d7175]" size={16} />
                    <input type="text" placeholder="butikk-navn.myshopify.com" className="polaris-input pl-10 h-10" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#202223] uppercase tracking-wide">Client ID</label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6d7175]" size={16} />
                      <input type="password" placeholder="••••••••" className="polaris-input pl-10 h-10" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#202223] uppercase tracking-wide">Client Secret</label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6d7175]" size={16} />
                      <input type="password" placeholder="shpss_••••" className="polaris-input pl-10 h-10" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center">
                <button 
                  onClick={handleTestConnection}
                  disabled={testingConnection}
                  className="polaris-btn-secondary w-full py-2 flex items-center justify-center"
                >
                  {testingConnection ? "Tester..." : connectionSuccess ? "Tilkobling OK!" : "Test Tilkobling"}
                  {connectionSuccess && <CheckCircle className="ml-2 text-[#108043]" size={16} />}
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-[#202223] flex items-center">
                <Bell size={24} className="mr-3 text-[#005bd3]" /> 3. Aktiver Varslinger
              </h2>
              <p className="text-sm text-[#6d7175]">
                Hold deg oppdatert på prisendringer i markedet via Discord.
              </p>
              
              <div className="space-y-4">
                <div className="p-4 bg-[#f9fafb] rounded-lg border border-[#d2d5d9]">
                  <h3 className="text-xs font-bold text-[#202223] mb-3 uppercase tracking-wide">Forretningsvarsler (Discord)</h3>
                  <input type="text" placeholder="https://discord.com/api/webhooks/..." className="polaris-input h-10" />
                  <p className="text-[10px] text-[#6d7175] mt-2">Varsler om lønnsomme priskjøp og margin-endringer.</p>
                </div>
              </div>

              <div className="bg-[#e3f1df] p-6 rounded-xl text-center space-y-2 border border-[#bbe5b3]">
                <h3 className="font-bold text-[#108043]">Alt er klart!</h3>
                <p className="text-xs text-[#108043] opacity-80">Du har nå konfigurert et profesjonelt kontrollpanel for din TCG-drift.</p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="pt-8 flex items-center justify-between border-t border-[#f1f2f3] mt-auto">
            {step > 1 ? (
              <button onClick={prevStep} className="polaris-btn-secondary flex items-center text-xs px-4">
                <ArrowLeft size={14} className="mr-2" /> Tilbake
              </button>
            ) : <div />}
            
            <div className="flex space-x-3">
              <button className="polaris-btn-secondary flex items-center text-xs px-4">
                <Save size={14} className="mr-2" /> {i18n.common.saveAndExit}
              </button>
              {step < 4 ? (
                <button onClick={nextStep} className="polaris-btn-primary flex items-center text-xs px-6 py-2">
                  Neste trinn <ArrowRight size={14} className="ml-2" />
                </button>
              ) : (
                <button onClick={() => router.push("/")} className="polaris-btn-primary flex items-center text-xs px-8 py-2 bg-[#108043] border-[#108043]">
                  Gå til kontrollpanel
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
