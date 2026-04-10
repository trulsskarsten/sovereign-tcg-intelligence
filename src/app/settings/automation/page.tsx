"use client";

import React, { useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import { 
  Shield, 
  Settings2, 
  BellRing, 
  MessageSquare, 
  Zap,
  Save,
  AlertOctagon,
  Info,
  ShieldAlert
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function AutomationSettings() {
  const [isSaving, setIsSaving] = useState(false);
  
  // Mock Settings State
  const [settings, setSettings] = useState({
    isAutopilotActive: true,
    useTagOnly: true,
    autopilotTag: "auto-pris",
    maxPercentChange: 15,
    maxAbsoluteChange: 200,
    marginSafetyBuffer: 5,
    discordWebhook: "",
    panicThreshold: 10,
    dailyDigestTime: "09:00"
  });

  const [setupStep, setSetupStep] = useState(1);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 800);
  };

  return (
    <DashboardShell>
      <div className="max-w-4xl mx-auto space-y-8 pb-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#202223] tracking-tight">Automasjon & Sikkerhet</h1>
            <p className="text-sm text-[#6d7175] mt-1">Konfigurer hvordan plattformen skal håndtere markedsendringer autonomt.</p>
          </div>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="polaris-btn-primary flex items-center min-w-[120px] justify-center"
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <><Save size={16} className="mr-2" /> Lagre endringer</>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {/* Section 1: Core Automation */}
          <div className="polaris-card">
            <div className="px-6 py-4 border-b border-[#f1f2f3] flex items-center">
              <Zap size={18} className="text-[#005bd3] mr-3" />
              <h2 className="font-semibold text-[#202223]">Hovedkontroll</h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-bold text-[#202223] block">Aktiver Autopilot</label>
                  <p className="text-xs text-[#6d7175]">Tillat systemet å oppdatere priser i Shopify automatisk innenfor trygge rammer.</p>
                </div>
                <button 
                  onClick={() => setSettings({...settings, isAutopilotActive: !settings.isAutopilotActive})}
                  className={cn(
                    "w-12 h-6 rounded-full p-1 transition-colors duration-200",
                    settings.isAutopilotActive ? "bg-[#108043]" : "bg-[#d2d5d9]"
                  )}
                >
                  <div className={cn(
                    "w-4 h-4 bg-white rounded-full transition-transform duration-200",
                    settings.isAutopilotActive ? "translate-x-6" : "translate-x-0"
                  )} />
                </button>
              </div>

              <div className="pt-4 border-t border-[#f1f2f3]">
                <label className="text-xs font-bold text-[#202223] uppercase tracking-wider mb-2 block">Trigger-metode</label>
                <div className="flex items-center space-x-4">
                  <button 
                    onClick={() => setSettings({...settings, useTagOnly: true})}
                    className={cn(
                      "flex-1 p-3 rounded-lg border text-left transition-all",
                      settings.useTagOnly ? "border-[#005bd3] bg-[#f0f7ff]" : "border-[#d2d5d9] hover:bg-[#f9fafb]"
                    )}
                  >
                    <p className="text-xs font-bold text-[#202223]">Tag-basert</p>
                    <p className="text-[10px] text-[#6d7175] mt-1">Bare oppdater produkter merket med en spesifikk tag.</p>
                  </button>
                  <button 
                    onClick={() => setSettings({...settings, useTagOnly: false})}
                    className={cn(
                      "flex-1 p-3 rounded-lg border text-left transition-all",
                      !settings.useTagOnly ? "border-[#005bd3] bg-[#f0f7ff]" : "border-[#d2d5d9] hover:bg-[#f9fafb]"
                    )}
                  >
                    <p className="text-xs font-bold text-[#202223]">Global (Alle)</p>
                    <p className="text-[10px] text-[#6d7175] mt-1">Vurder alle produkter i butikken for automatisering.</p>
                  </button>
                </div>
                
                {settings.useTagOnly && (
                  <div className="mt-4">
                    <label className="text-[10px] font-bold text-[#6d7175] uppercase tracking-wider mb-1 block">Shopify Tag</label>
                    <input 
                      type="text"
                      value={settings.autopilotTag}
                      onChange={(e) => setSettings({...settings, autopilotTag: e.target.value})}
                      className="polaris-input text-xs"
                      placeholder="e.g., auto-pris"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Safety Tiers */}
          <div className="polaris-card">
            <div className="px-6 py-4 border-b border-[#f1f2f3] flex items-center">
              <Shield size={18} className="text-[#108043] mr-3" />
              <h2 className="font-semibold text-[#202223]">Sikkerhets-sperrer (Guardrails)</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="text-sm font-bold text-[#202223] block">Maksimal endring (%)</label>
                  <p className="text-xs text-[#6d7175] mb-4">Blokker endringer som overstiger denne prosenten.</p>
                  <div className="flex items-center space-x-4">
                    <input 
                      type="range" 
                      min="1" max="50"
                      value={settings.maxPercentChange}
                      onChange={(e) => setSettings({...settings, maxPercentChange: parseInt(e.target.value)})}
                      className="flex-1 accent-[#005bd3]"
                    />
                    <span className="text-sm font-bold w-12 text-right">{settings.maxPercentChange}%</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-bold text-[#202223] block">Hard-Floor Sikkerhetsmargin (%)</label>
                  <p className="text-xs text-[#6d7175] mb-4">Absolutt bunngrense over Innkjøp+MVA (Race to the bottom beskyttelse).</p>
                  <div className="flex items-center space-x-2">
                    <input 
                      type="number"
                      value={settings.marginSafetyBuffer}
                      onChange={(e) => setSettings({...settings, marginSafetyBuffer: parseInt(e.target.value)})}
                      className="polaris-input text-sm w-32 font-bold text-[#108043]"
                    />
                    <span className="text-xs font-medium text-[#6d7175]">% Buffer</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-[#f1f2f3]">
                <div>
                  <label className="text-sm font-bold text-[#202223] block">Absolutt grense (Kr)</label>
                  <p className="text-xs text-[#6d7175] mb-4">Maksimal krone-endring per autopilot-steg.</p>
                  <div className="flex items-center space-x-2">
                    <input 
                      type="number"
                      value={settings.maxAbsoluteChange}
                      onChange={(e) => setSettings({...settings, maxAbsoluteChange: parseInt(e.target.value)})}
                      className="polaris-input text-sm w-32"
                    />
                    <span className="text-xs font-medium text-[#6d7175]">NOK</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-4 bg-[#fff4f4] border border-[#f9caca] rounded-lg flex items-start">
                <AlertOctagon size={18} className="text-[#c02d2d] mr-3 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-[#c02d2d] uppercase tracking-wider">Panic Lock (Systembryter)</p>
                  <p className="text-xs text-[#6d7175] mt-1">
                    Systemet vil slå seg helt av hvis det oppstår mer enn 
                    <input 
                      type="number" 
                      value={settings.panicThreshold} 
                      onChange={(e) => setSettings({...settings, panicThreshold: parseInt(e.target.value)})}
                      className="mx-2 w-12 text-center border-b border-[#f9caca] bg-transparent font-bold text-[#202223] focus:outline-none"
                    /> 
                    sikkerhets-sperrer i løpet av én time.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Notifications */}
          <div className="polaris-card">
            <div className="px-6 py-4 border-b border-[#f1f2f3] flex items-center">
              <BellRing size={18} className="text-[#f49342] mr-3" />
              <h2 className="font-semibold text-[#202223]">Varslinger (Sovereign Alerts)</h2>
            </div>
            <div className="p-6 space-y-8">
              {/* Discord Wizard */}
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <label className="text-sm font-bold text-[#202223] flex items-center">
                    <MessageSquare size={16} className="mr-2 text-[#5865F2]" /> Discord Webhook Veiviser
                  </label>
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3].map(step => (
                      <div key={step} className={cn(
                        "w-6 h-1 rounded-full",
                        setupStep >= step ? "bg-[#5865F2]" : "bg-[#f1f2f3]"
                      )} />
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-[#f9fafb] p-6 rounded-xl border border-[#ebebeb]">
                  <div className="space-y-4">
                    {setupStep === 1 && (
                      <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                        <p className="text-xs font-bold text-[#202223] uppercase tracking-wider mb-2">Steg 1: Finn Integrasjoner</p>
                        <p className="text-xs text-[#6d7175] leading-relaxed">
                          Gå til kanal-innstillinger i din Discord-server, velg <strong>Integrasjoner</strong> og klikk på <strong>Webhooks</strong>.
                        </p>
                        <button onClick={() => setSetupStep(2)} className="mt-4 polaris-btn-secondary text-[10px]">Neste steg</button>
                      </div>
                    )}
                    {setupStep === 2 && (
                      <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                        <p className="text-xs font-bold text-[#202223] uppercase tracking-wider mb-2">Steg 2: Opprett Webhook</p>
                        <p className="text-xs text-[#6d7175] leading-relaxed">
                          Trykk på <strong>Ny Webhook</strong>, gi den et navn (f.eks "TCG Ops") og klikk på <strong>Kopier Webhook URL</strong>.
                        </p>
                        <button onClick={() => setSetupStep(3)} className="mt-4 polaris-btn-secondary text-[10px]">Neste steg</button>
                      </div>
                    )}
                    {setupStep === 3 && (
                      <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                        <p className="text-xs font-bold text-[#202223] uppercase tracking-wider mb-2">Steg 3: Lim inn URL</p>
                        <p className="text-xs text-[#6d7175] leading-relaxed mb-4">
                          Lim inn adressen du kopierte nedenfor og trykk på verifiser.
                        </p>
                        <div className="space-y-4 pt-4">
                          <div className="grid gap-2">
                            <label className="text-[12px] font-bold text-[#202223] uppercase tracking-wider">Status-kanal URL (Prisendringer)</label>
                            <div className="flex space-x-2">
                              <input 
                                className="flex-1 polaris-input bg-[#f6f6f7]" 
                                placeholder="https://discord.com/api/webhooks/..."
                                value={settings.discordWebhook}
                                onChange={(e) => setSettings({...settings, discordWebhook: e.target.value})}
                              />
                              <button className="polaris-btn-secondary py-2">Test</button>
                            </div>
                          </div>
                          <p className="text-[11px] text-[#6d7175] flex items-center bg-[#f1f2f3] p-2 rounded">
                            <Info size={14} className="mr-2" />
                            Status-kanalen vil motta daglige oppdateringer om Auto-Pilot operasjoner.
                          </p>
                        </div>
                        <button onClick={() => setSetupStep(1)} className="mt-4 polaris-btn-secondary text-[10px]">Start på nytt</button>
                      </div>
                    )}
                  </div>
                  <div className="aspect-video bg-white rounded-lg border border-[#d2d5d9] flex items-center justify-center overflow-hidden relative shadow-inner">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#5865F2]/5 to-transparent" />
                    <p className="text-[10px] font-bold text-[#6d7175] uppercase tracking-widest">[GIF: DISCORD SETUP STEP {setupStep}]</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Sovereign Auto-Pilot */}
          <div className="premium-card p-10 bg-gradient-to-br from-white to-[#f9fafb]">
             <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                   <div className="p-3 bg-blue-50 text-[#005bd3] rounded-2xl">
                      <Zap size={24} />
                   </div>
                   <div>
                      <h3 className="text-xl font-black text-[#1a1a1a] tracking-tight">Sovereign Auto-Pilot</h3>
                      <p className="text-xs font-bold text-[#6d7175] uppercase tracking-widest">Autonom Operasjonalisering</p>
                   </div>
                </div>
                <div className="flex items-center h-6">
                  <input type="checkbox" className="w-12 h-6 bg-gray-200 checked:bg-[#008060] rounded-full appearance-none cursor-pointer relative after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:w-4 after:h-4 after:rounded-full after:transition-all checked:after:translate-x-6" />
                </div>
             </div>

             <div className="glass-panel p-6 rounded-3xl mb-8 space-y-6 bg-white/40 border-white/60">
                <div className="flex items-start space-x-4">
                   <ShieldAlert size={20} className="text-[#005bd3] mt-1" />
                   <div className="space-y-4 flex-1">
                      <p className="text-sm font-bold text-[#1a1a1a]">Sikkerhets-rails for Auto-Pilot</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                         <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[#6d7175] uppercase tracking-wider">Maks dags-endring</label>
                            <div className="flex items-center space-x-3">
                               <input type="range" min="1" max="15" defaultValue="5" className="flex-1 accent-[#005bd3]" />
                               <span className="text-xs font-black text-[#1a1a1a]">5%</span>
                            </div>
                         </div>
                         <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[#6d7175] uppercase tracking-wider">Klasser Tillatt</label>
                            <div className="flex space-x-2">
                               <span className="px-3 py-1 bg-[#1a1a1a] text-white text-[10px] font-black rounded-lg">Klasse C</span>
                               <span className="px-3 py-1 bg-gray-100 text-gray-300 text-[10px] font-black rounded-lg">Klasse B</span>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
             </div>

             <p className="text-[10px] text-[#6d7175] italic leading-relaxed">
               Auto-Pilot er avskrudd som standard. Når aktivert vil systemet pushe prisoppdateringer for standard-varer (Klasse C) direkte til Shopify så lenge alle sikkerhets-regler er overholdt. Ingen manuell godkjenning kreves.
             </p>
             
             <div className="mt-10 pt-6 border-t border-[#f1f2f3] flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-[#202223]">Daglig Dag-oppsummering</p>
                  <p className="text-xs text-[#6d7175]">Send e-post oversikt over alle ventende godkjenninger.</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-[#6d7175]">Utsendelse kl.</span>
                  <input 
                    type="time"
                    value={settings.dailyDigestTime}
                    onChange={(e) => setSettings({...settings, dailyDigestTime: e.target.value})}
                    className="polaris-input py-1 px-2 w-24 text-xs font-bold"
                  />
                </div>
             </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
