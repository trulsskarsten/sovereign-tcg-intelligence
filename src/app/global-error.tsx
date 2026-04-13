'use client';

import { useEffect } from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { clientLogger } from '@/lib/client-logger';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error for diagnostics
    clientLogger.error('Critical Root Layout Failure', error);
  }, [error]);

  return (
    <html lang="no">
      <body className="min-h-screen bg-[#fdfdfd] flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-red-100 p-10 space-y-6 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600 mx-auto">
            <AlertCircle size={32} />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-[#1a1a1a] tracking-tight uppercase">
              Kritisk Systemfeil
            </h1>
            <p className="text-sm text-[#6d7175] font-medium leading-relaxed">
              En fatal feil har oppstått i applikasjonens kjerne. 
              Dette skyldes vanligvis en manglende tilkobling til Shopify eller Supabase.
            </p>
          </div>

          <div className="bg-[#f1f2f3] rounded-2xl p-4 text-[10px] font-mono text-left break-all text-red-700 border border-red-50">
            {error.message || 'Ukjent runtime-feil i rot-layout'}
          </div>

          <button
            onClick={() => reset()}
            className="w-full flex items-center justify-center space-x-2 bg-[#1a1a1a] text-white py-4 rounded-xl font-bold text-sm hover:bg-black transition-all shadow-lg"
          >
            <RotateCcw size={16} />
            <span>Last inn på nytt</span>
          </button>
          
          <p className="text-[10px] text-[#6d7175] font-black uppercase tracking-widest pt-4 opacity-50">
            Sovereign Ops Core Recovery
          </p>
        </div>
      </body>
    </html>
  );
}
