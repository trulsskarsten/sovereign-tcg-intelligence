"use client";

import React, { useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  MoreHorizontal, 
  ExternalLink,
  Info
} from "lucide-react";
import { i18n, formatCurrency, formatPercent } from "@/lib/i18n";
import { useUI } from "@/components/Providers";
import { formatPrice, calculateROI } from "@/lib/pricing";

export default function Inventory() {
  const { priceMode } = useUI();
  // Mock data representing a typical Norwegian TCG inventory
  const [items] = useState([
    { id: 1, name: "Paldean Fates Elite Trainer Box", sku: "POK-PF-ETB", stock: 12, cost: 499, price: 649, margin: 23 },
    { id: 2, name: "151 Ultra Premium Collection", sku: "POK-151-UPC", stock: 5, cost: 1199, price: 1499, margin: 20 },
    { id: 3, name: "Shiny Treasure ex Booster Box", sku: "POK-SV4A-BB", stock: 24, cost: 650, price: 899, margin: 27 },
    { id: 4, name: "Paradox Rift Booster Display", sku: "POK-PR-DISP", stock: 8, cost: 1050, price: 1399, margin: 25 },
  ]);

  return (
    <DashboardShell>
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#202223] tracking-tight">{i18n.inventory.title}</h1>
          <p className="text-sm text-[#6d7175] mt-1">{i18n.inventory.subtitle}</p>
        </div>

        {/* Filters & Actions */}
        <div className="polaris-card p-4 flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6d7175]" size={16} />
            <input 
              type="text" 
              placeholder={i18n.inventory.search} 
              className="polaris-input pl-10 h-10"
            />
          </div>
          <div className="flex space-x-3">
            <button className="polaris-btn-secondary flex items-center">
              <Filter size={16} className="mr-2" /> Filtrer
            </button>
            <button className="polaris-btn-primary">
              {i18n.inventory.addProduct}
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="polaris-card overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#f9fafb] border-b border-[#f1f2f3]">
              <tr>
                <th className="px-6 py-4 text-[10px] font-bold text-[#202223] uppercase tracking-wider">Produkt</th>
                <th className="px-6 py-4 text-[10px] font-bold text-[#202223] uppercase tracking-wider">{i18n.inventory.sku}</th>
                <th className="px-6 py-4 text-[10px] font-bold text-[#202223] uppercase tracking-wider text-right">{i18n.inventory.stock}</th>
                <th className="px-6 py-4 text-[10px] font-bold text-[#202223] uppercase tracking-wider text-right">
                  {i18n.inventory.unitCost} 
                  <span className="ml-1 text-[#6d7175] normal-case font-normal">({priceMode === "net" ? "Eks." : "Inkl."} MVA)</span>
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-[#202223] uppercase tracking-wider text-right">
                  {i18n.inventory.sellingPrice}
                  <span className="ml-1 text-[#6d7175] normal-case font-normal">({priceMode === "net" ? "Eks." : "Inkl."} MVA)</span>
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-[#202223] uppercase tracking-wider text-right">{i18n.inventory.margin}</th>
                <th className="px-6 py-4 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f2f3]">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-[#f9fafb] group transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-[#202223] group-hover:text-[#005bd3] transition-colors">{item.name}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs text-[#6d7175] font-mono">{item.sku}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={cn(
                      "text-xs font-semibold px-2 py-0.5 rounded-full",
                      item.stock < 10 ? "bg-[#fff4f4] text-[#c02d2d]" : "bg-[#f1f2f3] text-[#202223]"
                    )}>
                      {item.stock} stk
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-xs text-[#202223]">{formatCurrency(formatPrice(item.cost, priceMode))}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-xs text-[#202223] font-semibold">{formatCurrency(formatPrice(item.price, priceMode))}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={cn(
                      "text-xs font-bold",
                      item.margin > 25 ? "text-[#108043]" : "text-[#202223]"
                    )}>
                      {formatPercent(calculateROI(item.cost, item.price, priceMode) / formatPrice(item.price, priceMode) * 100)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-[#6d7175] hover:text-[#202223]">
                      <MoreHorizontal size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-6 py-4 bg-[#f9fafb] border-t border-[#f1f2f3] flex items-center justify-between text-[11px] text-[#6d7175]">
            <p>Viser {items.length} av {items.length} produkter</p>
            <div className="flex space-x-2">
              <button disabled className="px-2 py-1 rounded border border-[#d2d5d9] bg-white opacity-50 cursor-not-allowed">Forrige</button>
              <button disabled className="px-2 py-1 rounded border border-[#d2d5d9] bg-white opacity-50 cursor-not-allowed">Neste</button>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
