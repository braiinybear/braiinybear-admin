import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { withCors } from "@/lib/cors";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const search = url.searchParams.get("search") || "";

    const where = search
      ? {
          title: {
            contains: search,
            mode: Prisma.QueryMode.insensitive,
          },
        }
      : {};

    const courses = await db.course.findMany({
      where,
      select: {
        id: true,
        title: true,
        image: true,
        status: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return withCors(NextResponse.json({ courses }));
  } catch (err) {
    console.error("Failed to fetch courses", err);
    return withCors(NextResponse.json({ error: "Internal Server Error" }, { status: 500 }));
  }
}
