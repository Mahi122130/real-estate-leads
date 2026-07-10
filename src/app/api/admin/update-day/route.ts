import { NextResponse } from "next/server";
import clientPromise from "../../../../components/lib/mongodb";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { day, videoUrl, documentUrl, isLocked } = body;

    if (!day) {
      return NextResponse.json({ success: false, error: "Day number is required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("luxury_leads");

    // Update or insert configuration for the selected day
    await db.collection("days").updateOne(
      { day: Number(day) },
      { 
        $set: { 
          videoUrl: videoUrl || "", 
          documentUrl: documentUrl || "", 
          isLocked: Boolean(isLocked) 
        } 
      },
      { upsert: true }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API update-day error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}