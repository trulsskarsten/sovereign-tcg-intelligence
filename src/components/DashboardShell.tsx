"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  Receipt, 
  Settings, 
  Menu, 
  Bell,
  AlertTriangle,
  Zap,
  Search
} from "lucide-react";
import { motion } from "framer-motion";
import { i18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { UIProvider, useUI } from "./Providers";
import StatusDrawer from "./StatusDrawer";
import CommandCenter from "./CommandCenter";

const navigation = [
  { name: i18n.dashboard.overview, href: "/", icon: Home },
  { name: "Lagerbeholdning", href: "/inventory", icon: Package },
  { name: "Innkjøpslogg", href: "/purchases", icon: ShoppingCart },
  { name: "Anbefalinger", href: "/recommendations", icon: TrendingUp },
  { name: "Google Helse", href: "/hub/google-health", icon: Zap },
  { name: "MVA-bokføring", href: "/vat", icon: Receipt },
  { name: i18n.common.setup, href: "/setup", icon: Settings },
];

function DashboardContent({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const [isDemo] = useState(true);
  const { 
    isStatusOpen, 
    toggleStatus, 
    viewMode, 
    priceMode,
    togglePriceMode,
    isCommandCenterOpen, 
    toggleCommandCenter 
  } = useUI();

  // Mock safety status for pulse logic
  const safetyStatus = "red"; // In production, this would come from a context/hook

  return (
    <div className="flex h-screen bg-[#f6f6f7] overflow-hidden">
      {/* Demo Banner */}
      {isDemo && (
        <div className="fixed top-0 left-0 w-full h-1 bg-[#f02d44] z-[100]" />
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-[#ebebeb] border-r border-[#d2d5d9] flex-shrink-0">
        <div className="p-6 flex items-center space-x-3">
          <div className="w-8 h-8 bg-[#202223] rounded-md flex items-center justify-center text-white shadow-sm overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20" />
            <TrendingUp size={16} className="relative z-10" />
          </div>
          <span className="font-bold text-[#202223] tracking-tight text-sm">TCG Ops</span>
        </div>
        
        <nav className="flex-1 px-3 space-y-0.5 pointer-events-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "polaris-nav-item",
                  isActive ? "polaris-nav-item-active shadow-sm" : "polaris-nav-item-inactive"
                )}
              >
                <item.icon className={cn("h-4 w-4 mr-3", isActive ? "text-[#005bd3]" : "text-[#6d7175]")} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#d2d5d9]">
          <div className="flex items-center p-2 rounded-lg hover:bg-[#f1f2f3] cursor-pointer group transition-colors">
            <div className="w-8 h-8 rounded-full bg-[#005bd3] flex items-center justify-center text-[10px] font-bold text-white uppercase shadow-inner">
              S
            </div>
            <div className="ml-3 overflow-hidden">
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium text-[#202223] truncate font-bold">Forhandler</p>
                <span className="text-[8px] bg-[#005bd3]/10 text-[#005bd3] px-1.5 py-0.5 rounded-full font-bold border border-[#005bd3]/20">BETA PIONEER</span>
              </div>
              <p className="text-[10px] text-[#6d7175] truncate uppercase tracking-tighter">Enterprise Admin</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Container with Push Drawer Logic */}
      <motion.div 
        layout
        className="flex-1 flex flex-col min-w-0 relative h-full"
        animate={{ 
          marginRight: isStatusOpen && typeof window !== 'undefined' && window.innerWidth >= 1024 
            ? 'clamp(300px, 25vw, 450px)' 
            : 0 
        }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
      >
        {/* Header */}
        <header className="polaris-header h-14 sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-[#d2d5d9] px-6">
          <div className="flex items-center space-x-4">
            <button className="lg:hidden p-2 text-[#6d7175]" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu size={20} />
            </button>
            <div>
              <h1 className="text-xs font-bold text-[#202223] uppercase tracking-widest flex items-center">
                {navigation.find(n => n.href === pathname)?.name || "Dashbord"}
              </h1>
              <div className="flex items-center space-x-2 mt-0.5">
                {viewMode === "advanced" && (
                  <span className="text-[9px] bg-[#005bd3] text-white px-1.5 py-0.5 rounded font-bold uppercase tracking-tighter">AVANSERT</span>
                )}
                {isDemo && (
                  <span className="text-[9px] font-bold text-[#f02d44] tracking-wider uppercase flex items-center">
                    <AlertTriangle size={9} className="mr-1" /> DEMO
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            {/* Universal Price Toggle (Net/Gross) */}
            <div className="hidden sm:flex items-center bg-[#f1f2f3] rounded-full p-0.5 border border-[#d2d5d9]">
              <button
                onClick={() => priceMode === "gross" && togglePriceMode()}
                className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-bold transition-all",
                  priceMode === "net" 
                    ? "bg-[#202223] text-white shadow-sm" 
                    : "text-[#6d7175] hover:text-[#202223]"
                )}
              >
                Eks. MVA
              </button>
              <button
                onClick={() => priceMode === "net" && togglePriceMode()}
                className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-bold transition-all",
                  priceMode === "gross" 
                    ? "bg-[#202223] text-white shadow-sm" 
                    : "text-[#6d7175] hover:text-[#202223]"
                )}
              >
                Inkl. MVA
              </button>
            </div>

            {/* Live Status Orb Logic */}
            <button 
              onClick={toggleStatus}
              className="group flex items-center space-x-4 text-[#6d7175] hover:text-[#202223] transition-colors focus:outline-none"
            >
              <span className="text-[11px] font-bold uppercase tracking-widest hidden md:inline">Live Status</span>
              <div className="relative">
                {/* Passive Heartbeat Pulse (Halo) */}
                <div className={cn(
                  "absolute -inset-2 rounded-full opacity-30 blur-sm transition-all duration-1000",
                  safetyStatus === "red" ? "bg-red-500 animate-[pulse_1s_infinite]" : "opacity-0"
                )} />
                
                <div className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center relative z-10 transition-all duration-500",
                  isStatusOpen ? "bg-[#202223] text-white rotate-90" : "bg-[#f1f2f3] shadow-inner"
                )}>
                  <div className={cn(
                    "w-2.5 h-2.5 rounded-full transition-colors duration-500",
                     safetyStatus === "red" ? "bg-red-500" : (isStatusOpen ? "bg-[#108043]" : "bg-[#005bd3]")
                  )} />
                </div>
              </div>
            </button>

            <div className="flex items-center space-x-4">
              <button 
                onClick={toggleCommandCenter}
                className="p-2 text-[#6d7175] hover:bg-[#f1f2f3] rounded-full transition-all group relative"
              >
                <Search size={18} />
                <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 text-[8px] bg-[#202223] text-white px-1.5 py-0.5 rounded transition-opacity whitespace-nowrap">
                  Cmd + K
                </span>
              </button>
              <button className="p-2 text-[#6d7175] hover:bg-[#f1f2f3] rounded-full transition-colors relative">
                <Bell size={18} />
                <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-[#f02d44] rounded-full ring-2 ring-white" />
              </button>
            </div>
          </div>
        </header>

        {isDemo && (
          <div className="bg-[#fff4f4] border-b border-[#f9caca] px-6 py-1 text-center shrink-0">
            <p className="text-[9px] font-bold text-[#c02d2d] uppercase tracking-widest italic">
              Demo-miljø — Ingen endringer lagres til butikken
            </p>
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-4 lg:p-8 scroll-smooth h-full relative">
          {/* Heatmap tint for critical status */}
          {safetyStatus === "red" && (
            <div className="pointer-events-none absolute inset-0 bg-red-500/5 z-0" />
          )}
          
          <div className="max-w-7xl mx-auto pb-20 relative z-10">
            {children}
          </div>
          
          <footer className="mt-12 pt-8 border-t border-[#d2d5d9] pb-8 text-center sm:flex sm:items-center sm:justify-between max-w-7xl mx-auto relative z-10">
            <p className="text-[10px] text-[#6d7175]">
              © 2026 Skarsten Digital. Professional TCG Enterprise Ecosystem.
            </p>
            <div className="mt-2 sm:mt-0 flex items-center justify-center space-x-4">
              <Link href="/personvern" className="text-[10px] text-[#6d7175] hover:text-[#005bd3] transition-colors">
                Compliance & Legal
              </Link>
              <span className="text-[10px] text-[#d2d5d9]">•</span>
              <p className="text-[10px] text-[#6d7175] flex items-center">
                <span className={cn(
                  "w-1.5 h-1.5 rounded-full mr-2",
                  safetyStatus === "red" ? "bg-red-500 animate-pulse" : "bg-[#108043]"
                )} />
                Systemstatus: <span className="ml-1 font-bold uppercase">{safetyStatus === "red" ? "Avvik" : "Optimal"}</span>
              </p>
            </div>
          </footer>
        </main>
      </motion.div>

      <StatusDrawer />
      <CommandCenter isOpen={isCommandCenterOpen} onClose={toggleCommandCenter} />
    </div>
  );
}

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <UIProvider>
      <DashboardContent>{children}</DashboardContent>
    </UIProvider>
  );
}
