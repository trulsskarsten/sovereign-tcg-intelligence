"use client";

import React, { useState } from 'react';
import DashboardShell from '@/components/DashboardShell';
import { 
  ShieldAlert, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2, 
  Clock, 
  Gem, 
  Package, 
  Star,
  Search,
  Filter,
  Zap,
  MoreVertical
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function StagingHub() {
  const [activeFilter, setActiveFilter] = useState('all');

  // Multi-tier mock data representing the ABC distribution
  const stagedUpdates = [
    { 
      id: 1, 
      name: "Charizard VMAX - SV122/SV122", 
      class: "A", 
      status: "Movers", 
      oldPrice: 1450, 
      newPrice: 1680, 
      margin: 18.5, 
      daysInStock: 12,
      isImmortal: true
    },
    { 
      id: 2, 
      name: "Paldean Fates ETB", 
      class: "C", 
      status: "Stale", 
      oldPrice: 649, 
      newPrice: 599, 
      margin: 9.2, 
      daysInStock: 74,
      isImmortal: false
    },
    { 
      id: 3, 
      name: "Mew ex - 151 UPC Promo", 
      class: "B", 
      status: "Movers", 
      oldPrice: 320, 
      newPrice: 385, 
      margin: 24.0, 
      daysInStock: 45,
      isImmortal: false
    },
    { 
      id: 4, 
      name: "Iron Valiant ex - Paradox Rift Display", 
      class: "C", 
      status: "Margin Risk", 
      oldPrice: 1399, 
      newPrice: 1150, 
      margin: 5.4, 
      daysInStock: 89,
      isImmortal: false
    }
  ];

  return (
    <DashboardShell>
      <div className="max-w-7xl mx-auto py-10 px-6">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-[#202223] mb-1">Staging & Godkjenning</h1>
              <p className="text-sm text-[#6d7175]">Gjennomgå 184 foreslåtte prisendringer basert på markedsutvikling.</p>
            </div>
            <div className="flex items-center space-x-3">
              <button className="polaris-btn-secondary text-xs flex items-center">
                <CheckCircle2 size={14} className="mr-2" /> Godkjenn alle Klasse C
              </button>
              <button className="polaris-btn-primary text-xs bg-[#008060] border-none flex items-center shadow-lg">
                <Zap size={14} className="mr-2" /> Godkjenn alle 184 endringer
              </button>
            </div>
          </div>

          {/* Filter Chips */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 noscrollbar">
            {[
              { id: 'all', label: 'Alle endringer', count: 184, icon: null },
              { id: 'movers', label: '🚀 Movers (>10%)', count: 42, icon: TrendingUp },
              { id: 'stale', label: '🧊 Stale Stock', count: 89, icon: Clock },
              { id: 'risk', label: '⚖️ Margin-risiko', count: 12, icon: ShieldAlert },
              { id: 'grails', label: '💎 Klasse A', count: 15, icon: Gem },
            ].map((chip) => (
              <button
                key={chip.id}
                onClick={() => setActiveFilter(chip.id)}
                className={cn(
                  "flex items-center px-4 py-2 rounded-full text-xs font-bold transition-all border shrink-0",
                  activeFilter === chip.id 
                    ? "bg-[#005bd3] text-white border-[#005bd3] shadow-sm" 
                    : "bg-white text-[#6d7175] border-[#d2d5d9] hover:border-[#005bd3] hover:text-[#005bd3]"
                )}
              >
                {chip.icon && <chip.icon size={14} className="mr-2" />}
                {chip.label}
                <span className={cn(
                  "ml-2 px-1.5 py-0.5 rounded-md text-[10px]",
                  activeFilter === chip.id ? "bg-white/20" : "bg-[#f1f2f3] text-[#202223]"
                )}>
                  {chip.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* High-Density Grid */}
        <div className="polaris-card overflow-hidden">
          <div className="px-6 py-3 border-b border-[#f1f2f3] flex items-center justify-between bg-[#f9fafb]">
            <div className="flex items-center space-x-12">
              <span className="text-[10px] font-bold text-[#6d7175] uppercase tracking-wider min-w-[300px]">Produkt & Klasse</span>
              <span className="text-[10px] font-bold text-[#6d7175] uppercase tracking-wider min-w-[100px]">Status</span>
              <span className="text-[10px] font-bold text-[#6d7175] uppercase tracking-wider w-32 text-right">Trend</span>
              <span className="text-[10px] font-bold text-[#6d7175] uppercase tracking-wider w-24 text-right">Margin</span>
            </div>
            <span className="w-10"></span>
          </div>
          <div className="divide-y divide-[#f1f2f3]">
            {stagedUpdates.map((item) => (
              <div key={item.id} className="px-6 py-4 flex items-center justify-between hover:bg-[#f9fafb] group transition-colors">
                <div className="flex items-center min-w-[300px]">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center mr-4 shadow-sm",
                    item.class === 'A' ? "bg-blue-50 text-[#005bd3]" :
                    item.class === 'B' ? "bg-purple-50 text-purple-600" : "bg-gray-50 text-gray-500"
                  )}>
                    {item.class === 'A' ? <Gem size={16} /> :
                     item.class === 'B' ? <Star size={16} /> : <Package size={16} />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#202223] truncate max-w-[200px]">{item.name}</p>
                    <div className="flex items-center space-x-2">
                       <span className={cn(
                         "text-[9px] font-black px-1.5 rounded uppercase",
                         item.class === 'A' ? "bg-blue-100 text-[#005bd3]" : 
                         item.class === 'B' ? "bg-purple-100 text-purple-700" : "bg-gray-200 text-gray-700"
                       )}>
                         Klasse {item.class}
                       </span>
                       {item.isImmortal && <span className="text-[9px] font-bold text-[#108043]">Immortal ♾️</span>}
                       <span className="text-[9px] text-[#6d7175]">{item.daysInStock} dager på lager</span>
                    </div>
                  </div>
                </div>

                <div className="min-w-[100px]">
                  <span className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter",
                    item.status === 'Movers' ? "bg-[#eaf5ef] text-[#108043]" :
                    item.status === 'Stale' ? "bg-[#fff4e5] text-[#663c00]" : "bg-[#fff4f4] text-[#c02d2d]"
                  )}>
                    {item.status}
                  </span>
                </div>

                <div className="w-32 text-right">
                  <p className="text-[10px] text-[#6d7175] line-through">{item.oldPrice} kr</p>
                  <p className={cn(
                    "text-sm font-bold",
                    item.newPrice > item.oldPrice ? "text-[#108043]" : "text-[#c02d2d]"
                  )}>
                    {item.newPrice} kr
                  </p>
                </div>

                <div className="w-24 text-right">
                  <p className={cn(
                    "text-xs font-bold",
                    item.margin < 6 ? "text-[#c02d2d]" : "text-[#202223]"
                  )}>
                    {item.margin.toFixed(1)}%
                  </p>
                </div>

                <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-2 text-[#008060] hover:bg-green-50 rounded-lg">
                    <CheckCircle2 size={18} />
                  </button>
                  <button className="p-2 text-[#6d7175] hover:bg-gray-100 rounded-lg">
                    <MoreVertical size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
