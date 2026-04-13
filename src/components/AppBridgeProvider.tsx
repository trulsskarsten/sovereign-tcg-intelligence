'use client';

import { Suspense, useEffect, useState, ReactNode } from 'react';
import { useSearchParams } from 'next/navigation';
import { Provider, useAppBridge } from '@shopify/app-bridge-react';
import { getSessionToken } from '@shopify/app-bridge-utils';
import { clientLogger } from '@/lib/client-logger';

/**
 * Internal component to handle the backend Token Exchange.
 * Must be child of <Provider> to access useAppBridge.
 */
function TokenExchangeHandler({ 
  onComplete 
}: { 
  onComplete: () => void 
}) {
  const app = useAppBridge();
  const searchParams = useSearchParams();

  useEffect(() => {
    async function performExchange() {
      try {
        // 1. Get Session Token from App Bridge
        const sessionToken = await getSessionToken(app);
        const shop = searchParams.get('shop');

        // 2. Exchange for Access Token and Register Store
        // We pass the shop if we have it, but the backend can now extract it from the token
        const response = await fetch('/api/auth/token-exchange', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionToken, shop: shop || undefined }),
        });

        if (!response.ok) {
          throw new Error('Token exchange failed');
        }

        onComplete();
      } catch (error) {
        clientLogger.error('Auth Error', error);
      }
    }

    performExchange();
  }, [app, searchParams, onComplete]);

  return null;
}

/**
 * Inner component that uses search params safely.
 * Nesting this inside a Suspense boundary prevents the whole provider tree from suspending.
 */
function AppBridgeContent({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();
  const [appConfig, setAppConfig] = useState<{ apiKey: string; host: string } | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isMissingApiKey, setIsMissingApiKey] = useState(false);

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
      {!isAuthorized && (
        <div className="fixed inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-50">
          <div className="flex flex-col items-center gap-4 font-sans text-center">
            <div className="w-8 h-8 border-4 border-[#005bd3] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-black text-[#1a1a1a] animate-pulse uppercase tracking-widest">
              Sovereign Intelligence initialiserer...
            </p>
          </div>
        </div>
      )}
      <TokenExchangeHandler onComplete={() => setIsAuthorized(true)} />
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
