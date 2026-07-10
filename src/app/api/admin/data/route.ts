import { NextResponse } from "next/server";
import clientPromise from "../../../../components/lib/mongodb";
import { DAYS_CONFIG } from "../../../../components/data/daysConfig";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("luxury_leads");

    const leads = await db.collection("leads").find({}).sort({ createdAt: -1 }).toArray();
    const dbDays = await db.collection("days").find({}).toArray();

    const mergedDays = DAYS_CONFIG.map((staticDay) => {
      const found = dbDays.find((d) => d.day === staticDay.day);
      return {
        day: staticDay.day,
        title: staticDay.title,
        description: staticDay.description,
        videoUrl: found?.videoUrl || staticDay.videoUrl,
        documentUrl: found?.documentUrl || staticDay.documentUrl,
        isLocked: found?.isLocked ?? !staticDay.isUnlockedDefault,
      };
    });

    return NextResponse.json({ success: true, leads, days: mergedDays });
  } catch (error) {
    console.error("Admin data route error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch admin data" }, { status: 500 });
  }
}