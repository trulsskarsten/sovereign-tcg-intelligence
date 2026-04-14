"use client";

import DashboardShell from "@/components/DashboardShell";
import {
  Check,
  X,
  Info,
  ArrowRight
} from "lucide-react";

export default function RecommendationsPage() {
  const recommendations = [
    { 
      id: 1, 
      product: "Twilight Masquerade Booster Box", 
      reason: "Konkurrenter har økt prisen med gjennomsnittlig 12% denne uken.", 
      oldPrice: 1349, 
      newPrice: 1499, 
      impact: "+150 kr",
      confidence: "Høy"
    },
    { 
      id: 2, 
      product: "Pikachu Promo Card", 
      reason: "Lav rotasjon. Foreslår prisreduksjon for å øke salgshastighet.", 
      oldPrice: 500, 
      newPrice: 449, 
      impact: "-51 kr",
      confidence: "Middels"
    },
  ];

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#202223]">Smarte Prisforslag</h2>
            <p className="text-sm text-[#6d7175]">Algoritmiske anbefalinger basert på norsk markedsdata og dine marginer.</p>
          </div>
          <div className="flex space-x-3">
            <button className="px-4 py-2 text-sm font-bold text-[#6d7175] hover:bg-[#ebebeb] rounded-md transition-colors">
              Ignorer alle
            </button>
            <button className="px-4 py-2 text-sm font-bold bg-[#005bd3] text-white rounded-md hover:bg-[#004bb3] shadow-sm">
              Godkjenn alle valgte
            </button>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-[#eaf4ff] border border-[#b3d5f5] rounded-lg p-4 flex items-center">
          <Info className="h-5 w-5 text-[#005bd3] mr-3" />
          <p className="text-sm text-[#005bd3]">
            <strong>Tips:</strong> Godkjenning av disse forslagene vil oppdatere Shopify umiddelbart. (Kun dersom Simulator Modus er av).
          </p>
        </div>

        {/* Recommendations List */}
        <div className="space-y-4">
          {recommendations.map((rec) => (
            <div key={rec.id} className="polaris-card bg-white p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center mb-1">
                  <h3 className="text-base font-bold text-[#202223] mr-3">{rec.product}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    rec.confidence === 'Høy' ? 'bg-[#e3f1df] text-[#008060]' : 'bg-[#fff4e5] text-[#b98900]'
                  }`}>
                    {rec.confidence} Konfidens
                  </span>
                </div>
                <p className="text-sm text-[#6d7175]">{rec.reason}</p>
              </div>

              <div className="flex items-center space-x-8">
                <div className="text-center">
                  <p className="text-[10px] text-[#6d7175] uppercase font-bold mb-1">Gammel</p>
                  <p className="text-sm font-medium text-[#6d7175] line-through">{rec.oldPrice} kr</p>
                </div>
                <ArrowRight className="h-4 w-4 text-[#d2d5d9]" />
                <div className="text-center">
                  <p className="text-[10px] text-[#005bd3] uppercase font-bold mb-1">Anbefalt</p>
                  <p className="text-lg font-bold text-[#202223]">{rec.newPrice} kr</p>
                </div>
                <div className="text-center min-w-[80px]">
                  <p className="text-[10px] text-[#6d7175] uppercase font-bold mb-1">Effekt</p>
                  <p className={`text-sm font-bold ${rec.impact.startsWith('+') ? 'text-[#008060]' : 'text-[#c02d2d]'}`}>
                    {rec.impact}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 border-l border-[#ebebeb] pl-6">
                <button className="p-2 border border-[#d2d5d9] rounded-md text-[#6d7175] hover:bg-[#fff4f4] hover:text-[#c02d2d] transition-all">
                  <X className="h-5 w-5" />
                </button>
                <button className="p-2 bg-[#005bd3] border border-[#005bd3] rounded-md text-white hover:bg-[#004bb3] transition-all">
                  <Check className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}
