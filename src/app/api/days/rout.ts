import { NextResponse } from "next/server";
import clientPromise from "../../../components/lib/mongodb";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("luxury_leads");
    const days = await db.collection("days").find({}).sort({ day: 1 }).toArray();

    return NextResponse.json({ success: true, days });
  } catch (error) {
    console.error("Failed to fetch days for frontend:", error);
    return NextResponse.json({ success: false, error: "Failed to load days" }, { status: 500 });
  }
}