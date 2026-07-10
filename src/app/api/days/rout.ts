import { NextResponse } from "next/server";
import clientPromise from "../../../components/lib/mongodb";
import { DAYS_CONFIG } from "../../../components/data/daysConfig";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("luxury_leads");
    
    // Fetch all custom saved configs from MongoDB
    const dbDays = await db.collection("days").find({}).toArray();

    // Map over original DAYS_CONFIG and merge with DB overrides if they exist
    const mergedDays = DAYS_CONFIG.map((staticDay) => {
      const foundDbDay = dbDays.find((d) => d.day === staticDay.day);
      if (foundDbDay) {
        return {
          day: staticDay.day,
          title: foundDbDay.title || staticDay.title,
          description: foundDbDay.description || staticDay.description,
          videoUrl: foundDbDay.videoUrl || staticDay.videoUrl,
          documentUrl: foundDbDay.documentUrl || staticDay.documentUrl,
          isLocked: foundDbDay.isLocked ?? !staticDay.isUnlockedDefault,
        };
      }
      return {
        day: staticDay.day,
        title: staticDay.title,
        description: staticDay.description,
        videoUrl: staticDay.videoUrl,
        documentUrl: staticDay.documentUrl,
        isLocked: !staticDay.isUnlockedDefault,
      };
    });

    return NextResponse.json({ success: true, days: mergedDays });
  } catch (error) {
    console.error("Failed to load days API:", error);
    return NextResponse.json({ success: false, error: "Failed to load days" }, { status: 500 });
  }
}