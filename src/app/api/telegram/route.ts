import { NextResponse } from "next/server";
import { Telegraf } from "telegraf";
import clientPromise from "../../../components/lib/mongodb";

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
    const documentUrl = dayData?.documentUrl;

    await ctx.reply(
      `Welcome to the Real Estate Masterclass!\n\nHere is your requested document for *${title}*:\n\nEnjoy the training!`,
      { parse_mode: "Markdown" }
    );

    if (documentUrl && !documentUrl.includes("example.com")) {
      // Pass an object with url and explicit filename to preserve correct extension
      await ctx.telegram.sendDocument(ctx.chat.id, {
        url: documentUrl,
        filename: `Day_${dayNum}_Masterclass_Resource.pdf`,
      });
    } else {
      await ctx.reply("⚠️ Document for this specific day has not been uploaded by the admin yet.");
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
    return NextResponse.json({ ok: true });
  }
}