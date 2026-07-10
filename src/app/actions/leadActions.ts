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

    // Save lead submission to MongoDB
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

    // Fetch the live admin configuration for this specific day from MongoDB
    const dayConfig = await db.collection("days").findOne({ day: data.selectedDay });
    const documentUrl = dayConfig?.documentUrl || "";

    // Generate destination link using the live document URL from the database
    let redirectUrl = "";
    if (data.channel === "whatsapp") {
      const message = encodeURIComponent(`Hello ${data.name}, here is your requested document for Day ${data.selectedDay}: ${documentUrl}`);
      const cleanPhone = data.whatsapp ? data.whatsapp.replace(/\D/g, "") : data.phone.replace(/\D/g, "");
      redirectUrl = `https://wa.me/${cleanPhone}?text=${message}`;
    } else {
      // Telegram fallback or direct link
      redirectUrl = documentUrl || "https://telegram.org";
    }

    return { success: true, redirectUrl };
  } catch (error) {
    console.error("Lead submission error:", error);
    return { success: false, error: "Failed to process lead" };
  }
}