"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, ArrowRight, Zap, TrendingUp, AlertCircle, Loader2 } from "lucide-react";
import { clientLogger } from "@/lib/client-logger";
import { cn } from "@/lib/utils";

export function RecommendationsWidget() {
  interface Recommendation {
    id: string;
    type: string;
    product_name?: string;
    suggested_price?: number;
    current_price?: number;
    [key: string]: unknown;
  }
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecs() {
      try {
        const res = await fetch('/api/recommendations?limit=2');
        if (res.ok) {
          const json = await res.json();
          if (json.success) setRecommendations(json.data);
        }
      } catch (err: unknown) {
        clientLogger.error("Failed to fetch recs", err);
      } finally {
        setLoading(false);
      }
    }
    fetchRecs();
  }, []);

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1a1a1a] flex items-center">
          <Sparkles size={16} className="mr-3 text-[#005bd3]" /> Smarte Forslag
        </h3>
      </div>

      <div className="flex-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full space-y-2">
            <Loader2 className="animate-spin text-[#d2d5d9]" size={24} />
            <p className="text-[9px] text-[#6d7175] font-black uppercase tracking-widest">Analyserer markedet...</p>
          </div>
        ) : recommendations.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100 flex flex-col justify-between space-y-4 group cursor-pointer hover:bg-blue-50 transition-all">
               <div className="space-y-2">
                 <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#005bd3] flex items-center justify-center">
                    <Zap size={16} />
                 </div>
                 <h4 className="text-[11px] font-black text-[#1a1a1a] uppercase tracking-tighter">Optimaliser Priser</h4>
                 <p className="text-[10px] text-[#6d7175] font-medium leading-relaxed">Kjør den ukentlige pris-motoren for å sikre topp-plassering på Pokepris.no.</p>
               </div>
               <div className="flex items-center text-[10px] font-black text-[#005bd3] uppercase tracking-widest">
                 Start nå <ArrowRight size={12} className="ml-2 group-hover:translate-x-1 transition-transform" />
               </div>
            </div>
            
            <div className="p-6 bg-emerald-50/50 rounded-2xl border border-emerald-100 flex flex-col justify-between space-y-4 group cursor-pointer hover:bg-emerald-50 transition-all">
               <div className="space-y-2">
                 <div className="w-8 h-8 rounded-lg bg-emerald-100 text-[#108043] flex items-center justify-center">
                    <TrendingUp size={16} />
                 </div>
                 <h4 className="text-[11px] font-black text-[#1a1a1a] uppercase tracking-tighter">ROI Analyse</h4>
                 <p className="text-[10px] text-[#6d7175] font-medium leading-relaxed">Dine topp 5 produkter har økt med 12% i markedspris denne uken.</p>
               </div>
               <div className="flex items-center text-[10px] font-black text-[#108043] uppercase tracking-widest">
                 Se detaljer <ArrowRight size={12} className="ml-2 group-hover:translate-x-1 transition-transform" />
               </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Real data mapping here in Milestone 2.3 */}
          </div>
        )}
      </div>
    </div>
  );
}
