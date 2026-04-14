"use client";

import React, { useState, useEffect } from 'react';
import DashboardShell from '@/components/DashboardShell';
import { 
  Zap, 
  ShieldAlert, 
  Target, 
  Clock, 
  Save, 
  Loader2,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';
import { clientLogger } from '@/lib/client-logger';

export default function AutomationSettings() {
  const { toast } = useToast();
  interface AutomationSettings {
    is_automation_enabled: boolean;
    floor_margin: number;
    panic_lock_threshold: number;
  }
  const [settings, setSettings] = useState<AutomationSettings>({
    is_automation_enabled: false,
    floor_margin: 10,
    panic_lock_threshold: 20
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch('/api/settings');
        const json = await res.json();
        if (json.success) setSettings(json.settings);
      } catch (err) {
        clientLogger.error('Failed to load settings', err);
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        toast('Innstillinger lagret', 'success');
      } else {
        toast('Lagring feilet', 'error');
      }
    } catch (err) {
      toast('Lagring feilet', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <DashboardShell>
      <div className="p-20 flex justify-center">
        <Loader2 className="animate-spin text-[#005bd3]" size={40} />
      </div>
    </DashboardShell>
  );

  return (
    <DashboardShell>
      <div className="max-w-4xl mx-auto py-10 px-6 space-y-10">
        <div className="flex items-end justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-[#1a1a1a] tracking-tighter">Automatisering</h1>
            <p className="text-sm text-[#6d7175] font-medium tracking-tight">Konfigurer logikken bak dine prisjusteringer.</p>
          </div>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="flex items-center px-8 py-3 bg-[#005bd3] text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
          >
            {saving ? <Loader2 size={14} className="mr-2 animate-spin" /> : <Save size={14} className="mr-2" />}
            Lagre endringer
          </button>
        </div>

        <div className="space-y-8">
           {/* Master Switch */}
           <div className={cn(
             "glass-panel p-8 flex items-center justify-between border-2 transition-all duration-500",
             settings.is_automation_enabled ? "border-blue-500/20 bg-blue-50/10" : "border-transparent"
           )}>
             <div className="flex items-center space-x-6">
                <div className={cn(
                  "p-4 rounded-2xl transition-colors",
                  settings.is_automation_enabled ? "bg-blue-100 text-[#005bd3]" : "bg-gray-100 text-gray-400"
                )}>
                   <Zap size={28} className={cn(settings.is_automation_enabled && "animate-pulse")} />
                </div>
                <div>
                   <h3 className="text-xl font-black text-[#1a1a1a] tracking-tight">Auto-pilot</h3>
                   <p className="text-sm text-[#6d7175] font-medium">Aktiver automatisk generering av pris-anbefalinger.</p>
                </div>
             </div>
             <button 
               onClick={() => setSettings({ ...settings, is_automation_enabled: !settings.is_automation_enabled })}
               className={cn(
                 "w-16 h-8 rounded-full relative transition-all duration-300",
                 settings.is_automation_enabled ? "bg-[#005bd3]" : "bg-gray-200"
               )}
             >
                <div className={cn(
                  "absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg transition-all duration-300",
                  settings.is_automation_enabled ? "left-9" : "left-1"
                )} />
             </button>
           </div>

           {/* Core Parameters */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="glass-panel p-8 space-y-6">
                 <div className="flex items-center space-x-4">
                    <Target size={20} className="text-[#005bd3]" />
                    <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#1a1a1a]">Minimum Margin</h4>
                 </div>
                 <div className="space-y-4">
                    <div className="flex justify-between items-end">
                       <span className="text-4xl font-black tracking-tighter text-[#1a1a1a]">{settings.floor_margin}%</span>
                       <span className="text-[10px] font-bold text-[#6d7175] uppercase tracking-widest mb-1">Floor Limit</span>
                    </div>
                    <input 
                      type="range" 
                      min="1" max="50" 
                      value={settings.floor_margin}
                      onChange={(e) => setSettings({ ...settings, floor_margin: Number(e.target.value) })}
                      className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[#005bd3]" 
                    />
                    <p className="text-[10px] text-[#6d7175] font-medium leading-relaxed italic">
                       * Intelligens-motoren vil aldri foreslå en pris som gir lavere margin enn dette.
                    </p>
                 </div>
              </div>

              <div className="glass-panel p-8 space-y-6">
                 <div className="flex items-center space-x-4">
                    <ShieldAlert size={20} className="text-red-500" />
                    <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#1a1a1a]">Panic Lock</h4>
                 </div>
                 <div className="space-y-4">
                    <div className="flex justify-between items-end">
                       <span className="text-4xl font-black tracking-tighter text-[#1a1a1a]">{settings.panic_lock_threshold}%</span>
                       <span className="text-[10px] font-bold text-[#6d7175] uppercase tracking-widest mb-1">Max Endring</span>
                    </div>
                    <input 
                      type="range" 
                      min="5" max="50" 
                      value={settings.panic_lock_threshold}
                      onChange={(e) => setSettings({ ...settings, panic_lock_threshold: Number(e.target.value) })}
                      className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[#005bd3]" 
                    />
                    <p className="text-[10px] text-[#6d7175] font-medium leading-relaxed italic">
                       * Markeds-justeringer som overstiger denne prosenten vil kreve TO-FA godkjenning.
                    </p>
                 </div>
              </div>
           </div>

           {/* Information Banner */}
           <div className="bg-blue-50/50 border border-blue-100 rounded-3xl p-8 flex space-x-6">
              <Info className="text-blue-500 shrink-0" size={24} />
              <div className="space-y-2">
                 <h4 className="text-xs font-black text-[#005bd3] uppercase tracking-widest">Viktig Informasjon</h4>
                 <p className="text-[11px] text-[#6d7175] font-medium leading-relaxed">
                   Endringer her påvirker hvordan motoren regner ut anbefalte priser. Hvis du setter for høy minimums-margin, kan du miste konkurransekraft på lav-margin produkter som Booster-bokser.
                 </p>
              </div>
           </div>
        </div>
      </div>
    </DashboardShell>
  );
}
