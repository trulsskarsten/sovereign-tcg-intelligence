import { logger } from "./logger";

/**
 * Sends an alert to the configured Discord webhook.
 */
export async function sendDiscordAlert(message: string, type: "INFO" | "WARNING" | "ERROR" = "INFO") {
  const webhookUrl = process.env.DISCORD_SUPPORT_WEBHOOK;
  
  if (!webhookUrl) {
    logger.warn("Discord alerting skipped: DISCORD_SUPPORT_WEBHOOK not set.");
    return;
  }

  const colors = {
    INFO: 3447003,    // Blue
    WARNING: 16776960, // Yellow
    ERROR: 15158332    // Red
  };

  try {
    const payload = {
      embeds: [
        {
          title: `[TCG] ${type} Alert`,
          description: message,
          color: colors[type],
          timestamp: new Date().toISOString()
        }
      ]
    };

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Discord API error: ${response.statusText}`);
    }
  } catch (err: unknown) {
    logger.error({ err }, "Failed to send Discord alert");
  }
}
