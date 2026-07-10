import { Telegraf } from "telegraf";
import "dotenv/config";
import { DAYS_CONFIG } from "./components/data/daysConfig";

const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
  throw new Error("❌ TELEGRAM_BOT_TOKEN is missing in environment variables.");
}

const bot = new Telegraf(token);

/**
 * Handle /start command
 * Payload example:
 * https://t.me/your_bot?start=day_1_John
 */
bot.start(async (ctx) => {
  try {
    const startPayload = ctx.payload;

    console.log("User started bot:", {
      id: ctx.from?.id,
      username: ctx.from?.username,
      payload: startPayload,
    });

    let dayNum = 1;

    // Extract day number from payload
    if (startPayload?.startsWith("day_")) {
      const parts = startPayload.split("_");

      const parsedDay = Number(parts[1]);

      if (!isNaN(parsedDay)) {
        dayNum = parsedDay;
      }
    }

    // Find matching day content
    const content =
      DAYS_CONFIG.find((day) => day.day === dayNum) ||
      DAYS_CONFIG[0];

    await ctx.reply(
      `🏠 *Welcome to the Real Estate Masterclass!*\n\n` +
        `📚 Lesson: *${content.title}*\n\n` +
        `📄 Your document:\n${content.documentUrl}\n\n` +
        `Enjoy your training 🚀`,
      {
        parse_mode: "Markdown",
      }
    );

  } catch (error) {
    console.error("Telegram start error:", error);

    await ctx.reply(
      "Sorry, something went wrong while loading your document. Please try again."
    );
  }
});


/**
 * Optional command
 */
bot.command("help", async (ctx) => {
  await ctx.reply(
    "Available commands:\n\n/start - Start your training\n/help - Show help"
  );
});


/**
 * Launch bot
 */
bot.launch()
  .then(() => {
    console.log("✅ Telegram bot is running...");
  })
  .catch((error) => {
    console.error("❌ Failed to start Telegram bot:", error);
  });


/**
 * Graceful shutdown
 */
process.once("SIGINT", () => {
  console.log("Stopping bot...");
  bot.stop("SIGINT");
});

process.once("SIGTERM", () => {
  console.log("Stopping bot...");
  bot.stop("SIGTERM");
});