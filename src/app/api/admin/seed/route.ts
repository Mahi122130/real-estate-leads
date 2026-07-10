import { NextResponse } from "next/server";
import clientPromise from "@/components/lib/mongodb";
import { DAYS_CONFIG } from "@/components/data/daysConfig";

export const dynamic = "force-dynamic";

// Visit this route once (while logged into the protected /api/admin/* area)
// to populate the "days" collection with the default 7-day structure.
// Safe to re-run: it upserts, so it will never duplicate rows.
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("luxury_leads");

    const operations = DAYS_CONFIG.map((d) => ({
      updateOne: {
        filter: { day: d.day },
        update: {
          $set: {
            day: d.day,
            title: d.title,
            description: d.description,
            videoUrl: d.videoUrl,
            documentUrl: d.documentUrl,
            isLocked: !d.isUnlockedDefault,
          },
        },
        upsert: true,
      },
    }));

    await db.collection("days").bulkWrite(operations);

    return NextResponse.json({ success: true, message: "Database seeded successfully!" });
  } catch (error) {
    console.error("Seeding error:", error);
    return NextResponse.json({ success: false, error: "Seeding failed" }, { status: 500 });
  }
}