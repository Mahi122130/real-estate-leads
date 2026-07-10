import { NextResponse } from "next/server";
import clientPromise from "../../../components/lib/mongodb";
import { DAYS_CONFIG } from "../../../components/data/daysConfig";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("luxury_leads");

    // Get all saved day configurations
    const dbDays = await db.collection("days").find({}).toArray();

    // Create a quick lookup map
    const daysMap = new Map(
      dbDays.map((day) => [day.day, day])
    );

    // Merge default config with MongoDB values
    const mergedDays = DAYS_CONFIG.map((defaultDay) => {
      const savedDay = daysMap.get(defaultDay.day);

      return {
        day: defaultDay.day,

        title:
          savedDay?.title ?? defaultDay.title,

        description:
          savedDay?.description ?? defaultDay.description,

        videoUrl:
          savedDay?.videoUrl ?? defaultDay.videoUrl ?? "",

        documentUrl:
          savedDay?.documentUrl ?? defaultDay.documentUrl ?? "",

        isLocked:
          savedDay?.isLocked ??
          !defaultDay.isUnlockedDefault,

        updatedAt:
          savedDay?.updatedAt ?? null,
      };
    });

    return NextResponse.json(
      {
        success: true,
        count: mergedDays.length,
        days: mergedDays,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Days API Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch day configuration.",
      },
      {
        status: 500,
      }
    );
  }
}