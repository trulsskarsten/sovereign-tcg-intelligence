import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

import { UIProvider } from "@/components/Providers";
import { ToastProvider } from "@/components/ui/Toast";
import AppBridgeProvider from "@/components/AppBridgeProvider";
import { Suspense } from "react";

const font = Plus_Jakarta_Sans({ 
  subsets: ["latin"],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-jakarta'
});

export const metadata: Metadata = {
  title: "Sovereign TCG Intelligence",
  description: "Enterprise-grade operations for Pokemon TCG merchants",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="no" className="h-full antialiased" suppressHydrationWarning>
      <body 
        className={`${font.variable} font-sans min-h-full bg-[#fdfdfd] text-[#1a1a1a] flex flex-col`}
        suppressHydrationWarning
      >
        <Suspense fallback={<div className="flex-1 bg-white" />}>
          <AppBridgeProvider>
            <ToastProvider>
              <UIProvider>
                <div className="flex-1 flex flex-col relative overflow-hidden">
                  <main className="relative z-10 flex-1 flex flex-col">
                    {children}
                  </main>
                </div>
              </UIProvider>
            </ToastProvider>
          </AppBridgeProvider>
        </Suspense>
      </body>
    </html>
  );
}
