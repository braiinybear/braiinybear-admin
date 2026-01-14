import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withCors } from "@/lib/cors";
import { PaymentStatus } from "@prisma/client";
type User = {
    name: string;
    userImg: string;
    courseName: string;
    paymentStatus?: PaymentStatus;
};

export async function GET() {
  try {
    const users:User[] = await db.userInfo.findMany({
      select: {
        userImg: true,
        name: true,
        courseName: true,
        paymentStatus: true,
        createdAt: true,
      },
    });

    return withCors(
      NextResponse.json({ success: true, data: users })
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
