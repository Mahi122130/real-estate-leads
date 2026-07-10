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
    // Telegram handling: Clean the username
    const cleanTelegram = data.telegram ? data.telegram.replace("@", "").trim() : "";
    
    if (cleanTelegram) {
      // If it's a standard user handle, just open their chat profile or pass to a bot format if using a bot
      redirectUrl = `https://t.me/${cleanTelegram}`;
    } else {
      // Fallback general link or support channel if no username provided
      redirectUrl = `https://t.me/your_support_username`;
    }
  }

  return { success: true, redirectUrl };
}