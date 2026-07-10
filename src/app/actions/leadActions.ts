"use server";

import clientPromise from "../../components/lib/mongodb";

export async function submitLeadAndGetRedirect(data: {
  name: string;
  email: string;
  phone: string;
  telegram?: string;
  whatsapp?: string;
  selectedDay: number;
  channel: "whatsapp" | "telegram";
}) {
  try {
    const client = await clientPromise;
    const db = client.db("luxury_leads");

    await db.collection("leads").insertOne({
      name: data.name,
      email: data.email,
      phone: data.phone,
      telegram: data.telegram || "",
      whatsapp: data.whatsapp || "",
      dayViewed: data.selectedDay,
      channel: data.channel,
      createdAt: new Date(),
    });

    const dayConfig = await db.collection("days").findOne({ day: data.selectedDay });
    const documentUrl = dayConfig?.documentUrl || "";
    const videoUrl = dayConfig?.videoUrl || "";

    let redirectUrl = "";

    if (data.channel === "whatsapp") {
      const message = encodeURIComponent(`Hello ${data.name}, here is your training document for Day ${data.selectedDay}: ${documentUrl}`);
      const cleanPhone = data.whatsapp ? data.whatsapp.replace(/\D/g, "") : data.phone.replace(/\D/g, "");
      redirectUrl = `https://wa.me/${cleanPhone}?text=${message}`;
    } else {
      // Telegram: If you have a bot username set in your env, deep-link it. 
      // Otherwise fallback to sending via t.me or direct file trigger.
      const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || "YourBotUsername";
      // This opens the bot with a start payload so your bot backend handles sending the file natively
      redirectUrl = `https://t.me/${botUsername}?start=day_${data.selectedDay}`;
    }

    return { success: true, redirectUrl };
  } catch (error) {
    console.error("Lead submission error:", error);
    return { success: false, error: "Failed to process lead" };
  }
}