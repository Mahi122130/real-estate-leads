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

export async function submitLeadAndGetRedirect(data: LeadData) {
  try {
    if (!data.name || !data.email || !data.phone) {
      return {
        success: false,
        error: "Please complete all required fields.",
      };
    }

    const client = await clientPromise;
    const db = client.db("luxury_leads");

    // Save lead
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

    // Get latest day configuration
    const day = await db.collection("days").findOne({
      day: Number(data.selectedDay),
    });

    if (!day) {
      return {
        success: false,
        error: "Training day not found.",
      };
    }

    let redirectUrl = "";

    if (data.channel === "whatsapp") {
      const phone =
        (data.whatsapp || data.phone).replace(/\D/g, "");

      const message = encodeURIComponent(
        `Hi ${data.name},

Thank you for joining our Real Estate Masterclass.

📄 Day ${data.selectedDay}: ${day.title}

Download your document here:
${day.documentUrl}

Enjoy your training!`
      );

      redirectUrl = `https://wa.me/${phone}?text=${message}`;
    } else {
      const botUsername =
        process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;

      if (!botUsername) {
        return {
          success: false,
          error: "Telegram bot username is missing.",
        };
      }

      // Pass both day and lead id
      redirectUrl = `https://t.me/${botUsername}?start=day_${data.selectedDay}_${leadId}`;
    }

    return {
      success: true,
      redirectUrl,
      leadId,
    };
  } catch (error) {
    console.error("Lead Submission Error:", error);

    return {
      success: false,
      error: "Something went wrong while saving the lead.",
    };
  }
}