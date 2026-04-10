/**
 * Sales & Pricing Intelligence Components
 * 
 * Provides high-density financial visuals for the Merchant Intelligence Hub.
 * Using Recharts for minimalist, actionable trends.
 */

"use client";

import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { cn } from '@/lib/utils';

// Mock data for the sales velocity
const salesData = [
  { date: '01.04', sales: 12000, margin: 22 },
  { date: '02.04', sales: 15000, margin: 24 },
  { date: '03.04', sales: 11000, margin: 23 },
  { date: '04.04', sales: 18000, margin: 25 },
  { date: '05.04', sales: 22000, margin: 24 },
  { date: '06.04', sales: 16000, margin: 26 },
  { date: '07.04', sales: 18250, margin: 24 },
];

export function SalesVelocityChart() {
  return (
    <div className="w-full h-full min-h-[250px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={salesData}>
          <defs>
            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#005bd3" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#005bd3" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f2f3" />
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{fontSize: 10, fill: '#6d7175', fontWeight: 'bold'}}
            dy={10}
          />
          <YAxis hide />
          <Tooltip 
            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', fontSize: '12px' }}
          />
          <Area 
            type="monotone" 
            dataKey="sales" 
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
  return (
    <div className="space-y-4">
       <div className="flex items-end justify-between">
          <div>
            <p className="text-[11px] font-bold text-[#6d7175] uppercase tracking-wider">Total COGS (Innkjøp)</p>
            <p className="text-lg font-black text-[#1a1a1a]">933,200 kr</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-bold text-[#108043] uppercase tracking-wider">Urealisert Gevinst</p>
            <p className="text-lg font-black text-[#108043]">+312,400 kr</p>
          </div>
       </div>
       <div className="w-full h-2 bg-[#f1f2f3] rounded-full overflow-hidden flex">
          <div className="h-full bg-[#1a1a1a]" style={{ width: '75%' }}></div>
          <div className="h-full bg-[#108043]" style={{ width: '25%' }}></div>
       </div>
       <p className="text-[10px] text-[#6d7175] italic">
         Din portefølje har økt med 33.4% siden anskaffelse.
       </p>
    </div>
  );
}
