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

          // 2. Trigger Seed (Instant visual data)
          toast("Initialiserer Dashbord: Henter testdata...", "info");

          const seedRes = await fetch("/api/internal/seed", { method: "POST" });
          const seedJson = await seedRes.json();

          if (seedJson.success) {
            toast("Testdata Klar: Dashbordet er nå befolket med Pokémon TCG data.", "success");
            
            // 3. Trigger Real Sync in background
            clientLogger.info("Seeding complete. Starting background Shopify sync.");
            fetch("/api/inventory/sync", { method: "POST" }).catch(e => 
              clientLogger.error("Background sync failed", e)
            );

            // Refresh the page data after a short delay
            setTimeout(() => window.location.reload(), 2000);
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
