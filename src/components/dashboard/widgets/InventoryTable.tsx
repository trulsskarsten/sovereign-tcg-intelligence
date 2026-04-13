"use client";

import React, { useState, useEffect } from "react";
import { Package, Search, ExternalLink, Loader2 } from "lucide-react";
import { clientLogger } from "@/lib/client-logger";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/i18n";
import { useToast } from "@/components/ui/Toast";

export function InventoryTable() {
  const { toast } = useToast();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activePurchaseItem, setActivePurchaseItem] = useState<string | null>(null);
  const [purchaseForm, setPurchaseForm] = useState({ qty: "1", cost: "" });

  useEffect(() => {
    async function fetchInventory() {
      try {
        const res = await fetch(`/api/inventory?limit=5&q=${search}`);
        const json = await res.json();
        if (json.success) setItems(json.data);
      } catch (err: unknown) {
        clientLogger.error("Failed to fetch inventory", err);
      } finally {
        setLoading(false);
      }
    }
    const timer = setTimeout(fetchInventory, 300);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1a1a1a] flex items-center">
          <Package size={16} className="mr-3 text-[#005bd3]" /> Siste Produkter
        </h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6d7175]" size={12} />
          <input 
            type="text" 
            placeholder="Søk..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 pr-4 py-1.5 bg-[#f1f2f3] rounded-lg text-[11px] border-none focus:ring-1 focus:ring-blue-500 w-32 transition-all focus:w-48"
          />
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full space-y-2">
            <Loader2 className="animate-spin text-[#d2d5d9]" size={24} />
            <p className="text-[9px] text-[#6d7175] font-black uppercase tracking-widest">Henter lager...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-[#6d7175]">
            <p className="text-[10px] font-bold">Ingen varer funnet</p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#f1f2f3]">
                  <th className="py-2 text-[9px] font-black text-[#6d7175] uppercase tracking-widest">Produkt</th>
                  <th className="py-2 text-[9px] font-black text-[#6d7175] uppercase tracking-widest text-right">Lager</th>
                  <th className="py-2 text-[9px] font-black text-[#6d7175] uppercase tracking-widest text-right">Pris</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1f2f3]">
                {items.map((item) => (
                  <React.Fragment key={item.variant_id}>
                    <tr className="group hover:bg-[#f9fafb] transition-colors relative">
                      <td className="py-3">
                        <div className="flex flex-col">
                          <span className="text-[11px] font-bold text-[#1a1a1a] line-clamp-1">{item.product_name}</span>
                          <span className="text-[9px] text-[#6d7175] font-medium tracking-tighter uppercase">{item.sku}</span>
                        </div>
                      </td>
                      <td className="py-3 text-right">
                        <span className={cn(
                          "text-[11px] font-black",
                          item.stock <= 2 ? "text-red-600" : "text-[#1a1a1a]"
                        )}>
                          {item.stock}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <span className="text-[11px] font-black text-[#1a1a1a]">
                            {formatCurrency(item.price)}
                          </span>
                          <button 
                            onClick={() => {
                              setActivePurchaseItem(activePurchaseItem === item.variant_id ? null : item.variant_id);
                              setPurchaseForm({ qty: "1", cost: item.cost?.toString() || "" });
                            }}
                            className={cn(
                              "p-1 hover:bg-[#f1f2f3] rounded transition-all text-[#005bd3]",
                              activePurchaseItem === item.variant_id ? "opacity-100 bg-[#f1f2f3]" : "opacity-0 group-hover:opacity-100"
                            )}
                            title="Registrer innkjøp"
                          >
                            <Package size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {activePurchaseItem === item.variant_id && (
                      <tr className="bg-blue-50/30">
                        <td colSpan={3} className="px-4 py-3">
                          <div className="flex items-center space-x-3">
                            <div className="flex-1 space-y-1">
                              <label className="text-[8px] font-black uppercase text-blue-600">Antall</label>
                              <input 
                                type="number" 
                                value={purchaseForm.qty}
                                onChange={(e) => setPurchaseForm(prev => ({ ...prev, qty: e.target.value }))}
                                className="w-full bg-white border-none rounded-md px-2 py-1 text-[10px] font-bold h-7 focus:ring-1 focus:ring-blue-400"
                              />
                            </div>
                            <div className="flex-1 space-y-1">
                              <label className="text-[8px] font-black uppercase text-blue-600">Pris pr stk</label>
                              <input 
                                type="number" 
                                placeholder="kr"
                                value={purchaseForm.cost}
                                onChange={(e) => setPurchaseForm(prev => ({ ...prev, cost: e.target.value }))}
                                className="w-full bg-white border-none rounded-md px-2 py-1 text-[10px] font-bold h-7 focus:ring-1 focus:ring-blue-400"
                              />
                            </div>
                            <div className="flex space-x-2 pt-3">
                              <button 
                                onClick={() => setActivePurchaseItem(null)}
                                className="px-3 py-1 text-[9px] font-black text-[#6d7175] uppercase hover:bg-white rounded-md transition-all"
                              >
                                Avbryt
                              </button>
                              <button 
                                onClick={() => registerPurchase(item.variant_id, parseInt(purchaseForm.qty), parseFloat(purchaseForm.cost))}
                                className="px-3 py-1 text-[9px] font-black text-white bg-[#005bd3] uppercase rounded-md shadow-sm hover:bg-blue-700 transition-all"
                              >
                                Lagre
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      <div className="pt-2 border-t border-[#f1f2f3]">
        <button className="w-full text-center text-[9px] font-black text-[#005bd3] uppercase tracking-[0.15em] hover:text-blue-700 transition-colors py-2">
          Se alle produkter i lageret →
        </button>
      </div>
    </div>
  );

  async function registerPurchase(variantId: string, qty: number, cost: number) {
    if (isNaN(qty) || isNaN(cost) || qty <= 0 || cost <= 0) {
      toast('Vennligst fyll ut gyldige verdier', 'error');
      return;
    }

    try {
      const res = await fetch("/api/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shopify_variant_id: variantId,
          qty,
          unit_cost: cost
        })
      });
      const data = await res.json();
      if (data.success) {
        setActivePurchaseItem(null);
        setPurchaseForm({ qty: '1', cost: '' });
        toast('Innkjøp registrert', 'success');
      } else {
        toast(data.error || 'Registrering feilet', 'error');
      }
    } catch (err) {
      clientLogger.error("Failed to register purchase", err);
      toast('Registrering feilet', 'error');
    }
  }
}
