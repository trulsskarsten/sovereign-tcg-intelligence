"use client";

import { useEffect, useRef } from "react";
import { clientLogger } from "@/lib/client-logger";
import { useToast } from "@/components/ui/Toast";

/**
 * AutoActivator
 * Invisible component that checks for empty stores and triggers initial 
 * seeding/synchronization to ensure a great first-load experience.
 */
export function AutoActivator() {
  const { toast } = useToast();
  const activated = useRef(false);

  useEffect(() => {
    if (activated.current) return;
    
    async function activate() {
      try {
        // 1. Check health
        const healthRes = await fetch("/api/health");
        const health = await healthRes.json();

        if (health.success && health.metrics.inventory_items === 0) {
          activated.current = true;
          clientLogger.info("Empty store detected. Initializing activation...");

          // 2. Trigger Shopify Seed (Creates real products in Shopify)
          toast("Initialiserer Dashbord: Oppretter premium-produkter i Shopify...", "info");

          const seedRes = await fetch("/api/internal/shopify-seed", { method: "POST" });
          const seedJson = await seedRes.json();

          if (seedJson.success) {
            toast("Shopify-produkter Opprettet: Synkroniserer lagerbeholdning...", "success");
            
            // 3. Trigger Real Sync to pull the new products into the DB
            clientLogger.info("Shopify seeding complete. Triggering inventory sync.");
            const syncRes = await fetch("/api/inventory/sync", { method: "POST" });
            const syncJson = await syncRes.json();

            if (syncJson.success) {
              toast("Lager Synkronisert: Dashbordet er nå Live!", "success");
              // Refresh the page data after a short delay
              setTimeout(() => window.location.reload(), 2000);
            }
          }
        }
      } catch (err) {
        clientLogger.error("Activation failed", err);
      }
    }

    activate();
  }, [toast]);

  return null;
}
