import { NextResponse } from "next/server";
import { Telegraf } from "telegraf";
import { DAYS_CONFIG } from "../../../components/data/daysConfig";

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  console.error("TELEGRAM_BOT_TOKEN is missing!");
}

const bot = new Telegraf(token || "");

bot.start(async (ctx) => {
  try {
    const startPayload = ctx.payload; // Example: "day_1"
    let dayNum = 1;

    if (startPayload && startPayload.startsWith("day_")) {
      const parts = startPayload.split("_");
      const parsed = parseInt(parts[1], 10);
      if (!isNaN(parsed)) dayNum = parsed;
    }

    // Pull strictly the single day configuration requested
    const content = DAYS_CONFIG.find((d) => d.day === dayNum) || DAYS_CONFIG[0];

    // Send single message for the specific day
    await ctx.reply(
      `Welcome to the Real Estate Masterclass!\n\nHere is your requested content for *${content.title}*:\n\n🎥 *Video Lesson:* ${content.videoUrl || "Available on portal"}\n\nEnjoy the training!`,
      { parse_mode: "Markdown" }
    );

    // Send the single PDF file for this day only
    if (content.documentUrl && !content.documentUrl.includes("example.com")) {
      await ctx.telegram.sendDocument(ctx.chat.id, { url: content.documentUrl });
    }

  } catch (err) {
    console.error("Telegram handler error:", err);
  }
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    await bot.handleUpdate(body);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Webhook endpoint error:", error);
    return NextResponse.json({ ok: true });
  }
}