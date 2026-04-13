'use client';

import { Suspense, useEffect, useState, ReactNode } from 'react';
import { useSearchParams } from 'next/navigation';
import { Provider, useAppBridge } from '@shopify/app-bridge-react';
import { getSessionToken } from '@shopify/app-bridge-utils';
import { clientLogger } from '@/lib/client-logger';
import { AlertCircle, RotateCcw } from 'lucide-react';

/**
 * Internal component to handle the backend Token Exchange.
 * Must be child of <Provider> to access useAppBridge.
 */
function TokenExchangeHandler({ 
  onComplete,
  onError,
  retryCount
}: { 
  onComplete: () => void;
  onError: (msg: string) => void;
  retryCount: number;
}) {
  const app = useAppBridge();
  const searchParams = useSearchParams();

  useEffect(() => {
    async function performExchange() {
      const fetchUrl = `${window.location.origin}/api/auth/token-exchange?v=${Date.now()}`;
      try {
        // [STEP 1] Get Session Token
        let sessionToken;
        try {
          sessionToken = await getSessionToken(app);
        } catch (tokenErr: any) {
          throw new Error(`[TRACE: TOKEN] Kunne ikke hente session-token fra Shopify: ${tokenErr.message}`);
        }

        const shop = searchParams.get('shop');

        // [STEP 2] Perform Fetch
        let response;
        try {
          response = await fetch(fetchUrl, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'X-Diagnostics': 'true'
            },
            body: JSON.stringify({ sessionToken, shop: shop || undefined }),
          });
        } catch (fetchErr: any) {
          throw new Error(`[TRACE: FETCH] Nettverksfeil mot ${fetchUrl}: ${fetchErr.message}`);
        }

        // [STEP 3] Read Response Body
        const text = await response.text();
        
        // [STEP 4] Parse JSON
        let data;
        try {
          data = JSON.parse(text);
        } catch (e) {
          throw new Error(`[TRACE: PARSE] Serveren returnerte HTML istedenfor JSON (Status ${response.status}). URL: ${fetchUrl}. Sjekk om Vercel Authentication er PÅ. Preview: ${text.substring(0, 200).replace(/</g, '&lt;')}...`);
        }

        if (!response.ok) {
          throw new Error(`[TRACE: SERVER] ${data.error || 'Ukjent serverfeil'} (${response.status})`);
        }

        onComplete();
      } catch (error: any) {
        clientLogger.error('Auth Error', error);
        // Ensure the full trace message is passed to the UI
        onError(error.message || 'Ukjent feil i autentiseringskjeden');
      }
    }

    performExchange();
  }, [app, searchParams, onComplete, onError, retryCount]);

  return null;
}

/**
 * Inner component that uses search params safely.
 * Nesting this inside a Suspense boundary prevents the whole provider tree from suspending.
 */
function AppBridgeContent({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();
  const [appConfig, setAppConfig] = useState<{ apiKey: string; host: string } | null>(null);
  const [status, setStatus] = useState<'loading' | 'authorized' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isMissingApiKey, setIsMissingApiKey] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const host = searchParams.get('host');
    const apiKey = process.env.NEXT_PUBLIC_SHOPIFY_API_KEY;

    if (!apiKey) {
      setIsMissingApiKey(true);
      return;
    }

    if (host && apiKey) {
      setAppConfig({ apiKey, host });
    }
  }, [searchParams]);

  // Handle missing configuration gracefully
  if (isMissingApiKey) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-red-50 z-50 p-8 text-center">
        <div className="max-w-md space-y-4">
           <div className="text-red-600 font-black text-2xl uppercase tracking-tighter">Konfigurasjonsfeil</div>
           <p className="text-sm text-red-800 font-sans">
             <code>NEXT_PUBLIC_SHOPIFY_API_KEY</code> mangler i Vercel-oppsettet. 
             Vennligst legg til denne nøkkelen i Vercel Dashboard og redeploy.
           </p>
           <div className="text-[10px] text-red-400 font-mono">
             Status: Client Hydrated, Environment Variables Missing
           </div>
        </div>
      </div>
    );
  }

  // If no host is provided, we're likely in a direct browser session (not Shopify)
  if (!appConfig) {
    return <>{children}</>;
  }

  return (
    <Provider config={appConfig}>
      {status === 'loading' && (
        <div className="fixed inset-0 flex items-center justify-center bg-white/90 backdrop-blur-md z-50">
          <div className="flex flex-col items-center gap-6 font-sans text-center">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-[#005bd310] rounded-full" />
              <div className="absolute inset-0 w-12 h-12 border-4 border-[#005bd3] border-t-transparent rounded-full animate-spin" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-black text-[#1a1a1a] uppercase tracking-[0.2em]">
                Sovereign Intelligence
              </p>
              <p className="text-[10px] font-bold text-[#6d7175] uppercase tracking-widest animate-pulse">
                Initialiserer sikker tilkobling...
              </p>
            </div>
            <div className="absolute bottom-8 text-[8px] font-mono text-[#005bd340] uppercase tracking-tighter">
              VER: REV-ULTRA
            </div>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="fixed inset-0 flex items-center justify-center bg-red-50/95 backdrop-blur-xl z-50 p-6">
          <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-red-100 p-10 space-y-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center text-red-600 mx-auto shadow-inner">
              <AlertCircle size={32} />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-xl font-black text-[#1a1a1a] tracking-tight uppercase">Autentisering Feilet</h1>
              <p className="text-xs text-[#6d7175] font-medium leading-relaxed">
                Vi kunne ikke koble Sovereing til Shopify-butikken din. Dette kan skyldes en midlertidig feil eller manglende rettigheter.
              </p>
            </div>

            <div className="bg-[#fdf2f2] rounded-2xl p-4 text-[10px] font-mono text-left break-all text-red-700 border border-red-50">
              DEBUG_ERROR: {errorMsg}
            </div>

            <button
              onClick={() => {
                setStatus('loading');
                setErrorMsg(null);
                setRetryCount(c => c + 1);
              }}
              className="w-full flex items-center justify-center space-x-2 bg-[#1a1a1a] text-white py-4 rounded-xl font-black text-xs hover:bg-black transition-all shadow-lg active:scale-95"
            >
              <RotateCcw size={14} />
              <span>Prøv på nytt</span>
            </button>
            <div className="text-[8px] font-mono text-gray-300 uppercase tracking-tighter pt-4">
              VER: REV-FINAL
            </div>
          </div>
        </div>
      )}

      <TokenExchangeHandler 
        retryCount={retryCount}
        onComplete={() => setStatus('authorized')} 
        onError={(msg) => {
          setStatus('error');
          setErrorMsg(msg);
        }}
      />
      {children}
    </Provider>
  );
}

export default function AppBridgeProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent any rendering before hydration to avoid React 19 hydration crashes
  if (!mounted) {
    return <div className="bg-[#fdfdfd] min-h-screen" />;
  }

  return (
    <Suspense fallback={<div className="bg-[#fdfdfd] min-h-screen" />}>
      <AppBridgeContent>{children}</AppBridgeContent>
    </Suspense>
  );
}
