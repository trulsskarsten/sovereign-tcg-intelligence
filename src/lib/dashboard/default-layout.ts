export const defaultLayout = {
  lg: [
    { i: 'kpis', x: 0, y: 0, w: 12, h: 2, static: true },
    { i: 'inventory', x: 0, y: 2, w: 8, h: 6 },
    { i: 'performance', x: 8, y: 2, w: 4, h: 4 },
    { i: 'staged-updates', x: 8, y: 6, w: 4, h: 5 },
    { i: 'recommendations', x: 0, y: 8, w: 8, h: 3 },
  ],
  md: [
    { i: 'kpis', x: 0, y: 0, w: 10, h: 2, static: true },
    { i: 'inventory', x: 0, y: 2, w: 10, h: 6 },
    { i: 'performance', x: 0, y: 8, w: 10, h: 4 },
    { i: 'staged-updates', x: 0, y: 12, w: 10, h: 4 },
    { i: 'recommendations', x: 0, y: 16, w: 10, h: 4 },
  ],
};

export const WIDGET_TITLES = {
  kpis: "Nøkkeltall",
  inventory: "Lagerbeholdning",
  performance: "Ytelsesanalyse",
  'staged-updates': "Venter på godkjenning",
  recommendations: "Smarte Anbefalinger",
};
