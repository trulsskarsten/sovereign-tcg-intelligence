"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  Settings, 
  Zap,
  ArrowRight,
  Command as CommandIcon
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { clientLogger } from "@/lib/client-logger";
import { ShieldCheck } from "lucide-react";

interface CommandAction {
  id: string;
  name: string;
  category: string;
  icon: React.ElementType;
  shortcut?: string;
  action: () => void;
}

export default function CommandCenter({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const actions: CommandAction[] = [
    { id: "ov", name: "Oversikt", category: "Navigasjon", icon: TrendingUp, action: () => router.push("/") },
    { id: "inv", name: "Lagerbeholdning", category: "Navigasjon", icon: Package, action: () => router.push("/inventory") },
    { id: "stage", name: "Staging Hub", category: "Navigasjon", icon: Zap, action: () => router.push("/hub/staging") },
    { id: "ops", name: "Driftsenter", category: "Navigasjon", icon: ShieldCheck, action: () => router.push("/hub/operations") },
    { id: "set", name: "Innstillinger", category: "Navigasjon", icon: Settings, action: () => router.push("/settings/automation") },
    { id: "sync", name: "Kjør full synkronisering", category: "Handlinger", icon: Zap, shortcut: "S", action: () => {
      clientLogger.info("Manuel sync trigget fra kommandosenter");
      router.push("/inventory?sync=true");
    }},
  ];

  const filteredActions = actions.filter(a => 
    a.name.toLowerCase().includes(query.toLowerCase()) || 
    a.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "Escape") onClose();
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredActions.length);
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredActions.length) % filteredActions.length);
      }
      if (e.key === "Enter") {
        e.preventDefault();
        filteredActions[selectedIndex]?.action();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filteredActions, selectedIndex, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#202223]/20 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="relative w-full max-w-xl bg-white rounded-xl shadow-2xl border border-[#d2d5d9] overflow-hidden"
          >
            <div className="flex items-center px-4 py-3 border-b border-[#d2d5d9]">
              <Search className="h-4 w-4 text-[#6d7175] mr-3" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Søk etter produkter, handlinger eller sider..."
                className="flex-1 bg-transparent border-none outline-none text-[15px] text-[#202223] placeholder:text-[#6d7175]"
              />
              <div className="flex items-center space-x-1 px-1.5 py-0.5 bg-[#f1f2f3] rounded border border-[#d2d5d9] text-[10px] font-bold text-[#6d7175]">
                <span className="text-[8px] uppercase">Esc</span>
              </div>
            </div>

            <div className="max-h-[350px] overflow-y-auto py-2">
              {filteredActions.length > 0 ? (
                <div className="px-2 pb-2">
                  {Array.from(new Set(filteredActions.map(a => a.category))).map(category => (
                    <div key={category} className="mb-2">
                      <h3 className="px-3 py-2 text-[10px] font-bold text-[#6d7175] uppercase tracking-widest">{category}</h3>
                      {filteredActions.filter(a => a.category === category).map((action) => {
                        const index = filteredActions.indexOf(action);
                        const isSelected = index === selectedIndex;
                        return (
                          <div
                            key={action.id}
                            onMouseEnter={() => setSelectedIndex(index)}
                            onClick={() => { action.action(); onClose(); }}
                            className={cn(
                              "group flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors",
                              isSelected ? "bg-[#005bd3] text-white" : "hover:bg-[#f1f2f3]"
                            )}
                          >
                            <div className="flex items-center">
                              <action.icon className={cn("h-4 w-4 mr-3", isSelected ? "text-white" : "text-[#6d7175]")} />
                              <span className="text-sm font-medium">{action.name}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              {action.shortcut && (
                                <span className={cn(
                                  "text-[10px] px-1.5 py-0.5 rounded border font-bold uppercase",
                                  isSelected ? "bg-white/20 border-white/40 text-white" : "bg-[#ebebeb] border-[#d2d5d9] text-[#6d7175]"
                                )}>
                                  {action.shortcut}
                                </span>
                              )}
                              <ArrowRight className={cn("h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity", isSelected && "opacity-100")} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <p className="text-sm text-[#6d7175]">Ingen treff for "{query}"</p>
                </div>
              )}
            </div>

            <div className="px-4 py-2 bg-[#fbfcfd] border-t border-[#d2d5d9] flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <kbd className="px-1 py-0.5 bg-white border border-[#d2d5d9] rounded text-[8px] font-bold shadow-sm">↓↑</kbd>
                  <span className="text-[10px] text-[#6d7175]">Naviger</span>
                </div>
                <div className="flex items-center space-x-1">
                  <kbd className="px-1.5 py-0.5 bg-white border border-[#d2d5d9] rounded text-[8px] font-bold shadow-sm">Enter</kbd>
                  <span className="text-[10px] text-[#6d7175]">Velg</span>
                </div>
              </div>
              <div className="flex items-center text-[10px] text-[#b5b8bb] space-x-1">
                <CommandIcon size={10} />
                <span>tcg-ops v0.1.0</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
