/**
 * Sovereign Discord Bridge
 * 
 * Sends professional real-time alerts to a Discord channel 
 * using standard webhooks. No 3rd party costs.
 */

export type AlertSeverity = 'info' | 'success' | 'warning' | 'error' | 'critical';

export interface DiscordEmbed {
  title: string;
  description: string;
  color: number;
  fields?: { name: string; value: string; inline?: boolean }[];
  thumbnail?: { url: string };
  footer?: { text: string };
  timestamp?: string;
}

const COLORS: Record<AlertSeverity, number> = {
  info: 0x005bd3,
  success: 0x108043,
  warning: 0xf49342,
  error: 0xc02d2d,
  critical: 0x000000
};

const AVATARS = {
  STATUS: "https://img.icons8.com/color/96/bot.png",
  SECURITY: "https://img.icons8.com/fluency/96/shield-configuration.png",
  EMERGENCY: "https://img.icons8.com/fluency/96/error.png"
};

/**
 * Sends a notification to Discord with automatic severity-based routing.
 * High severity messages are sent to the dedicated Security channel.
 */
export async function sendDiscordAlert(
  payload: { title: string; message: string; severity: AlertSeverity; fields?: any[] }
) {
  const isCritical = ['error', 'critical'].includes(payload.severity);
  
  // In production, these would be pulled from the 'stores' database table
  const STATUS_WEBHOOK = process.env.DISCORD_STATUS_WEBHOOK;
  const SECURITY_WEBHOOK = process.env.DISCORD_SECURITY_WEBHOOK || STATUS_WEBHOOK;
  
  const webhookUrl = isCritical ? SECURITY_WEBHOOK : STATUS_WEBHOOK;
  
  if (!webhookUrl) return;

  const embed: DiscordEmbed = {
    title: payload.title,
    description: payload.message,
    color: COLORS[payload.severity],
    fields: payload.fields,
    footer: { text: "Sovereign TCG Intelligence • " + new Date().toLocaleTimeString() }
  };

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: isCritical ? "TCG Guardian" : "TCG Reporting",
        avatar_url: isCritical ? AVATARS.SECURITY : AVATARS.STATUS,
        embeds: [embed]
      })
    });
  } catch (err) {
    console.error("Failed to send Discord alert:", err);
  }
}

/**
 * Sends a high-visibility Bulk Update report
 */
export async function sendBulkUpdateReport(data: {
  updatedCount: number;
  blockedCount: number;
  totalRoiDelta: number;
  topMoves: { name: string; shift: string }[];
}) {
  await sendDiscordAlert({
    title: "🚀 Bulk Prisoppdatering Fullført",
    message: `Fullført oppdatering av din lagerbeholdning. Systemet har automatisk rutenett alle endringer.`,
    severity: 'success',
    fields: [
      { name: "Oppdatert", value: `${data.updatedCount} varer`, inline: true },
      { name: "Blokkert", value: `${data.blockedCount} (Sikkerhet)`, inline: true },
      { name: "ROI-Effekt", value: `${data.totalRoiDelta > 0 ? '+' : ''}${data.totalRoiDelta.toFixed(2)}%`, inline: true },
      ...data.topMoves.map(m => ({ name: `Flytter: ${m.name}`, value: m.shift, inline: false }))
    ]
  });
}

/**
 * Pre-formatted: Price Safety Alert
 */
export async function notifyPriceSafetyTriggered(
  productName: string, 
  currentPrice: number, 
  newPrice: number,
  reason: string
) {
  const diff = newPrice - currentPrice;
  const isIncrease = diff > 0;

  await sendDiscordAlert({
    title: `⚠️ Sikkerhets-sperre utløst: ${productName}`,
    message: `En prisendring ble blokkert fordi den oversteg trygghets-grensene for dette produktet.`,
    severity: 'warning',
    fields: [
      { name: "Nåværende Pris", value: `${currentPrice} kr`, inline: true },
      { name: "Foreslått Pris", value: `${newPrice} kr`, inline: true },
      { name: "Differanse", value: `${isIncrease ? "+" : ""}${diff.toFixed(2)} kr`, inline: true },
      { name: "Årsak", value: reason }
    ]
  });
}

/**
 * Pre-formatted: Panic Lock / Circuit Breaker
 */
export async function notifyPanicLockActivated(storeName: string) {
  await sendDiscordAlert({
    title: `🚨 AUTOMATISERING PAUSET (CIRCUIT BREAKER)`,
    message: `Systemet har detektert kritiske sikkerhetsutfordringer for **${storeName}**. All autopilot er midlertidig deaktivert for å beskytte butikken din.`,
    severity: 'critical',
    fields: [
      { name: "Status", value: "Autopilot: AV" },
      { name: "Handling", value: "Vennligst sjekk Staging-området i instrumentbordet." }
    ]
  });
}
