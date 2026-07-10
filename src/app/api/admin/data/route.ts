import { NextResponse } from "next/server";
import clientPromise from "../../../../components/lib/mongodb";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("luxury_leads");

    const leads = await db
      .collection("leads")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    let days = await db
      .collection("days")
      .find({})
      .sort({ day: 1 })
      .toArray();

    if (days.length === 0) {
      const initialDays = Array.from({ length: 7 }, (_, i) => ({
        day: i + 1,
        title: `Day ${i + 1} Masterclass`,
        videoUrl: "",
        documentUrl: "",
        isLocked: i !== 0,
      }));
      await db.collection("days").insertMany(initialDays);
      days = await db.collection("days").find({}).sort({ day: 1 }).toArray();
    }

    return NextResponse.json({ success: true, leads, days });
  } catch (error) {
    console.error("API admin data error:", error);
    return NextResponse.json({ success: false, leads: [], days: [] }, { status: 500 });
  }
}