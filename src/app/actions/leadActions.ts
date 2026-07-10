"use server";

import clientPromise from "../../components/lib/mongodb";
import { DAYS_CONFIG } from "../../components/data/daysConfig";

interface SubmitLeadParams {
  name: string;
  email: string;
  phone: string;
  telegram?: string;
  whatsapp?: string;
  selectedDay: number;
  channel: "whatsapp" | "telegram";
}

export async function submitLeadAndGetRedirect(data: SubmitLeadParams) {
  const client = await clientPromise;
  const db = client.db("luxury_leads");

  // Insert lead into MongoDB
  await db.collection("leads").insertOne({
    name: data.name,
    email: data.email,
    phone: data.phone,
    telegram: data.telegram || "",
    whatsapp: data.whatsapp || "",
    dayViewed: data.selectedDay,
    createdAt: new Date(),
  });

  const dayContent = DAYS_CONFIG.find((d) => d.day === data.selectedDay) || DAYS_CONFIG[0];
  
  let redirectUrl = "";

  if (data.channel === "whatsapp") {
    const message = encodeURIComponent(
      `Hello ${data.name}, here is your document for ${dayContent.title}: ${dayContent.documentUrl}`
    );
    const cleanPhone = data.whatsapp ? data.whatsapp.replace(/\D/g, "") : "";
    redirectUrl = `https://wa.me/${cleanPhone}?text=${message}`;
  } else {
    // Telegram handling: Must point to your Bot username from environment variables
    const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME?.replace("@", "").trim();
    
    if (botUsername) {
      redirectUrl = `https://t.me/${botUsername}?start=day_${data.selectedDay}`;
    } else {
      throw new Error("NEXT_PUBLIC_TELEGRAM_BOT_USERNAME is missing in environment variables.");
    }
  }

  return { success: true, redirectUrl };
}