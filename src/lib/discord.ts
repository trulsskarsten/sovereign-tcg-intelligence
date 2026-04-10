/**
 * Dual-Channel Discord Notification Utility
 */

type ChannelType = "BUSINESS" | "TECH";

export async function sendDiscordNotification(
  message: string, 
  channel: ChannelType = "BUSINESS",
  embed?: any
) {
  const businessWebhook = process.env.DISCORD_WEBHOOK_BUSINESS;
  const techWebhook = process.env.DISCORD_WEBHOOK_TECH;
  
  const webhookUrl = channel === "BUSINESS" ? businessWebhook : techWebhook;

  if (!webhookUrl) {
    if (channel === "BUSINESS") console.warn("Discord Business Webhook not configured.");
    return;
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: message,
        embeds: embed ? [embed] : [],
      }),
    });

    if (!response.ok) {
      console.error(`Discord Error [${channel}]:`, await response.text());
    }
  } catch (err) {
    console.error(`Error sending Discord notification to ${channel}:`, err);
  }
}

/**
 * Log technical telemetry to the silent channel.
 */
export async function logTechnicalEvent(event: string, details: any) {
  const isSimulation = process.env.SHOPIFY_DRY_RUN === "true";
  
  const embed = {
    title: `⚙️ Tech Log: ${event}${isSimulation ? ' [SIMULERING]' : ''}`,
    color: 0x333333,
    fields: Object.entries(details).map(([key, value]) => ({
      name: key,
      value: typeof value === 'object' ? JSON.stringify(value) : String(value),
      inline: true,
    })),
    timestamp: new Date().toISOString(),
  };

  await sendDiscordNotification("", "TECH", embed);
}

/**
 * Send business alerts for recommendations.
 */
export async function notifyPriceRecommendation(productName: string, oldPrice: number, newPrice: number, reason: string) {
  const embed = {
    title: `💰 Ny Pris-anbefaling`,
    description: `**${productName}**\n${reason}`,
    color: 0xf02d44,
    fields: [
      { name: "Fra", value: `${oldPrice} kr`, inline: true },
      { name: "Til (Foreslått)", value: `${newPrice} kr`, inline: true },
      { name: "Endring", value: `${((newPrice - oldPrice) / oldPrice * 100).toFixed(1)}%`, inline: true },
    ],
    footer: { text: "Godkjenn i dashboardet for å oppdatere Shopify" },
    timestamp: new Date().toISOString(),
  };

  await sendDiscordNotification("", "BUSINESS", embed);
}
