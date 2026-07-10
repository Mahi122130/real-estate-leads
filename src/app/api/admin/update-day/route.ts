import { NextRequest, NextResponse } from "next/server";
import clientPromise from "../../../../components/lib/mongodb";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      day,
      title,
      description,
      videoUrl,
      documentUrl,
      isLocked,
    } = body;

    // Validate required field
    if (!day || isNaN(Number(day))) {
      return NextResponse.json(
        {
          success: false,
          error: "Valid day number is required.",
        },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("luxury_leads");

    const updateData = {
      day: Number(day),
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(videoUrl !== undefined && { videoUrl }),
      ...(documentUrl !== undefined && { documentUrl }),
      ...(isLocked !== undefined && { isLocked: Boolean(isLocked) }),
      updatedAt: new Date(),
    };

    await db.collection("days").updateOne(
      { day: Number(day) },
      {
        $set: updateData,
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      {
        upsert: true,
      }
    );

    const updatedDay = await db.collection("days").findOne({
      day: Number(day),
    });

    return NextResponse.json({
      success: true,
      message: `Day ${day} updated successfully.`,
      day: updatedDay,
    });
  } catch (error) {
    console.error("Update Day API Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to update day configuration.",
      },
      { status: 500 }
    );
  }
}