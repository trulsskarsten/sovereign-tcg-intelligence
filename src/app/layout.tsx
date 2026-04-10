import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { UIProvider } from "@/components/Providers";

const font = Inter({ subsets: ["latin"] });

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
        className={`${font.className} min-h-full bg-[#fdfdfd] text-[#1a1a1a] flex flex-col`}
        suppressHydrationWarning
      >
        <UIProvider>
          <div className="flex-1 flex flex-col relative overflow-hidden">
            <main className="relative z-10 flex-1 flex flex-col">
              {children}
            </main>
          </div>
        </UIProvider>
      </body>
    </html>
  );
}
