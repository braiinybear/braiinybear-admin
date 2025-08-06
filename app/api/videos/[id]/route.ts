import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { imagekit } from "@/lib/imagekit";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const video = await db.videoItem.findUnique({ where: { id } });
    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    const extractFileId = (url: string) => decodeURIComponent(new URL(url).pathname.slice(1));

    const videoFileId = extractFileId(video.url);
    const thumbFileId = extractFileId(video.thumbnail);

    await Promise.allSettled([
      imagekit.deleteFile(videoFileId),
      imagekit.deleteFile(thumbFileId),
    ]);

    await db.videoItem.delete({ where: { id } });

    return NextResponse.json({ message: "Deleted" });
  } catch (error) {
    console.error("❌ Delete failed", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
