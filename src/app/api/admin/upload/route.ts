import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import fs from "fs";

// IMPORTANT (production note):
// This writes to the local filesystem, which works fine on a traditional
// Node server (VPS, Docker, Render, Railway, etc). It will NOT persist on
// Vercel or other serverless platforms, since their filesystem is read-only
// outside of /tmp and is wiped between invocations.
//
// If you deploy to Vercel, replace the writeFile logic below with an
// upload to a storage provider instead (e.g. Vercel Blob, S3, Cloudinary,
// UploadThing) and store the returned public URL the same way this route
// currently returns `url`. Everything downstream (the admin form, the
// "documentUrl"/"videoUrl" fields) only cares that it gets back a public URL,
// so the rest of the app does not need to change.
export async function POST(req: Request) {
  try {
    const data = await req.formData();
    const file: File | null = data.get("file") as unknown as File;
    const type = data.get("type") as string;
    const day = data.get("day") as string;

    if (!file) {
      return NextResponse.json({ success: false, error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(process.cwd(), "public/uploads");
    if (!fs.existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filename = `day_${day}_${type}_${Date.now()}_${safeName}`;
    const filepath = path.join(uploadDir, filename);
    await writeFile(filepath, buffer);

    return NextResponse.json({ success: true, url: `/uploads/${filename}` });
  } catch (error) {
    console.error("File upload error:", error);
    return NextResponse.json({ success: false, error: "Upload failed" }, { status: 500 });
  }
}