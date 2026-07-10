import { NextResponse } from "next/server";
import clientPromise from "../../../../components/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("luxury_leads");

    const leads = await db.collection("leads").find({}).sort({ createdAt: -1 }).toArray();
    const days = await db.collection("days").find({}).sort({ day: 1 }).toArray();

    return NextResponse.json({ success: true, leads, days });
  } catch (error) {
    console.error("API admin data error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch data" }, { status: 500 });
  }
}