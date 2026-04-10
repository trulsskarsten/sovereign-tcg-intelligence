import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const font = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Skarsten TCG Ops",
  description: "Operations dashboard for Pokemon TCG",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="no" className="h-full antialiased" suppressHydrationWarning>
      <body 
        className={`${font.className} min-h-full bg-[#f6f6f7] text-[#202223] flex flex-col`}
        suppressHydrationWarning
      >
        <div className="flex-1 flex flex-col relative overflow-hidden">
          {/* subtle pattern or background can go here */}
          <main className="relative z-10 flex-1 flex flex-col">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
