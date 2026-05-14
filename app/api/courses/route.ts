import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { withCors } from "@/lib/cors";
import { errorResponse, paginatedResponse } from "@/lib/api-response";
import { getPaginationParams, calculateSkip } from "@/lib/pagination";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const search = url.searchParams.get("search") || "";
    const { page, limit } = getPaginationParams(url.searchParams);

    const where = search
      ? {
          title: {
            contains: search,
            mode: Prisma.QueryMode.insensitive,
          },
        }
      : {};

    const [courses, total] = await Promise.all([
      db.course.findMany({
        where,
        select: {
          id: true,
          title: true,
          image: true,
          status: true,
          shortDescription: true,
          totalFee: true,
          fullDescription: true,
          approvedBy: true,
          category: true,
        },
        orderBy: { createdAt: "desc" },
        skip: calculateSkip(page, limit),
        take: limit,
      }),
      db.course.count({ where }),
    ]);

    const response = paginatedResponse(courses, page, limit, total);
    return withCors(NextResponse.json(response));
  } catch (err) {
    console.error("Failed to fetch courses", err);
    const response = errorResponse("Failed to fetch courses");
    return withCors(NextResponse.json(response, { status: 500 }));
  }
}
