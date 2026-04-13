"use client";

import React, { useState, useEffect, useCallback } from 'react';
import DashboardShell from '@/components/DashboardShell';
import { useToast } from '@/components/ui/Toast';
import { 
  ShieldAlert, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  Gem, 
  Package, 
  Star,
  Zap,
  Loader2,
  XCircle,
  MoreVertical
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/i18n';
import { clientLogger } from '@/lib/client-logger';

export default function StagingHub() {
  const { toast } = useToast();
  const [activeFilter, setActiveFilter] = useState('pending');
  const [updates, setUpdates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);
  const [isConfirmingExecute, setIsConfirmingExecute] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkProcessing, setBulkProcessing] = useState(false);

  const fetchUpdates = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/staged-updates?status=${activeFilter}&limit=100`);
      const json = await res.json();
      if (json.success) {
        setUpdates(json.data);
      }
    } catch (err: unknown) {
      clientLogger.error("Failed to fetch staged updates", err);
    } finally {
      setLoading(false);
    }
  }, [activeFilter]);

  useEffect(() => {
    fetchUpdates();
    setSelectedIds([]); // Clear selection when filter changes
  }, [fetchUpdates]);

  const toggleAll = () => {
    if (selectedIds.length === updates.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(updates.map(u => u.id));
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkAction = async (action: 'approve' | 'reject') => {
    if (selectedIds.length === 0) return;
    
    setBulkProcessing(true);
    try {
      const res = await fetch(`/api/staged-updates/bulk-${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds })
      });
      
      if (res.ok) {
        setUpdates(prev => prev.filter(u => !selectedIds.includes(u.id)));
        setSelectedIds([]);
      }
    } catch (err) {
      clientLogger.error(`Bulk ${action} failed`, err);
    } finally {
      setBulkProcessing(false);
    }
  };

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    try {
      const res = await fetch(`/api/staged-updates/${id}/${action}`, { method: 'POST' });
      if (res.ok) {
        setUpdates(prev => prev.filter(u => u.id !== id));
        toast(action === 'approve' ? 'Oppdatering godkjent' : 'Oppdatering avvist', action === 'approve' ? 'success' : 'info');
      }
    } catch (err) {
      toast(`Handlingen feilet`, 'error');
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
    } catch (err) {
      toast('Utførelse feilet', 'error');
    } finally {
      setExecuting(false);
    }
  };

  const totalsByStatus = {
    pending: updates.filter(u => u.status === 'pending').length,
    approved: updates.filter(u => u.status === 'approved').length,
  };

  return (
    <DashboardShell>
      <div className="max-w-7xl mx-auto py-10 px-6">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="space-y-1">
              <h1 className="text-3xl font-black text-[#1a1a1a] tracking-tighter">Staging & Godkjenning</h1>
              <p className="text-sm text-[#6d7175] font-medium tracking-tight">
                Gjennomgå og godkjenn foreslåtte endringer fra intelligens-motoren.
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {isConfirmingExecute ? (
                <>
                  <span className="text-[11px] font-bold text-amber-600">Er du sikker?</span>
                  <button
                    onClick={handleExecute}
                    disabled={executing}
                    className="inline-flex items-center px-4 py-2 bg-amber-500 text-white rounded-xl text-[11px] font-black uppercase tracking-widest shadow-md hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {executing ? <Loader2 size={14} className="mr-2 animate-spin" /> : <Zap size={14} className="mr-2" />}
                    Bekreft
                  </button>
                  <button
                    onClick={() => setIsConfirmingExecute(false)}
                    className="px-4 py-2 text-[11px] font-black uppercase tracking-widest text-[#6d7175] hover:text-[#1a1a1a] transition-colors"
                  >
                    Avbryt
                  </button>
                </>
              ) : (
                <button 
                  onClick={handleExecute}
                  disabled={executing}
                  className="inline-flex items-center px-6 py-3 bg-[#1a1a1a] text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-black/10 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                >
                  {executing ? <Loader2 size={14} className="mr-2 animate-spin" /> : <Zap size={14} className="mr-2" />}
                  Utfør alle godkjente
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2 overflow-x-auto pb-2 noscrollbar">
            {[
              { id: 'pending', label: 'Venter', count: activeFilter === 'pending' ? updates.length : '...', icon: Clock },
              { id: 'approved', label: 'Godkjent', count: activeFilter === 'approved' ? updates.length : '...', icon: Star },
              { id: 'executed', label: 'Utført', count: activeFilter === 'executed' ? updates.length : '...', icon: CheckCircle2 },
              { id: 'rejected', label: 'Avvist', count: activeFilter === 'rejected' ? updates.length : '...', icon: XCircle },
            ].map((chip) => (
              <button
                key={chip.id}
                onClick={() => setActiveFilter(chip.id)}
                className={cn(
                  "flex items-center px-5 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all border shrink-0",
                  activeFilter === chip.id 
                    ? "bg-[#005bd3] text-white border-[#005bd3] shadow-lg shadow-blue-500/20" 
                    : "bg-white text-[#6d7175] border-[#f1f2f3] hover:border-[#005bd3] hover:text-[#005bd3] shadow-sm"
                )}
              >
                <chip.icon size={14} className="mr-2" />
                {chip.label}
                <span className={cn(
                  "ml-3 px-2 py-0.5 rounded-lg text-[9px]",
                  activeFilter === chip.id ? "bg-white/20" : "bg-[#f1f2f3] text-[#1a1a1a]"
                )}>
                  {chip.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="glass-panel overflow-hidden border-none shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="px-8 py-5 w-10">
                    <input 
                      type="checkbox" 
                      checked={updates.length > 0 && selectedIds.length === updates.length}
                      onChange={toggleAll}
                      className="w-4 h-4 rounded border-[#d2d5d9] text-[#005bd3] focus:ring-[#005bd3]"
                    />
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black text-[#6d7175] uppercase tracking-[0.2em]">Årsak & Produkt</th>
                  <th className="px-8 py-5 text-[10px] font-black text-[#6d7175] uppercase tracking-[0.2em] text-right">Før</th>
                  <th className="px-8 py-5 text-[10px] font-black text-[#6d7175] uppercase tracking-[0.2em] text-right">Etter</th>
                  <th className="px-8 py-5 text-[10px] font-black text-[#6d7175] uppercase tracking-[0.2em] text-right">Dato</th>
                  <th className="px-8 py-5 w-32 text-right">Handlinger</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1f2f3]">
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={5} className="px-8 py-10">
                        <div className="h-4 bg-[#f1f2f3] rounded w-full"></div>
                      </td>
                    </tr>
                  ))
                ) : updates.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center text-[#6d7175]">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <Package size={32} />
                        <p className="text-xs font-bold uppercase tracking-widest">Ingen oppdateringer her</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  updates.map((update) => (
                    <tr 
                      key={update.id} 
                      className={cn(
                        "hover:bg-[#f1f2f3]/20 group transition-all duration-300",
                        selectedIds.includes(update.id) && "bg-blue-50/30"
                      )}
                    >
                      <td className="px-8 py-6">
                        <input 
                          type="checkbox" 
                          checked={selectedIds.includes(update.id)}
                          onChange={() => toggleSelection(update.id)}
                          className="w-4 h-4 rounded border-[#d2d5d9] text-[#005bd3] focus:ring-[#005bd3]"
                        />
                      </td>
                      <td className="px-8 py-6">
                        <div className="space-y-1">
                          <p className="text-[13px] font-bold text-[#1a1a1a]">{update.reason}</p>
                          <p className="text-[9px] font-black text-[#6d7175] uppercase tracking-tighter">Variant #{update.product_id.split('/').pop()}</p>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <span className="text-[12px] font-bold text-[#6d7175] line-through">{update.original_value} kr</span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <span className="text-[12px] font-black text-[#108043]">{update.suggested_value} kr</span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <span className="text-[10px] font-bold text-[#6d7175]">{new Date(update.created_at).toLocaleDateString('no-NO')}</span>
                      </td>
                      <td className="px-8 py-6">
                        {update.status === 'pending' && (
                          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                            <button 
                              onClick={() => handleAction(update.id, 'approve')}
                              className="p-2 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-colors"
                            >
                              <CheckCircle2 size={18} />
                            </button>
                            <button 
                              onClick={() => handleAction(update.id, 'reject')}
                              className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
                            >
                              <XCircle size={18} />
                            </button>
                          </div>
                        )}
                        {update.status !== 'pending' && (
                           <div className="flex justify-end">
                             <span className={cn(
                               "text-[9px] font-black px-2 py-0.5 rounded border uppercase tracking-widest",
                               update.status === 'approved' ? "bg-blue-50 text-blue-600 border-blue-100" :
                               update.status === 'executed' ? "bg-green-50 text-green-600 border-green-100" :
                               "bg-gray-50 text-gray-500 border-gray-100"
                             )}>
                               {update.status}
                             </span>
                           </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Floating Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50">
          <div className="bg-[#1a1a1a] text-white px-6 py-4 rounded-3xl shadow-2xl shadow-black/40 flex items-center space-x-6 border border-white/10 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center space-x-2 pr-6 border-r border-white/10">
              <span className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-[11px] font-black">
                {selectedIds.length}
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#6d7175]">valgt</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => handleBulkAction('approve')}
                disabled={bulkProcessing}
                className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
              >
                {bulkProcessing ? <Loader2 size={12} className="animate-spin mr-2" /> : <CheckCircle2 size={12} className="mr-2" />}
                Godkjenn valgte
              </button>
              
              <button 
                onClick={() => handleBulkAction('reject')}
                disabled={bulkProcessing}
                className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
              >
                {bulkProcessing ? <Loader2 size={12} className="animate-spin mr-2" /> : <XCircle size={12} className="mr-2" />}
                Avvis valgte
              </button>
              
              <button 
                onClick={() => setSelectedIds([])}
                className="text-[9px] font-black uppercase tracking-widest text-[#6d7175] hover:text-white transition-colors pl-2"
              >
                Avbryt
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
