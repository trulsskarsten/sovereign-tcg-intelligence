"use client";

import React, { useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import { 
  Activity, 
  Server, 
  RefreshCcw, 
  ShieldCheck, 
  AlertCircle,
  CheckCircle2,
  Clock,
  Terminal,
  Database
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function OperationalHealth() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Mock Health States
  const services = [
    { name: "Stealth Scraper", status: "online", lastPulse: "3 min siden", health: 98.4, icon: Server },
    { name: "Shopify Sync Engine", status: "online", lastPulse: "1 min siden", health: 100, icon: RefreshCcw },
    { name: "Discord Alert Bridge", status: "online", lastPulse: "12 min siden", health: 100, icon: Activity },
    { name: "Panic Lock Sentinel", status: "active", lastPulse: "Nå", health: 100, icon: ShieldCheck },
  ];

  const auditLogs = [
    { id: 1, type: "info", message: "Markedssjekk fullført (Outland, Pokepris)", time: "12:45", date: "IDAG" },
    { id: 2, type: "warning", message: "Sikkerhets-sperre utløst: 151 Ultra Premium Collection oversteg 300kr grense", time: "11:20", date: "IDAG" },
    { id: 3, type: "success", message: "Automatisk pris-oppdatering pushet til Shopify (8 produkter)", time: "09:00", date: "IDAG" },
    { id: 4, type: "error", message: "Bot-deteksjon blokkerte forespørsel til Outland (Cool-down aktivert)", time: "06:15", date: "IDAG" },
  ];

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <DashboardShell>
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-[#202223] tracking-tight">Operasjonell Helse</h1>
            <p className="text-sm text-[#6d7175] mt-1">Sanntids telemetri for systemets kjerne-tjenester og sikkerhets-logg.</p>
          </div>
          <button 
            onClick={handleRefresh}
            className="polaris-btn-secondary flex items-center"
          >
            <RefreshCcw size={16} className={cn("mr-2", isRefreshing && "animate-spin")} /> Oppdater Status
          </button>
        </div>

        {/* Service Status Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {services.map((service) => (
            <div key={service.name} className="polaris-card p-6 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-[#f1f2f3] rounded-full flex items-center justify-center text-[#202223] mb-4">
                <service.icon size={24} />
              </div>
              <h3 className="text-xs font-bold text-[#202223] uppercase tracking-wider">{service.name}</h3>
              <div className="mt-2 flex items-center">
                <div className={cn(
                  "w-1.5 h-1.5 rounded-full mr-2",
                  service.status === "online" || service.status === "active" ? "bg-[#108043]" : "bg-[#c02d2d]"
                )} />
                <span className="text-[10px] font-bold text-[#6d7175] uppercase">{service.status}</span>
              </div>
              <div className="mt-4 w-full bg-[#f1f2f3] h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-[#108043] h-full transition-all duration-1000" 
                  style={{ width: `${service.health}%` }} 
                />
              </div>
              <div className="mt-2 flex justify-between w-full text-[9px] text-[#6d7175]">
                <span>Puls: {service.lastPulse}</span>
                <span className="font-bold">{service.health}% helse</span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Audit Log */}
          <div className="lg:col-span-2 polaris-card overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-[#f1f2f3] flex items-center justify-between">
              <h2 className="font-semibold text-[#202223] flex items-center">
                <Terminal size={18} className="mr-2 text-[#005bd3]" /> Sikkerhets-logg
              </h2>
              <span className="text-[10px] font-bold text-[#6d7175] uppercase tracking-tighter">Siste 100 hendelser</span>
            </div>
            <div className="divide-y divide-[#f1f2f3] flex-1">
              {auditLogs.map((log) => (
                <div key={log.id} className="px-6 py-4 hover:bg-[#f9fafb] transition-colors group">
                  <div className="flex items-start">
                    <div className="flex flex-col items-center mr-6 border-r border-[#d2d5d9] pr-6">
                      <span className="text-[10px] font-bold text-[#202223]">{log.time}</span>
                      <span className="text-[8px] text-[#6d7175] uppercase tracking-tighter">{log.date}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {log.type === "error" && <AlertCircle size={14} className="text-[#c02d2d]" />}
                          {log.type === "warning" && <ShieldCheck size={14} className="text-[#f49342]" />}
                          {log.type === "success" && <CheckCircle2 size={14} className="text-[#108043]" />}
                          <p className={cn(
                            "text-sm font-medium",
                            log.type === "error" ? "text-[#c02d2d]" : "text-[#202223]"
                          )}>
                            {log.message}
                          </p>
                        </div>
                        {log.type === "warning" && (
                          <span className="text-[9px] font-bold bg-[#fff4e5] text-[#663c00] px-2 py-0.5 rounded uppercase">Margin Block</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 bg-[#f9fafb] border-t border-[#f1f2f3] text-center">
              <button className="text-[11px] font-bold text-[#005bd3] hover:underline uppercase tracking-widest">
                Se fullstendig logg
              </button>
            </div>
          </div>

          {/* Database & Sync Stats */}
          <div className="space-y-8">
            <div className="polaris-card p-6">
              <h2 className="font-semibold text-[#202223] flex items-center mb-6">
                <Database size={18} className="mr-2 text-[#005bd3]" /> Driftsdata
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#6d7175]">Prispunkter lagret</span>
                  <span className="font-bold text-[#202223]">12,842</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#6d7175]">Margin Blocks (Total)</span>
                  <span className="font-bold text-[#c02d2d]">142</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#6d7175]">Est. Tap Unngått</span>
                  <span className="font-bold text-[#108043]">4,250 kr</span>
                </div>
              </div>
            </div>

            <div className="polaris-card p-6 bg-[#f0f7ff] border-none shadow-sm">
              <div className="flex items-center text-[#005bd3] mb-4">
                <ShieldCheck size={20} className="mr-2" />
                <span className="text-xs font-bold uppercase tracking-wider">Alt i rute</span>
              </div>
              <p className="text-xs text-[#6d7175] leading-relaxed">
                Repricer-motoren overvåker nå 1,294 produkter. Ingen "Hard-Floor" brudd detektert de siste 2 timene.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
