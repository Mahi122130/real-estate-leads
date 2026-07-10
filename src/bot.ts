import { Telegraf } from "telegraf";
// Fixed relative path: from src/bot.ts up one level to src/components/data/daysConfig.js
import { DAYS_CONFIG } from "./components/data/daysConfig"; 
import "dotenv/config";

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  throw new Error("TELEGRAM_BOT_TOKEN is missing in environment variables.");
}

const bot = new Telegraf(token);

// Handle the /start command sent from the website button
bot.start(async (ctx) => {
  const startPayload = ctx.payload; // Example: "day_1_John"
  
  // Parse out the day number from the payload string
  let dayNum = 1;
  if (startPayload && startPayload.startsWith("day_")) {
    const parts = startPayload.split("_");
    const parsed = parseInt(parts[1], 10);
    if (!isNaN(parsed)) dayNum = parsed;
  }

  // Find the matching content for that day
  const content = DAYS_CONFIG.find((d) => d.day === dayNum) || DAYS_CONFIG[0];

  // Send a welcome message and the secure document link
  await ctx.reply(
    `Welcome to the Real Estate Masterclass!\n\nHere is your requested document for *${content.title}*:\n${content.documentUrl}\n\nEnjoy the training!`,
    { parse_mode: "Markdown" }
  );
});

// Launch the bot (for development polling)
bot.launch().then(() => {
  console.log("Telegram bot is running...");
});

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));