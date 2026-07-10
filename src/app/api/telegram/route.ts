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

    if (rawDocumentUrl && !rawDocumentUrl.includes("example.com")) {
      // Input.fromURL is Telegraf's documented way to send a remote file
      // with a custom display filename (adjust the extension if your
      // documents aren't PDFs).
      await ctx.telegram.sendDocument(
        ctx.chat.id,
        Input.fromURL(getDownloadableFileUrl(rawDocumentUrl))
      );
    } else {
      await ctx.reply("The document for this day has not been uploaded by the admin yet.");
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
    console.error("Webhook processing error:", error);
    // Always return 200 to Telegram, or it will keep retrying the same update.
    return NextResponse.json({ ok: true });
  }
}