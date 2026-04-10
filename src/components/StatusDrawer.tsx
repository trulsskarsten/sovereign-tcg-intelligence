"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Activity, TrendingUp, Package, AlertCircle, ChevronRight } from "lucide-react";
import { useUI } from "./Providers";
import { cn } from "@/lib/utils"; // Assuming cn is available or I'll define it locally if not

export default function StatusDrawer() {
  const { isStatusOpen, toggleStatus } = useUI();

  return (
    <AnimatePresence>
      {isStatusOpen && (
        <>
          {/* Backdrop for Mobile/Tablet */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleStatus}
            className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-40 lg:hidden"
          />

          {/* Drawer */}
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={cn(
              "fixed right-0 top-0 h-full bg-white border-l border-[#d2d5d9] z-50 shadow-2xl lg:shadow-none",
              "w-full sm:w-[400px] lg:w-[clamp(300px,25vw,450px)]"
            )}
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="p-4 border-b border-[#d2d5d9] flex items-center justify-between bg-[#fbfcfd]">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-[#108043] animate-pulse" />
                  <h2 className="text-sm font-semibold text-[#202223] uppercase tracking-wider">Live Status</h2>
                </div>
                <button 
                  onClick={toggleStatus}
                  className="p-1.5 hover:bg-[#f1f2f3] rounded-md transition-colors"
                >
                  <X size={18} className="text-[#6d7175]" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* Morning Digest Component (Simplified) */}
                <section>
                  <h3 className="text-[11px] font-bold text-[#6d7175] uppercase tracking-widest mb-3">Morgen-oppsummering</h3>
                  <div className="bg-[#f6f6f7] border border-[#d2d5d9] rounded-lg p-4">
                    <p className="text-xs text-[#202223] leading-relaxed italic">
                      "God morgen! Jeg har sett på markedet for deg. Porteføljen din har steget med 1.2% mens du sov, og det er 2 nye prisbølger å se på."
                    </p>
                  </div>
                </section>

                {/* Market Waves */}
                <section>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-[11px] font-bold text-[#6d7175] uppercase tracking-widest">Markeds-bølger</h3>
                    <TrendingUp size={14} className="text-[#005bd3]" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3 p-3 bg-white border border-[#d2d5d9] rounded-lg hover:border-[#005bd3] transition-colors cursor-pointer group">
                      <div className="p-2 bg-[#f4f6f8] rounded-md group-hover:bg-[#ebf5ff]">
                        <Package size={16} className="text-[#202223]" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[13px] font-medium text-[#202223]">Ny bølge: 151 Booster</p>
                        <p className="text-[11px] text-[#6d7175]">Oppdaget hos 5+ forhandlere</p>
                      </div>
                      <ChevronRight size={14} className="text-[#d2d5d9] self-center" />
                    </div>
                  </div>
                </section>

                {/* System Health */}
                <section>
                  <h3 className="text-[11px] font-bold text-[#6d7175] uppercase tracking-widest mb-3">System-helse</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 text-xs">
                      <span className="text-[#6d7175]">Synkronisering</span>
                      <span className="text-[#108043] font-medium">Optimal</span>
                    </div>
                    <div className="flex items-center justify-between p-2 text-xs">
                      <span className="text-[#6d7175]">Google Merchant</span>
                      <span className="text-[#108043] font-medium">128 oppdatert</span>
                    </div>
                  </div>
                </section>

                {/* Critical Alerts (Passive Heartbeat) */}
                <section>
                  <h3 className="text-[11px] font-bold text-[#6d7175] uppercase tracking-widest mb-3 text-red-600">Varsler</h3>
                  <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-start space-x-3">
                    <AlertCircle size={16} className="text-red-600 shrink-0" />
                    <div>
                      <p className="text-[12px] font-medium text-red-900">Lav lagerbeholdning</p>
                      <p className="text-[10px] text-red-700">6 produkter i kritiske soner</p>
                    </div>
                  </div>
                </section>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-[#d2d5d9] bg-[#fbfcfd]">
                <button className="w-full py-2 bg-[#202223] text-white text-xs font-semibold rounded-md hover:bg-[#303335] transition-colors">
                  Se alle varsler
                </button>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
