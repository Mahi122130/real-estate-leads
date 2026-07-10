import { NextResponse } from "next/server";
import { Telegraf } from "telegraf";
import { DAYS_CONFIG } from "../../../components/data/daysConfig";

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  console.error("TELEGRAM_BOT_TOKEN is missing!");
}

const bot = new Telegraf(token || "");

// Handle incoming messages / start commands from Telegram
bot.start(async (ctx) => {
  const startPayload = ctx.payload; 
  let dayNum = 1;
  if (startPayload && startPayload.startsWith("day_")) {
    const parts = startPayload.split("_");
    const parsed = parseInt(parts[1], 10);
    if (!isNaN(parsed)) dayNum = parsed;
  }

  const content = DAYS_CONFIG.find((d) => d.day === dayNum) || DAYS_CONFIG[0];

  // Send introductory text message
  await ctx.reply(
    `Welcome to the Real Estate Masterclass!\n\nHere is your requested document for *${content.title}*:\n\nEnjoy the training!`,
    { parse_mode: "Markdown" }
  );

  // Send the actual PDF document file directly
  if (content.documentUrl) {
    await ctx.telegram.sendDocument(ctx.chat.id, content.documentUrl);
  }
});

// Next.js POST endpoint that Telegram will ping
export async function POST(req: Request) {
  try {
    const body = await req.json();
    await bot.handleUpdate(body);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Telegram webhook error:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}