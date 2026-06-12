import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { imagekit } from "@/lib/imagekit";
import { withCors } from "@/lib/cors";

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";

    let title = "";
    let videoUrl = "";
    let thumbnailUrl = "";

    if (contentType.includes("application/json")) {
      const body = await req.json();
      title = body.title;
      videoUrl = body.url || body.videoUrl;
      thumbnailUrl = body.thumbnail || body.thumbnailUrl;
    } else {
      const form = await req.formData();
      const file = form.get("file") as File | null;
      title = form.get("title") as string;
      const userThumbnail = form.get("thumbnail") as File | null;
      const passedVideoUrl = form.get("videoUrl") as string | null;
      const passedThumbnailUrl = form.get("thumbnailUrl") as string | null;

      if (passedVideoUrl) {
        videoUrl = passedVideoUrl;
        thumbnailUrl = passedThumbnailUrl || "";
      } else if (file) {
        const videoBuffer = Buffer.from(await file.arrayBuffer());
        const videoRes = await imagekit.upload({
          file: videoBuffer,
          fileName: `${title}-video.mp4`,
          folder: "/videos",
        });
        videoUrl = videoRes.url;

        if (userThumbnail && userThumbnail.size > 0) {
          const thumbBuffer = Buffer.from(await userThumbnail.arrayBuffer());
          const thumbRes = await imagekit.upload({
            file: thumbBuffer,
            fileName: `${title}-thumb.jpg`,
            folder: "/videos",
          });
          thumbnailUrl = thumbRes.url;
        } else {
          thumbnailUrl = `${videoRes.url}/ik-thumbnail.jpg`;
        }
      }
    }

    if (!videoUrl || !title) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const video = await db.videoItem.create({
      data: {
        url: videoUrl,
        thumbnail: thumbnailUrl || `${videoUrl}/ik-thumbnail.jpg`,
        title,
      },
    });

    return NextResponse.json(video, { status: 201 });
  } catch (error) {
    console.error("Error creating video item:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET() {
  const videos = await db.videoItem.findMany({
    orderBy: { createdAt: "desc" },
    take: 12, // Limit response to the 12 most recent items to optimize frontend carousel performance
  });

  return withCors(NextResponse.json(videos));
}
