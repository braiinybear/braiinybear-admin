import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { imagekit } from "@/lib/imagekit";

export async function DELETE(req: NextRequest, context: { params: { id: string } }) {
  const { id } = context.params;

  try {
    const video = await db.videoItem.findUnique({ where: { id } });
    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    const extractFileId = (url: string): string => {
      const parsed = new URL(url);
      return decodeURIComponent(parsed.pathname.slice(1)); // remove leading `/`
    };

    const videoFileId = extractFileId(video.url);
    const thumbFileId = extractFileId(video.thumbnail);

    // Delete video and thumbnail from ImageKit
    await Promise.allSettled([
      imagekit.deleteFile(videoFileId),
      imagekit.deleteFile(thumbFileId),
    ]);

    // Delete video record from DB
    await db.videoItem.delete({ where: { id } });

    return NextResponse.json({ message: "Deleted" });
  } catch (error) {
    console.error("❌ Delete failed", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
