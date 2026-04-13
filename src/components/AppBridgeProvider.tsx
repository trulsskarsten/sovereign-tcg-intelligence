'use client';

import { useEffect, useState, ReactNode } from 'react';
import { useSearchParams } from 'next/navigation';
import { Provider, useAppBridge } from '@shopify/app-bridge-react';
import { getSessionToken } from '@shopify/app-bridge-utils';

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
        console.error('Auth Error:', error);
      }
    }

    performExchange();
  }, [app, searchParams, onComplete]);

  return null;
}

export default function AppBridgeProvider({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();
  const [appConfig, setAppConfig] = useState<{ apiKey: string; host: string } | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const host = searchParams.get('host');
    const apiKey = process.env.NEXT_PUBLIC_SHOPIFY_API_KEY;

    if (host && apiKey) {
      setAppConfig({ apiKey, host });
    }
  }, [searchParams]);

  if (!appConfig) {
    return <>{children}</>;
  }

  return (
    <Provider config={appConfig}>
      {!isAuthorized && (
        <div className="fixed inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-50">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium text-[#1a1a1a] animate-pulse">
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
