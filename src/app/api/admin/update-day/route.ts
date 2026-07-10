import { NextRequest, NextResponse } from "next/server";
import clientPromise from "../../../../components/lib/mongodb";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { day, title, description, videoUrl, documentUrl, isLocked } = body;

    const dayNumber = Number(day);
    if (!dayNumber || isNaN(dayNumber)) {
      return NextResponse.json(
        { success: false, error: "Valid day number is required." },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("luxury_leads");

    const updateData: Record<string, any> = {
      day: dayNumber,
      updatedAt: new Date(),
    };

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (videoUrl !== undefined) updateData.videoUrl = videoUrl;
    if (documentUrl !== undefined) updateData.documentUrl = documentUrl;
    if (isLocked !== undefined) updateData.isLocked = Boolean(isLocked);

    await db.collection("days").updateOne(
      { day: dayNumber },
      { 
        $set: updateData, 
        $setOnInsert: { createdAt: new Date() } 
      },
      { upsert: true }
    );

    const updatedDay = await db.collection("days").findOne({ day: dayNumber });

    return NextResponse.json({
      success: true,
      message: `Day ${dayNumber} updated successfully.`,
      day: updatedDay,
    });
  } catch (error) {
    console.error("Update Day API Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update day configuration." },
      { status: 500 }
    );
  }
}