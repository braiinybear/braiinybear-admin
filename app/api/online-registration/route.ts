import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { PaymentStatus, Prisma } from "@prisma/client";
import { withCors } from "@/lib/cors";

export type UserInfoRequestBody = {
  email?: string;
  name: string;
  phoneNo: string;
  userImg: string;
  fatherName: string;
  motherName: string;
  courseName: string;
  aadharCardNo: string;
  aadharBack: string;
  aadharFront: string;
  marksheets: string[];
  address: string;
  paymentStatus?: PaymentStatus;
};

// Handle OPTIONS preflight request for CORS
export async function OPTIONS(req: Request) {
  return withCors(new NextResponse(null, { status: 200 }), req);
}

export async function POST(req: Request) {
  try {
    const body: UserInfoRequestBody = await req.json();
    const {
      name,
      email,
      userImg,
      phoneNo,
      fatherName,
      motherName,
      courseName,
      aadharCardNo,
      aadharBack,
      aadharFront,
      marksheets,
      address,
      paymentStatus,
    } = body;

    if (
      !name ||
      !userImg ||
      !phoneNo ||
      !fatherName ||
      !motherName ||
      !courseName ||
      !aadharCardNo ||
      !aadharBack ||
      !aadharFront ||
      !marksheets?.length ||
      !address
    ) {
      return withCors(NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      ), req);
    }
    const userInfo = await db.userInfo.create({
      data: {
        name,
        userImg,
        email,
        phoneNo,
        fatherName,
        motherName,
        courseName,
        aadharCardNo,
        aadharBack,
        aadharFront,
        marksheets,
        address,
        paymentStatus: paymentStatus ?? PaymentStatus.PENDING,
      },
    });

    return withCors(NextResponse.json({
      success: true,
      message: "Registration successful",
      data: userInfo,
    }), req);
  } catch (error) {
  console.error("Registration error:", error);

  // Check for Prisma unique constraint error
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    return withCors(
      NextResponse.json(
        { success: false, message: `Aadhaar number or phoneNo is already taken` },
        { status: 400 }
      ),
      req
    );
  }

  // Generic error response for anything else
  const errorMessage = error instanceof Error ? error.message : "Unknown server error";
  return withCors(
    NextResponse.json({ success: false, message: errorMessage }, { status: 500 }),
    req
  );
}
}
