import { NextResponse } from "next/server";
import { Telegraf, Input } from "telegraf";
import clientPromise from "../../../components/lib/mongodb";
import { getDownloadableFileUrl } from "../../../components/lib/urlParser";

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  console.error("TELEGRAM_BOT_TOKEN is missing!");
}

const bot = new Telegraf(token || "");

bot.start(async (ctx) => {
  try {
    const startPayload = ctx.payload;
    let dayNum = 1;

    if (startPayload && startPayload.startsWith("day_")) {
      const parts = startPayload.split("_");
      const parsed = parseInt(parts[1], 10);
      if (!isNaN(parsed)) dayNum = parsed;
    }

    const client = await clientPromise;
    const db = client.db("luxury_leads");
    const dayData = await db.collection("days").findOne({ day: dayNum });

    const title = dayData?.title || `Day ${dayNum}`;
    const rawDocumentUrl = dayData?.documentUrl;

    await ctx.reply(
      `Welcome to the Real Estate Masterclass!\n\nHere is your requested document for *${title}*:\n\nEnjoy the training!`,
      { parse_mode: "Markdown" }
    );

    if (rawDocumentUrl) {
      try {
        const fileUrl = getDownloadableFileUrl(rawDocumentUrl);
        await ctx.telegram.sendDocument(ctx.chat.id, Input.fromURL(fileUrl));
      } catch (sendErr) {
        console.error(`Failed to send document for day ${dayNum}:`, sendErr);
        await ctx.reply(`📄 *Download Document Link:* ${rawDocumentUrl}`, { parse_mode: "Markdown" });
      }
    } else {
      await ctx.reply("The document for this day has not been uploaded by the admin yet.");
    }
  } catch (err) {
    console.error("Telegram handler error:", err);
  }
});

export async function POST(req: Request) {
  try {
    const expectedSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
    if (expectedSecret) {
      const receivedSecret = req.headers.get("x-telegram-bot-api-secret-token");
      if (receivedSecret !== expectedSecret) {
        return NextResponse.json({ ok: false }, { status: 401 });
      }
    }

    const body = await req.json();
    await bot.handleUpdate(body);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ ok: true });
  }
}