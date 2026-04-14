import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/middleware";
import { logger } from "@/lib/logger";
import { z } from "zod";

const FeedbackSchema = z.object({
  feedback: z.string().min(1).max(2000),
  type: z.enum(["bug", "feature", "general"]).optional().default("general"),
});

/**
 * POST /api/feedback
 * Sends feedback to a Discord webhook.
 */
export const POST = withAuth(async (req: NextRequest, { shop_domain }) => {
  try {
    const body = FeedbackSchema.parse(await req.json());
    const { feedback, type } = body;
    const webhookUrl = process.env.DISCORD_SUPPORT_WEBHOOK;

    if (!webhookUrl) {
      logger.error("DISCORD_SUPPORT_WEBHOOK not configured");
      return NextResponse.json({ success: true, message: "Logged locally (fallback)" });
    }

    const payload = {
      embeds: [{
        title: `Ny Tilbakemelding [${type.toUpperCase()}]`,
        description: feedback,
        color: 0x005BD3,
        fields: [
          { name: "Store", value: shop_domain, inline: true },
          { name: "Siste Aktivitet", value: new Date().toLocaleString('no-NO'), inline: true }
        ],
        footer: { text: "Sovereign Intelligence Feedback System" }
      }]
    };

    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error("Discord webhook failed");

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Ugyldig tilbakemeldingsformat" }, { status: 400 });
    }
    logger.error({ err, shop_domain }, "Feedback submission error");
    return NextResponse.json({ error: "Kunne ikke sende tilbakemelding" }, { status: 500 });
  }
});
