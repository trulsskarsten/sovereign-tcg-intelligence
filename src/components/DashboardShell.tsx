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

  // Unified safety status
  const safetyStatus = "blue"; // Normalized for calibration

  return (
    <div className="flex h-screen bg-[#fdfdfd] overflow-hidden font-sans">
      {/* Background Ambience */}
      <div className="fixed inset-0 bg-[radial-gradient(at_top_right,rgba(0,91,211,0.03),transparent_50%),radial-gradient(at_bottom_left,rgba(0,128,96,0.03),transparent_50%)] pointer-events-none" />

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white/40 backdrop-blur-xl border-r border-[#f1f2f3] flex-shrink-0 relative z-20">
        <div className="p-8 flex items-center space-x-3">
          <div className="w-9 h-9 bg-[#1a1a1a] rounded-xl flex items-center justify-center text-white shadow-xl shadow-black/10 overflow-hidden relative group">
             <motion.div 
               animate={{ rotate: [0, 10, 0] }} 
               transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
               className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-emerald-500/20" 
             />
             <TrendingUp size={18} className="relative z-10" />
          </div>
          <span className="font-extrabold text-[#1a1a1a] tracking-tighter text-lg">{i18n.common.brandName}</span>
        </div>
        
        <nav className="flex-1 px-4 space-y-1 pointer-events-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center px-4 py-2.5 text-[13px] font-bold rounded-xl transition-all duration-300",
                  isActive 
                    ? "bg-white text-[#005bd3] shadow-[0_4px_12px_rgba(0,0,0,0.04)] border border-[#f1f2f3]" 
                    : "text-[#6d7175] hover:text-[#1a1a1a] hover:bg-white/60"
                )}
              >
                <item.icon className={cn("h-4 w-4 mr-3 transition-colors", isActive ? "text-[#005bd3]" : "text-[#6d7175] group-hover:text-[#1a1a1a]")} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-[#f1f2f3]">
          <div className="flex items-center p-3 rounded-2xl bg-white/40 border border-white/60 shadow-sm hover:shadow-md transition-all cursor-pointer group">
            <div className="w-9 h-9 rounded-full bg-[#005bd3] flex items-center justify-center text-[11px] font-black text-white shadow-inner">
              {i18n.common.brandName[0]}
            </div>
            <div className="ml-3 overflow-hidden">
              <div className="flex items-center space-x-2">
                <p className="text-xs font-black text-[#1a1a1a] truncate">Pioneer Merchant</p>
              </div>
              <p className="text-[10px] text-[#005bd3] font-bold uppercase tracking-tighter">Enterprise</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <motion.div 
        layout
        className="flex-1 flex flex-col min-w-0 relative h-full z-10"
        animate={{ 
          marginRight: isStatusOpen && typeof window !== 'undefined' && window.innerWidth >= 1024 
            ? 'clamp(300px, 25vw, 450px)' 
            : 0 
        }}
        transition={{ type: "spring", damping: 28, stiffness: 220 }}
      >
        {/* Header */}
        <header className="h-16 sticky top-0 z-30 bg-white/60 backdrop-blur-xl border-b border-[#f1f2f3] px-8 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button className="lg:hidden p-2 text-[#6d7175]" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu size={20} />
            </button>
            <div>
              <h2 className="text-[10px] font-black text-[#6d7175] uppercase tracking-[0.2em] mb-0.5">
                {navigation.find(n => n.href === pathname)?.name || "Dashbord"}
              </h2>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-bold text-[#1a1a1a]">{i18n.common.brandFull}</span>
                {isDemo && (
                  <span className="text-[9px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-black uppercase tracking-tighter border border-red-200">DEMO</span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="hidden sm:flex items-center bg-[#f1f2f3]/50 rounded-full p-1 border border-[#f1f2f3]">
              <button
                onClick={() => priceMode === "gross" && togglePriceMode()}
                className={cn(
                  "px-4 py-1.5 rounded-full text-[10px] font-bold transition-all",
                  priceMode === "net" 
                    ? "bg-white text-[#1a1a1a] shadow-sm" 
                    : "text-[#6d7175] hover:text-[#1a1a1a]"
                )}
              >
                Eks. MVA
              </button>
              <button
                onClick={() => priceMode === "net" && togglePriceMode()}
                className={cn(
                  "px-4 py-1.5 rounded-full text-[10px] font-bold transition-all",
                  priceMode === "gross" 
                    ? "bg-white text-[#1a1a1a] shadow-sm" 
                    : "text-[#6d7175] hover:text-[#1a1a1a]"
                )}
              >
                Inkl. MVA
              </button>
            </div>

            <button 
              onClick={toggleStatus}
              className="group flex items-center space-x-3 focus:outline-none"
            >
              <span className="text-[10px] font-black uppercase tracking-widest text-[#6d7175] hidden md:inline">Live Engine</span>
              <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center transition-all duration-500",
                isStatusOpen ? "bg-[#1a1a1a] text-white shadow-xl shadow-black/10" : "bg-[#f1f2f3] shadow-inner"
              )}>
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  safetyStatus === "blue" ? "bg-[#005bd3] shadow-[0_0_8px_rgba(0,91,211,0.5)] animate-pulse" : "bg-gray-300"
                )} />
              </div>
            </button>

            <div className="flex items-center space-x-4 border-l border-[#f1f2f3] pl-6">
              <button 
                onClick={toggleCommandCenter}
                className="p-2 text-[#6d7175] hover:bg-white hover:shadow-sm rounded-full transition-all group relative border border-transparent hover:border-[#f1f2f3]"
              >
                <Search size={18} />
              </button>
              <button className="p-2 text-[#6d7175] hover:bg-white hover:shadow-sm rounded-full transition-all relative border border-transparent hover:border-[#f1f2f3]">
                <Bell size={18} />
                <div className="absolute top-2 right-2 w-2 h-2 bg-[#f02d44] rounded-full ring-2 ring-white" />
              </button>
            </div>
          </div>
        </header>

        {isDemo && (
          <div className="bg-red-50/80 backdrop-blur-md border-b border-red-100 px-6 py-1.5 text-center shrink-0">
            <p className="text-[10px] font-black text-red-600 uppercase tracking-widest flex items-center justify-center">
              <AlertTriangle size={12} className="mr-2" /> {i18n.common.demoWarning}
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
