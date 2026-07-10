"use server";

import clientPromise from "../../components/lib/mongodb";
import { ObjectId } from "mongodb";

interface LeadData {
  name: string;
  email: string;
  phone: string;
  telegram?: string;
  whatsapp?: string;
  selectedDay: number;
  channel: "whatsapp" | "telegram";
}

const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 submission per email per minute

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function submitLeadAndGetRedirect(data: LeadData) {
  try {
    if (!data.name || !data.email || !data.phone) {
      return { success: false, error: "Please complete all required fields." };
    }

    if (!isValidEmail(data.email)) {
      return { success: false, error: "Please enter a valid email address." };
    }

    const client = await clientPromise;
    const db = client.db("luxury_leads");

    // Basic spam guard: block repeat submissions from the same email
    // within the rate-limit window instead of writing a new lead every time.
    const recentLead = await db.collection("leads").findOne(
      { email: data.email, createdAt: { $gte: new Date(Date.now() - RATE_LIMIT_WINDOW_MS) } },
      { sort: { createdAt: -1 } }
    );
    if (recentLead) {
      return { success: false, error: "Please wait a moment before submitting again." };
    }

    const leadResult = await db.collection("leads").insertOne({
      name: data.name,
      email: data.email,
      phone: data.phone,
      telegram: data.telegram || "",
      whatsapp: data.whatsapp || "",
      dayViewed: data.selectedDay,
      channel: data.channel,
      createdAt: new Date(),
    });

    const leadId = (leadResult.insertedId as ObjectId).toString();

    const day = await db.collection("days").findOne({ day: Number(data.selectedDay) });

    if (!day) {
      return { success: false, error: "Training day not found." };
    }

    if (!day.documentUrl) {
      return {
        success: false,
        error: "The document for this day hasn't been uploaded yet. Please try again later.",
      };
    }

    let redirectUrl = "";

    if (data.channel === "whatsapp") {
      const phone = (data.whatsapp || data.phone).replace(/\D/g, "");

      const message = encodeURIComponent(
        `Hi ${data.name},\n\nThank you for joining our Real Estate Masterclass.\n\nDay ${data.selectedDay}: ${day.title}\n\nDownload your document here:\n${day.documentUrl}\n\nEnjoy your training!`
      );

      redirectUrl = `https://wa.me/${phone}?text=${message}`;
    } else {
      const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;

      if (!botUsername) {
        return { success: false, error: "Telegram bot username is missing." };
      }

      redirectUrl = `https://t.me/${botUsername}?start=day_${data.selectedDay}_${leadId}`;
    }

    return { success: true, redirectUrl, leadId };
  } catch (error) {
    console.error("Lead Submission Error:", error);
    return { success: false, error: "Something went wrong while saving the lead." };
  }
}