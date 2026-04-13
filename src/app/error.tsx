"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCcw, Home } from "lucide-react";
import { clientLogger } from "@/lib/client-logger";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error for diagnostics
    clientLogger.error("Critical System Failure", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#fdfdfd] flex items-center justify-center p-6 font-sans">
      <div className="max-w-xl w-full bg-white rounded-3xl shadow-2xl shadow-black/5 border border-red-100 p-10 space-y-8 relative overflow-hidden">
        {/* Background Accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full -mr-16 -mt-16 blur-3xl opacity-50" />
        
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center text-red-600 mb-2">
            <AlertTriangle size={32} />
          </div>
          
          <h1 className="text-3xl font-black text-[#1a1a1a] tracking-tight">
            Systemgjenoppretting
          </h1>
          
          <p className="text-sm text-[#6d7175] font-medium leading-relaxed">
            Sovereign har støtt på en uventet feil i runtime-miljøet. 
            Dette skyldes vanligvis en manglende konfigurasjon eller en inkompatibel nettleser-økt.
          </p>
        </div>

        <div className="bg-[#f1f2f3] rounded-2xl p-6 space-y-3 border border-[#d2d5d9]/30">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#6d7175]">Feilmelding</span>
            {error.digest && (
              <span className="text-[8px] font-mono text-[#6d7175]">ID: {error.digest}</span>
            )}
          </div>
          <p className="text-xs font-mono text-red-600 break-all bg-white/50 p-3 rounded-lg border border-red-50">
            {error.message || "Ukjent runtime-feil"}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => reset()}
            className="flex items-center justify-center space-x-3 bg-[#1a1a1a] text-white py-4 rounded-2xl font-black text-sm hover:bg-black transition-all shadow-lg shadow-black/10 active:scale-95"
          >
            <RefreshCcw size={16} />
            <span>Prøv på nytt</span>
          </button>
          
          <button
            onClick={() => window.location.href = '/'}
            className="flex items-center justify-center space-x-3 bg-white border border-[#f1f2f3] text-[#1a1a1a] py-4 rounded-2xl font-black text-sm hover:bg-[#f1f2f3] transition-all active:scale-95"
          >
            <Home size={16} />
            <span>Hjempanel</span>
          </button>
        </div>

        <div className="text-center">
          <p className="text-[10px] text-[#6d7175] font-bold uppercase tracking-tighter">
            Skarsten Digital Diagnostic Layer • v0.1.0
          </p>
        </div>
      </div>
    </div>
  );
}
