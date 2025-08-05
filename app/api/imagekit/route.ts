// app/api/imagekit/route.ts
import { NextRequest, NextResponse } from "next/server";
import { imagekit } from "@/lib/imagekit";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const file = form.get("file") as File;
  const fileName = form.get("fileName") as string;
  const folder = (form.get("folder") as string) || "/uploads";

  if (!file || !fileName) {
    return NextResponse.json({ error: "Missing file or fileName" }, { status: 400 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());

    const upload = await imagekit.upload({
      file: buffer,
      fileName,
      folder,
    });

    return NextResponse.json({ url: upload.url }, { status: 200 });
  } catch (err) {
    console.error("ImageKit upload failed:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
