"use client";

import React, { useState, useEffect } from "react";
import { ListChecks, AlertCircle, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { clientLogger } from "@/lib/client-logger";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";

export function StagedUpdatesQueue() {
  const { toast } = useToast();
  const [updates, setUpdates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);
  const [isConfirmingExecute, setIsConfirmingExecute] = useState(false);

  const fetchUpdates = async () => {
    try {
      const res = await fetch('/api/staged-updates?status=pending&limit=10');
      if (res.ok) {
        const json = await res.json();
        if (json.success) setUpdates(json.data);
      }
    } catch (err: unknown) {
      clientLogger.error("Failed to fetch staged updates", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUpdates();
  }, []);

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    try {
      const res = await fetch(`/api/staged-updates/${id}/${action}`, { method: 'POST' });
      if (res.ok) {
        setUpdates(prev => prev.filter(u => u.id !== id));
      }
    } catch (err: unknown) {
      clientLogger.error(`Failed to ${action} update`, err);
    }
  };

  const handleExecute = async () => {
    if (!isConfirmingExecute) {
      setIsConfirmingExecute(true);
      return;
    }
    setIsConfirmingExecute(false);
    setExecuting(true);
    try {
      const res = await fetch('/api/staged-updates/execute', { method: 'POST' });
      const json = await res.json();
      if (json.success) {
        toast(json.message || 'Prisendringer utført', 'success');
        fetchUpdates();
      } else {
        toast('Utførelse feilet', 'error');
      }
    } catch (err: unknown) {
      clientLogger.error("Failed to execute updates", err);
      toast('Utførelse feilet', 'error');
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1a1a1a] flex items-center">
            <ListChecks size={16} className="mr-3 text-[#005bd3]" /> Godkjenninger
          </h3>
          <span className="text-[10px] font-black bg-blue-50 text-[#005bd3] px-2 py-0.5 rounded-full border border-blue-100 uppercase tracking-widest">
            {updates.length} Venter
          </span>
        </div>
      {updates.length > 0 && (
          <div className="flex items-center space-x-2">
            {isConfirmingExecute ? (
              <>
                <span className="text-[9px] font-bold text-amber-600">Sikker?</span>
                <button
                  onClick={handleExecute}
                  disabled={executing}
                  className="text-[9px] font-black bg-amber-500 text-white px-3 py-1 rounded-lg uppercase tracking-widest hover:bg-amber-600 transition-all disabled:opacity-50"
                >
                  {executing ? '...' : 'Ja'}
                </button>
                <button
                  onClick={() => setIsConfirmingExecute(false)}
                  className="text-[9px] font-black text-[#6d7175] hover:text-[#1a1a1a] transition-colors"
                >
                  Nei
                </button>
              </>
            ) : (
              <button 
                onClick={handleExecute}
                disabled={executing}
                className="text-[9px] font-black bg-[#1a1a1a] text-white px-3 py-1 rounded-lg uppercase tracking-widest hover:bg-black transition-all disabled:opacity-50"
              >
                {executing ? "Utfører..." : "Kjør alle"}
              </button>
            )}
          </div>
        )}

      </div>

      <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full space-y-2">
            <Loader2 className="animate-spin text-[#d2d5d9]" size={24} />
            <p className="text-[9px] text-[#6d7175] font-black uppercase tracking-widest">Sjekker kø...</p>
          </div>
        ) : updates.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full space-y-4 p-6 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
            <CheckCircle2 size={32} className="text-gray-300" />
            <div className="text-center space-y-1">
              <p className="text-[11px] font-black text-[#1a1a1a] uppercase tracking-tighter">Køen er tom</p>
              <p className="text-[9px] text-[#6d7175] font-medium leading-tight">Ingen anbefalinger venter.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {updates.map((update) => (
              <div key={update.id} className="p-4 bg-white border border-[#f1f2f3] rounded-2xl space-y-3 hover:border-blue-200 transition-all group">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-[#1a1a1a] uppercase tracking-tighter">{update.reason}</p>
                    <div className="flex items-center space-x-2">
                       <span className="text-[11px] font-bold text-[#6d7175] line-through">{update.original_value} kr</span>
                       <span className="text-[11px] font-black text-[#108043]">{update.suggested_value} kr</span>
                    </div>
                  </div>
                  <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleAction(update.id, 'approve')}
                      className="p-2 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-colors"
                      title="Godkjenn"
                    >
                      <CheckCircle2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleAction(update.id, 'reject')}
                      className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
                      title="Avvis"
                    >
                      <XCircle size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="pt-2 border-t border-[#f1f2f3]">
        <button className="w-full text-center text-[9px] font-black text-[#6d7175] uppercase tracking-[0.15em] hover:text-[#1a1a1a] transition-colors py-2">
          Gå til Staging Hub →
        </button>
      </div>
    </div>
  );
}
