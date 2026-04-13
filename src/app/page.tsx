import React from "react";
import DashboardShell from "@/components/DashboardShell";
import { WidgetGrid } from "@/components/dashboard/WidgetGrid";
import {
  TrendingUp, 
  Package, 
  BarChart3, 
  Zap,
  Gem,
  Plus,
  DollarSign,
  Loader2,
  AlertTriangle
} from "lucide-react";

/**
 * Merchant Dashboard
 * Root landing page for the Shopify Embedded App.
 * Uses a dynamic bento-grid (WidgetGrid) to display operational insights.
 */
export default function MerchantDashboard() {
  return (
    <DashboardShell>
      <div className="max-w-[1600px] mx-auto py-10 px-6">
        <div className="mb-10 space-y-2">
          <h1 className="text-4xl font-black text-[#1a1a1a] tracking-tighter">
            Kontrollsenter
          </h1>
          <p className="text-sm text-[#6d7175] font-medium tracking-tight">
            Velkommen tilbake. Her er en oversikt over din butikkdrift og lagerstatus.
          </p>
        </div>
        
        <WidgetGrid />
      </div>
    </DashboardShell>
  );
}
