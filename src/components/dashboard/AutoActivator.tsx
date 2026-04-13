"use client";

import React, { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { clientLogger } from "@/lib/client-logger";
import { useToast } from "@/components/ui/Toast";
import { Loader2, RefreshCw, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * AutoActivator
 * Invisible component that checks for empty stores and triggers initial 
 * seeding/synchronization to ensure a great first-load experience.
 */
export function AutoActivator() {
  const { toast } = useToast();
  const pathname = usePathname();
  const activated = useRef(false);
  const [showManualTrigger, setShowManualTrigger] = useState(false);
  const [isActivating, setIsActivating] = useState(false);

  const triggerActivation = async () => {
    if (isActivating) return;
    setIsActivating(true);
    activated.current = true;
    
    try {
      clientLogger.info("Starting Master Activation...");
      
      // 1. Trigger Shopify Seed (Creates real products in Shopify + Syncs to DB)
      toast("Starter Master Aktivering: Oppretter premium-produkter i Shopify...", "info");

      const seedRes = await fetch("/api/internal/shopify-seed", { method: "POST" });
      const seedJson = await seedRes.json();

      if (seedJson.success) {
        toast("Suksess! Shopify-produkter er opprettet og synkronisert.", "success");
        // Refresh the page data after a short delay
        setTimeout(() => window.location.reload(), 2000);
      } else {
        toast(`Aktivering feilet: ${seedJson.error || 'Ukjent feil'}`, "error");
        setShowManualTrigger(true);
      }
    } catch (err) {
      clientLogger.error("Master activation failed", err);
      toast("En alvorlig feil oppstod under aktivering.", "error");
      setShowManualTrigger(true);
    } finally {
      setIsActivating(false);
    }
  };

  useEffect(() => {
    async function checkActivation() {
      if (activated.current || isActivating) return;

      try {
        const healthRes = await fetch("/api/health");
        const healthJson = await healthRes.json();

        if (healthJson.success && healthJson.metrics.inventory_items === 0) {
          // Empty store detected
          const timer = setTimeout(() => setShowManualTrigger(true), 10000);
          await triggerActivation();
          clearTimeout(timer);
        }
      } catch (err) {
        clientLogger.error("Health check failed in AutoActivator", err);
        setShowManualTrigger(true);
      }
    }

    checkActivation();
  }, [pathname]);

  if (!showManualTrigger) return null;

  return (
    <div className="fixed bottom-8 right-8 z-[100] animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="glass-panel p-6 border border-red-200/50 shadow-2xl max-w-sm space-y-4">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-2xl bg-red-50 flex items-center justify-center text-red-600 shrink-0">
            <RefreshCw size={20} className={cn(isActivating && "animate-spin")} />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-black text-[#1a1a1a] uppercase tracking-tight">Klar til å aktivere?</p>
            <p className="text-[11px] text-[#6d7175] leading-relaxed">
              Vi fant ingen produkter i ditt kontrollpanel. Klikk under for å opprette test-produkter i din Shopify-butikk og aktivere live-motoren.
            </p>
          </div>
        </div>
        <button
          onClick={triggerActivation}
          disabled={isActivating}
          className="w-full bg-red-600 text-white text-[10px] font-black uppercase tracking-widest py-3 rounded-xl hover:bg-black transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
        >
          {isActivating ? (
             <>
               <Loader2 size={14} className="animate-spin" />
               Aktiverer...
             </>
          ) : (
            <>
              Start Aktivering Manuelt
              <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
