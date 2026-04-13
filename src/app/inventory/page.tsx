"use client";

import React, { useState, useEffect, useCallback } from "react";
import DashboardShell from "@/components/DashboardShell";
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  MoreHorizontal, 
  Loader2, 
  RefreshCw,
  Plus,
  Package,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { i18n, formatCurrency, formatPercent } from "@/lib/i18n";
import { useUI } from "@/components/Providers";
import { formatPrice, calculateROI } from "@/lib/pricing";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";

export default function Inventory() {
  const { priceMode } = useUI();
  const { toast } = useToast();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, total_pages: 0 });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/inventory?page=${page}&limit=50&q=${searchQuery}`);
      const json = await res.json();
      if (json.success) {
        setItems(json.data);
        setPagination(json.pagination);
      } else {
        setError(json.error);
      }
    } catch (err) {
      setError("Kunne ikke hente varebeholdning");
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery]);

  useEffect(() => {
    const timer = setTimeout(fetchData, 300);
    return () => clearTimeout(timer);
  }, [fetchData]);

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/inventory/sync', { method: 'POST' });
      const json = await res.json();
      if (json.success) {
        toast(json.message || 'Synkronisering fullført', 'success');
        fetchData();
      } else {
        toast('Synkronisering feilet', 'error');
      }
    } catch (err) {
      toast('Synkronisering feilet', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <DashboardShell>
      <div className="max-w-7xl mx-auto space-y-8 py-10 px-6">
        <div className="flex items-end justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-[#1a1a1a] tracking-tighter">{i18n.inventory.title}</h1>
            <p className="text-sm text-[#6d7175] font-medium">{i18n.inventory.subtitle}</p>
          </div>
          <div className="flex items-center space-x-4">
             <button 
               onClick={handleManualSync}
               disabled={isSyncing}
               className="flex items-center px-4 py-2.5 bg-white border border-[#f1f2f3] rounded-xl text-[11px] font-black uppercase tracking-widest text-[#1a1a1a] shadow-sm hover:shadow-md transition-all disabled:opacity-50"
             >
               {isSyncing ? <Loader2 size={14} className="mr-2 animate-spin" /> : <RefreshCw size={14} className="mr-2" />}
               Synkroniser
             </button>
             <button className="flex items-center px-6 py-2.5 bg-[#005bd3] text-white rounded-xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all">
               <Plus size={16} className="mr-2" /> {i18n.inventory.addProduct}
             </button>
          </div>
        </div>

        <div className="glass-panel p-6 flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0 border-blue-100/30">
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6d7175]" size={18} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1); // Reset to page 1 on search
              }}
              placeholder={i18n.inventory.search} 
              className="w-full bg-[#fdfdfd] border border-[#f1f2f3] rounded-2xl pl-12 pr-4 h-12 text-sm font-bold focus:ring-2 focus:ring-[#005bd3] outline-none transition-all placeholder:text-[#d2d5d9]"
            />
          </div>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2 text-[10px] font-black text-[#6d7175] uppercase tracking-widest">
              <Filter size={14} />
              <span>Filter</span>
            </div>
            <div className="flex items-center space-x-2 text-[10px] font-black text-[#6d7175] uppercase tracking-widest">
              <ArrowUpDown size={14} />
              <span>Sortering</span>
            </div>
          </div>
        </div>

        <div className="glass-panel overflow-hidden border-none shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#f1f2f3]">
                  <th className="px-8 py-5 text-[10px] font-black text-[#6d7175] uppercase tracking-[0.2em]">Produkt</th>
                  <th className="px-8 py-5 text-[10px] font-black text-[#6d7175] uppercase tracking-[0.2em]">{i18n.inventory.sku}</th>
                  <th className="px-8 py-5 text-[10px] font-black text-[#6d7175] uppercase tracking-[0.2em] text-right">{i18n.inventory.stock}</th>
                  <th className="px-8 py-5 text-[10px] font-black text-[#6d7175] uppercase tracking-[0.2em] text-right">
                    {i18n.inventory.unitCost} 
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black text-[#6d7175] uppercase tracking-[0.2em] text-right">
                    {i18n.inventory.sellingPrice}
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black text-[#6d7175] uppercase tracking-[0.2em] text-right">ROI</th>
                  <th className="px-8 py-5 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1f2f3]">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={7} className="px-8 py-6">
                        <div className="h-4 bg-[#f1f2f3] rounded w-full"></div>
                      </td>
                    </tr>
                  ))
                ) : items.length > 0 ? (
                  items.map((item) => {
                    const margin = calculateROI(item.cost, item.price, priceMode);
                    const roiPercent = (item.cost > 0) ? (margin / formatPrice(item.cost, priceMode)) * 100 : 0;
                    
                    return (
                      <tr key={item.id} className="hover:bg-[#f1f2f3]/30 group transition-all duration-300">
                        <td className="px-8 py-6">
                          <div className="space-y-0.5">
                            <p className="text-[13px] font-bold text-[#1a1a1a] group-hover:text-[#005bd3] transition-colors line-clamp-1">{item.product_name}</p>
                            <p className="text-[9px] font-black text-[#6d7175] uppercase tracking-tighter">Variant #{item.variant_id.split('/').pop()}</p>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className="text-[11px] font-black text-[#6d7175] font-mono bg-[#f1f2f3] px-2 py-0.5 rounded">{item.sku}</span>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <span className={cn(
                            "text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter border",
                            item.stock < 5 ? "bg-red-50 text-red-600 border-red-100" : "bg-gray-50 text-[#1a1a1a] border-gray-100"
                          )}>
                            {item.stock} stk
                          </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <span className="text-xs font-bold text-[#1a1a1a]">{formatCurrency(formatPrice(item.cost, priceMode))}</span>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <span className="text-xs font-black text-[#1a1a1a]">{formatCurrency(formatPrice(item.price, priceMode))}</span>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <span className={cn(
                            "text-xs font-black tracking-tighter",
                            roiPercent > 30 ? "text-[#108043]" : "text-[#1a1a1a]"
                          )}>
                            {formatPercent(roiPercent)}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <button className="p-2 text-[#d2d5d9] hover:text-[#1a1a1a] hover:bg-white rounded-lg transition-all border border-transparent hover:border-[#f1f2f3]">
                            <MoreHorizontal size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="px-8 py-20 text-center">
                       <div className="flex flex-col items-center justify-center space-y-4">
                          <div className="w-16 h-16 bg-[#f1f2f3] rounded-3xl flex items-center justify-center text-[#d2d5d9]">
                             <Package size={32} />
                          </div>
                          <div className="space-y-1">
                             <p className="text-sm font-black text-[#1a1a1a]">Ingen treff</p>
                             <p className="text-xs text-[#6d7175]">Prøv et annet søkeord eller synkroniser på nytt.</p>
                          </div>
                       </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div className="px-8 py-5 border-t border-[#f1f2f3] flex items-center justify-between">
            <p className="text-[10px] font-black text-[#6d7175] uppercase tracking-widest">
              Viser {items.length} av {pagination.total} varianter
            </p>
            <div className="flex space-x-3">
              <button 
                disabled={page <= 1 || loading}
                onClick={() => setPage(prev => prev - 1)}
                className="px-4 py-2 rounded-xl border border-[#f1f2f3] text-[10px] font-black uppercase tracking-widest hover:bg-[#f1f2f3] transition-all disabled:opacity-50 flex items-center"
              >
                <ChevronLeft size={14} className="mr-1" /> Forrige
              </button>
              <button 
                disabled={page >= pagination.total_pages || loading}
                onClick={() => setPage(prev => prev + 1)}
                className="px-4 py-2 rounded-xl border border-[#f1f2f3] text-[10px] font-black uppercase tracking-widest hover:bg-[#f1f2f3] transition-all disabled:opacity-50 flex items-center"
              >
                Neste <ChevronRight size={14} className="ml-1" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
