"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Responsive, WidthProvider, type Layouts, type Layout } from "react-grid-layout/legacy";
import { useUI } from "@/components/Providers";
import { defaultLayout, WIDGET_TITLES } from "@/lib/dashboard/default-layout";
import { KPICards } from "./widgets/KPICards";
import { InventoryTable } from "./widgets/InventoryTable";
import { StagedUpdatesQueue } from "./widgets/StagedUpdatesQueue";
import { RecommendationsWidget } from "./widgets/RecommendationsWidget";
import { PerformanceChart } from "./widgets/PerformanceChart";
import { GripVertical, Loader2, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { clientLogger } from "@/lib/client-logger";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ResponsiveGridLayout = (WidthProvider as (component: typeof Responsive) => React.ComponentType<Record<string, unknown>>)(Responsive);

const WIDGET_COMPONENTS: Record<string, React.ReactNode> = {
  kpis: <KPICards />,
  inventory: <InventoryTable />,
  'staged-updates': <StagedUpdatesQueue />,
  recommendations: <RecommendationsWidget />,
  performance: <PerformanceChart />,
};

export function WidgetGrid() {
  const { isEditMode, toggleEditMode } = useUI();
  const [layouts, setLayouts] = useState<Layouts>(defaultLayout as Layouts);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadLayout() {
      try {
        const res = await fetch('/api/stores/layout');
        const json = await res.json();
        if (json.success && json.layout && Object.keys(json.layout).length > 0) {
          setLayouts(json.layout);
        }
      } catch (err: unknown) {
        clientLogger.error("Failed to load layout", err);
      } finally {
        setLoading(false);
      }
    }
    loadLayout();
  }, []);

  const onLayoutChange = (_currentLayout: Layout[], allLayouts: Layouts) => {
    if (isEditMode) {
      setLayouts(allLayouts);
    }
  };

  const saveLayout = async () => {
    setIsSaving(true);
    try {
      await fetch('/api/stores/layout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ layout: layouts }),
      });
      toggleEditMode(); // Exit edit mode on save
    } catch (err: unknown) {
      clientLogger.error("Failed to save layout", err);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <Loader2 className="animate-spin text-[#005bd3]" size={40} />
        <p className="text-sm font-black text-[#6d7175] uppercase tracking-widest">Laster ditt dashboard...</p>
      </div>
    );
  }

  return (
    <div className={cn("relative", isEditMode && "edit-mode pb-20")}>
      {isEditMode && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] flex items-center space-x-4 bg-white/80 backdrop-blur-xl border border-blue-200 px-6 py-3 rounded-full shadow-2xl animate-in fade-in slide-in-from-bottom-5">
           <p className="text-[11px] font-black text-[#005bd3] uppercase tracking-widest">Redigerer Dashboard</p>
           <div className="h-4 w-px bg-blue-100" />
           <button 
             onClick={saveLayout}
             disabled={isSaving}
             className="flex items-center text-[11px] font-black text-white bg-[#005bd3] px-4 py-1.5 rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50"
           >
             {isSaving ? <Loader2 size={12} className="animate-spin mr-2" /> : <Save size={12} className="mr-2" />}
             Lagre Layout
           </button>
           <button 
             onClick={toggleEditMode}
             className="text-[11px] font-black text-[#6d7175] hover:text-[#1a1a1a] transition-colors"
           >
             Avbryt
           </button>
        </div>
      )}

      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={100}
        draggableHandle=".widget-drag-handle"
        isDraggable={isEditMode}
        isResizable={isEditMode}
        onLayoutChange={onLayoutChange}
        margin={[24, 24]}
      >
        {Object.keys(WIDGET_COMPONENTS).map((key) => (
          <div key={key} className={cn(
            "group relative",
            isEditMode && "ring-2 ring-blue-500/20 rounded-[1.5rem]"
          )}>
            <div className="h-full w-full overflow-hidden bg-white/40 backdrop-blur-md border border-white/60 rounded-[1.5rem] p-6 shadow-sm flex flex-col">
              {isEditMode && (
                <div className="widget-drag-handle absolute top-4 right-4 p-2 cursor-grab active:cursor-grabbing text-blue-500 hover:bg-blue-50 rounded-lg transition-colors z-50">
                   <GripVertical size={16} />
                </div>
              )}
              <div className="flex-1 min-h-0">
                {WIDGET_COMPONENTS[key]}
              </div>
            </div>
            {isEditMode && (
               <div className="absolute -top-3 left-6 px-3 py-1 bg-[#005bd3] text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg z-50">
                 {WIDGET_TITLES[key as keyof typeof WIDGET_TITLES]}
               </div>
            )}
          </div>
        ))}
      </ResponsiveGridLayout>
    </div>
  );
}
