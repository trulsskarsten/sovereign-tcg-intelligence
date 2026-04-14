/**
 * AI Strategy Advisor
 * 
 * Generating merchant-grade recommendations based on 
 * inventory dynamics and TCG market sentiment.
 */

export interface StrategyInsight {
  id: string;
  type: 'Opportunity' | 'Risk' | 'Liquidate';
  title: string;
  advice: string;
  impact: string; // e.g. "+5,000 kr Margin"
}

/**
 * Heuristic-based Strategy Engine
 * (In a full production app, this would be a prompt to GPT-4o)
 */
export function generateStrategyInsights(inventory: Array<Record<string, unknown>>): StrategyInsight[] {
  const insights: StrategyInsight[] = [];

  // Logic: Identify Overstock in Stale Classes
  const staleClassC = inventory.filter(i => (i as { abcClass: string; daysInStock: number }).abcClass === 'C' && (i as { abcClass: string; daysInStock: number }).daysInStock > 90);
  if (staleClassC.length > 5) {
     insights.push({
       id: 'liq-c-90',
       type: 'Liquidate',
       title: 'Frigjør kapital fra Klasse C',
       advice: `Du har ${staleClassC.length} varer i Klasse C som har ligget i over 90 dager. Vurder et 10% "Flash Sale" for å frigjøre kapital til kommende sett-lanseringer.`,
       impact: 'Rask Likviditet'
     });
  }

  // Logic: Identify High ROI Velocity
  const movers = inventory.filter(i => (i as { status: string; abcClass: string }).status === 'Movers' && (i as { status: string; abcClass: string }).abcClass === 'A');
  if (movers.length > 0) {
    insights.push({
      id: 'margin-a-boost',
      type: 'Opportunity',
      title: 'Maksimer Margin på Grails',
      advice: `${movers.length} Klasse A-varer stiger raskt. Siden dette er "Grails", vurder å prise 5% over markedet for å fange opp desperate samlere.`,
      impact: 'Økt Profitt'
    });
  }

  return insights;
}

/**
 * Discord Strategy Formatter
 */
export function formatStrategyForDiscord(insights: StrategyInsight[]): string {
  if (insights.length === 0) return "💡 Ingen nye strategiske anbefalinger i dag.";
  
  return insights.map(i => {
    const icon = i.type === 'Opportunity' ? '🚀' : i.type === 'Risk' ? '⚠️' : '🧊';
    return `${icon} **${i.title}**\n> ${i.advice}\n> *Potensiell effekt: ${i.impact}*`;
  }).join("\n\n");
}
