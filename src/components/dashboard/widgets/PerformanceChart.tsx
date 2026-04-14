"use client";

import React, { useState, useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { Activity, Loader2, Info } from 'lucide-react';
import { clientLogger } from '@/lib/client-logger';
import { cn } from '@/lib/utils';

interface TrendDataPoint {
  date: string;
  value: number;
  [key: string]: string | number;
}

export function PerformanceChart() {
  const [view, setView] = useState<'trend' | 'roi'>('trend');
  const [data, setData] = useState<TrendDataPoint[]>([]);
  const [roiData, setRoiData] = useState<TrendDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [trendRes, roiRes] = await Promise.all([
          fetch('/api/stats?type=history'),
          fetch('/api/stats/roi')
        ]);
        
        const trendJson = await trendRes.json();
        const roiJson = await roiRes.json();
        
        if (trendJson.success) setData(trendJson.data);
        if (roiJson.success) setRoiData(roiJson.data);
      } catch (err) {
        clientLogger.error("Failed to fetch chart data", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-3">
        <Loader2 className="animate-spin text-[#005bd3]" size={32} />
        <p className="text-[10px] text-[#6d7175] font-black uppercase tracking-widest">Analyserer trend...</p>
      </div>
    );
  }

  const currentData = view === 'trend' ? data : roiData;
  const hasData = currentData.length > 0;

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4 text-center px-10">
        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
           <Activity size={24} />
        </div>
        <div className="space-y-1">
          <p className="text-[11px] font-black text-[#1a1a1a] uppercase tracking-tighter">Nok data mangler</p>
          <p className="text-[9px] text-[#6d7175] font-medium leading-tight">
            {view === 'trend' ? 'Prishistorikk vil dukke opp her etter dine første oppdateringer.' : 'Registrer innkjøp for å se ROI-analyse.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1a1a1a] flex items-center">
          <Activity size={16} className="mr-3 text-[#005bd3]" /> {view === 'trend' ? 'Markedsutvikling' : 'ROI per Klasse'}
        </h3>
        
        <div className="flex bg-[#f1f2f3] p-1 rounded-xl">
          <button 
            onClick={() => setView('trend')}
            className={cn(
              "px-3 py-1 text-[8px] font-black uppercase tracking-widest rounded-lg transition-all",
              view === 'trend' ? "bg-white text-[#1a1a1a] shadow-sm" : "text-[#6d7175] hover:text-[#1a1a1a]"
            )}
          >
            Trend
          </button>
          <button 
            onClick={() => setView('roi')}
            className={cn(
              "px-3 py-1 text-[8px] font-black uppercase tracking-widest rounded-lg transition-all",
              view === 'roi' ? "bg-white text-[#1a1a1a] shadow-sm" : "text-[#6d7175] hover:text-[#1a1a1a]"
            )}
          >
            ROI
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 -ml-6">
        <ResponsiveContainer width="100%" height="100%">
          {view === 'trend' ? (
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#005bd3" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#005bd3" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f2f3" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 9, fontWeight: 700, fill: '#6d7175' }} 
                dy={10}
              />
              <YAxis hide domain={['auto', 'auto']} />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '16px', border: 'none', 
                  boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
                  fontSize: '11px', fontWeight: '800'
                }} 
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#005bd3" strokeWidth={3} 
                fillOpacity={1} fill="url(#colorValue)" 
                animationDuration={2000}
              />
            </AreaChart>
          ) : (
            <AreaChart data={roiData}>
               <defs>
                <linearGradient id="colorRoi" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#108043" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#108043" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f2f3" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 9, fontWeight: 700, fill: '#6d7175' }} 
                dy={10}
              />
              <YAxis hide domain={[0, 'auto']} />
              <Tooltip 
                formatter={(val: number | string) => [`${parseFloat(String(val)).toFixed(1)}%`, 'ROI']}
                contentStyle={{ 
                  borderRadius: '16px', border: 'none', 
                  boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
                  fontSize: '11px', fontWeight: '800'
                }} 
              />
              <Area 
                type="step" 
                dataKey="roi" 
                stroke="#108043" strokeWidth={3} 
                fillOpacity={1} fill="url(#colorRoi)"
                animationDuration={2000}
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>

      <div className="flex items-center space-x-2 p-3 bg-blue-50/50 rounded-2xl border border-blue-100">
         <Info size={14} className="text-[#005bd3] shrink-0" />
         <p className="text-[9px] text-[#6d7175] font-medium leading-tight">
            {view === 'trend'
              ? "Denne grafen viser gjennomsnittsprisen på dine lagerførte varer over tid."
              : "Viser avkastning (fortjeneste / kostnad) per lagerklasse basert på innkjøpspris."}
         </p>
            </div>
    </div>
  );
}
