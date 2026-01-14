import { withCors } from "@/lib/cors";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await db.userInfo.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        userImg: true,
        phoneNo: true,
        fatherName: true,
        motherName: true,
        courseName: true,
        aadharCardNo: true,
        aadharBack: true,
        aadharFront: true,
        marksheets: true,
        address: true,
        paymentStatus: true,
        createdAt: true,
      },
    });

    return withCors(
      NextResponse.json(
        { success: true, message: "Fetched user", user },
        { status: 200 }
      )
    );
  } catch (err) {
    return withCors(
      NextResponse.json(
        { success: false, message: "Fetching user failed" },
        { status: 500 }
      )
    );
  }
}
