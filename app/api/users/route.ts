import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withCors } from "@/lib/cors";
import { errorResponse, paginatedResponse } from "@/lib/api-response";
import { getPaginationParams, calculateSkip } from "@/lib/pagination";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const { page, limit } = getPaginationParams(url.searchParams);
    const skip = calculateSkip(page, limit);

    const [users, total] = await Promise.all([
      db.userInfo.findMany({
        select: {
          id: true,
          userImg: true,
          name: true,
          courseName: true,
          paymentStatus: true,
          createdAt: true,
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
      }),
      db.userInfo.count(),
    ]);

    const response = paginatedResponse(users, page, limit, total);
    return withCors(NextResponse.json(response));
  } catch (err) {
    console.error(err);
    const response = errorResponse("Fetching users failed");
    return withCors(NextResponse.json(response, { status: 500 }));
  }
}


export async function DELETE(req: NextRequest) {
  try {
    const body: { userIds: string[] } = await req.json();
    const { userIds } = body;

    // validation
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { message: "userIds must be a non-empty array" },
        { status: 400 }
      );
    }

    const result = await db.userInfo.deleteMany({
      where: {
        id: {
          in: userIds,
        },
      },
    });

    return NextResponse.json(
      {
        message: "Users deleted successfully",
        deletedCount: result.count,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "Failed to delete users",
      },
      { status: 500 }
    );
  }
}
