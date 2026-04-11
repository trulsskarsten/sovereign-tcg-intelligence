/**
 * Natural Norwegian Bokmål Dictionary (L10n)
 * Professional terminology for TCG Markeds- og Lagerkontroll
 */

export const i18n = {
  common: {
    brandName: "Sovereign",
    brandFull: "Sovereign Intelligens",
    dashboard: "Kontrollpanel",
    inventory: "Varebeholdning",
    purchases: "Innkjøpslogg",
    recommendations: "Anbefalinger",
    setup: "Konfigurasjon",
    saveAndContinue: "Lagre og fortsett",
    saveAndExit: "Lagre og lukk",
    loading: "Laster...",
    error: "Feil oppstod",
    success: "Vellykket!",
    demoMode: "DEMO-MODUS",
    demoWarning: "KUN EKSEMPEL-DATA – DASHBORDET ER IKKE KOBLET TIL BUTIKKEN DIN ENNÅ",
  },
  dashboard: {
    overview: "Oversikt",
    totalItems: "Varer på lager",
    totalValue: "Lagerværdi (NOK)",
    avgMargin: "Gj.snittlig Bruttomargin",
    recentChanges: "Siste prisendringer",
    attentionRequired: "Oppmerksomhet kreves",
    seeRecommendations: "Se anbefalinger",
  },
  inventory: {
    title: "Varebeholdning",
    subtitle: "Administrer dine produkter og se gjeldende kostnader",
    addProduct: "Legg til produkt",
    search: "Søk i lager...",
    sku: "Varekode (SKU)",
    stock: "Beholdning",
    unitCost: "Innkjøpspris (snitt)",
    sellingPrice: "Utsalgspris",
    margin: "Margin",
  },
  setup: {
    wizardTitle: "Oppsett-veiviser",
    welcomeTitle: "Velkommen til Sovereign",
    welcomeSub: "La oss sette opp ditt profesjonelle kontrollpanel for TCG-handel.",
    step1: "Hent API-nøkler",
    step2: "Koble til Shopify",
    step3: "Aktiver Varslinger",
    step4: "Fullfør Oppsett",
    testConnection: "Test Tilkobling",
    startDemo: "Se Demo nå",
    demoSub: "Utforsk Sovereign med eksempel-data før du kobler til din egen butikk.",
  }
};

/**
 * Natural number & currency formatting for Norwegian standards
 */
export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('nb-NO', {
    style: 'currency',
    currency: 'NOK',
  }).format(value);
};

export const formatPercent = (value: number) => {
  return new Intl.NumberFormat('nb-NO', {
    style: 'percent',
    minimumFractionDigits: 1,
  }).format(value / 100);
};
