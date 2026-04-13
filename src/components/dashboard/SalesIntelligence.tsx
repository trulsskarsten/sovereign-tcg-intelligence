/**
 * Sales & Pricing Intelligence Components
 *
 * Provides high-density financial visuals for the Merchant Intelligence Hub.
 * Uses Recharts for minimalist, actionable trends.
 */

"use client";

import React, { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { Loader2 } from 'lucide-react';
import { clientLogger } from '@/lib/client-logger';

/** Matches the shape returned by GET /api/stats?type=history */
interface HistoryDataPoint {
  name: string;
  value: number;
  volume: number;
}

/** Derived from GET /api/stats default KPI response */
interface PortfolioStats {
  totalCogs: number;
  unrealizedGain: number;
  gainPercent: number;
}

export function SalesVelocityChart() {
  const [data, setData] = useState<HistoryDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await fetch('/api/stats?type=history');
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setData(json.data);
        }
      } catch (err: unknown) {
        clientLogger.error('Failed to fetch sales history', err);
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[250px]">
        <Loader2 className="animate-spin text-[#d2d5d9]" size={24} />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[250px] space-y-2">
        <p className="text-[11px] font-black text-[#6d7175] uppercase tracking-widest">Ingen salgsdata ennå</p>
        <p className="text-[10px] text-[#d2d5d9]">Data vises etter første synkronisering</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[250px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#005bd3" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#005bd3" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f2f3" />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{fontSize: 10, fill: '#6d7175', fontWeight: 'bold'}}
            dy={10}
          />
          <YAxis hide />
          <Tooltip
            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', fontSize: '12px' }}
            formatter={(val: any) => [`${Number(val).toLocaleString('no-NO')} kr`, 'Verdi']}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#005bd3"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorSales)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function UnrealizedGainTracker() {
  const [stats, setStats] = useState<PortfolioStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPortfolio() {
      try {
        const res = await fetch('/api/stats');
        const json = await res.json();
        if (json.success && json.data && json.data.totalValueNok > 0) {
          const totalCogs = json.data.totalValueNok;
          const unrealizedGain = json.data.potentialProfitNok;
          const gainPercent = totalCogs > 0 ? (unrealizedGain / totalCogs) * 100 : 0;
          setStats({ totalCogs, unrealizedGain, gainPercent });
        }
      } catch (err: unknown) {
        clientLogger.error('Failed to fetch portfolio stats', err);
      } finally {
        setLoading(false);
      }
    }
    fetchPortfolio();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-20">
        <Loader2 className="animate-spin text-[#d2d5d9]" size={20} />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="space-y-4">
        <p className="text-[11px] font-black text-[#6d7175] uppercase tracking-wider">
          Ingen porteføljedata — kjør synkronisering først
        </p>
      </div>
    );
  }

  const cogsFormatted = stats.totalCogs.toLocaleString('no-NO');
  const gainFormatted = stats.unrealizedGain.toLocaleString('no-NO');
  const cogsWidth = Math.round((stats.totalCogs / (stats.totalCogs + stats.unrealizedGain)) * 100);
  const gainWidth = 100 - cogsWidth;

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[11px] font-bold text-[#6d7175] uppercase tracking-wider">Total COGS (Innkjøp)</p>
          <p className="text-lg font-black text-[#1a1a1a]">{cogsFormatted} kr</p>
        </div>
        <div className="text-right">
          <p className="text-[11px] font-bold text-[#108043] uppercase tracking-wider">Urealisert Gevinst</p>
          <p className="text-lg font-black text-[#108043]">+{gainFormatted} kr</p>
        </div>
      </div>
      <div className="w-full h-2 bg-[#f1f2f3] rounded-full overflow-hidden flex">
        <div className="h-full bg-[#1a1a1a]" style={{ width: `${cogsWidth}%` }}></div>
        <div className="h-full bg-[#108043]" style={{ width: `${gainWidth}%` }}></div>
      </div>
      <p className="text-[10px] text-[#6d7175] italic">
        Din portefølje har økt med {stats.gainPercent.toFixed(1)}% siden anskaffelse.
      </p>
    </div>
  );
}
