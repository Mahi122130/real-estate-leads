import { NextResponse } from "next/server";
import clientPromise from "../../../../components/lib/mongodb";
import { DAYS_CONFIG } from "../../../../components/data/daysConfig";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("luxury_leads");

    // Fetch leads (latest first)
    const leads = await db
      .collection("leads")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    // Fetch all saved day configurations
    const dbDays = await db
      .collection("days")
      .find({})
      .toArray();

    // Create a lookup map
    const daysMap = new Map(
      dbDays.map((day) => [day.day, day])
    );

    // Merge default configuration with MongoDB values
    const days = DAYS_CONFIG.map((defaultDay) => {
      const savedDay = daysMap.get(defaultDay.day);

      return {
        day: defaultDay.day,
        title: savedDay?.title ?? defaultDay.title,
        description:
          savedDay?.description ?? defaultDay.description,
        videoUrl:
          savedDay?.videoUrl ?? defaultDay.videoUrl ?? "",
        documentUrl:
          savedDay?.documentUrl ?? defaultDay.documentUrl ?? "",
        isLocked:
          savedDay?.isLocked ??
          !defaultDay.isUnlockedDefault,
        createdAt: savedDay?.createdAt ?? null,
        updatedAt: savedDay?.updatedAt ?? null,
      };
    });

    return NextResponse.json({
      success: true,
      stats: {
        totalLeads: leads.length,
        totalDays: days.length,
      },
      leads,
      days,
    });
  } catch (error) {
    console.error("Admin Data API Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to load admin dashboard data.",
      },
      {
        status: 500,
      }
    );
  }
}