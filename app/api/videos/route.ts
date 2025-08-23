import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { imagekit } from "@/lib/imagekit";
import { withCors } from "@/lib/cors";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const file = form.get("file") as File;
  const title = form.get("title") as string;
  const userThumbnail = form.get("thumbnail") as File | null;

  if (!file || !title) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const videoBuffer = Buffer.from(await file.arrayBuffer());

  const videoRes = await imagekit.upload({
    file: videoBuffer,
    fileName: `${title}-video.mp4`,
    folder: "/videos",
  });

  let thumbUrl = "";

  if (userThumbnail && userThumbnail.size > 0) {
    const thumbBuffer = Buffer.from(await userThumbnail.arrayBuffer());
    const thumbRes = await imagekit.upload({
      file: thumbBuffer,
      fileName: `${title}-thumb.jpg`,
      folder: "/videos",
    });
    thumbUrl = thumbRes.url;
  }

  const video = await db.videoItem.create({
    data: {
      url: videoRes.url,
      thumbnail: thumbUrl,
      title,
    },
  });

  return NextResponse.json(video, { status: 201 });
}

export async function GET() {
  const videos = await db.videoItem.findMany({
    orderBy: { createdAt: "desc" },
  });

  return withCors(NextResponse.json(videos));
}
