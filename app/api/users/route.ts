import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withCors } from "@/lib/cors";
import { PaymentStatus } from "@prisma/client";
type User = {
    name: string;
    userImg: string;
    courseName: string;
    paymentStatus?: PaymentStatus;
    createdAt?: Date;
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    if (page < 1 || limit < 1) {
      return withCors(
        NextResponse.json(
          { success: false, message: "Invalid page or limit" },
          { status: 400 }
        )
      );
    }

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      db.userInfo.findMany({
        select: {
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

    const totalPages = Math.ceil(total / limit);

    return withCors(
      NextResponse.json({
        success: true,
        data: users,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      })
    );
  } catch (err) {
    console.error(err);
    return withCors(
      NextResponse.json(
        { success: false, message: "Fetching users failed" },
        { status: 500 }
      )
    );
  }
}
