import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { PaymentStatus } from "@prisma/client";

export type UserInfoRequestBody = {
  email?: string;
  name: string;
  phoneNo: string;
  fatherName: string;
  motherName: string;
  courseName: string;
  aadharCardNumber: string;
  aadharBack: string;
  aadharFront: string;
  marksheets: string[];
  address: string;
  paymentStatus?: PaymentStatus;
};

export async function POST(req: Request) {
  try {
    const body: UserInfoRequestBody = await req.json();
    const {
      name,
      email,
      phoneNo,
      fatherName,
      motherName,
      courseName,
      aadharCardNumber,
      aadharBack,
      aadharFront,
      marksheets,
      address,
      paymentStatus,
    } = body;
    if (
      !name ||
      !phoneNo ||
      !fatherName ||
      !motherName ||
      !courseName ||
      !aadharCardNumber ||
      !aadharBack ||
      !aadharFront ||
      !marksheets?.length ||
      !address
    ) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const userInfo = await db.userInfo.create({
      data: {
        name,
        email,
        phoneNo,
        fatherName,
        motherName,
        courseName,
        aadharCardNumber,
        aadharBack,
        aadharFront,
        marksheets,
        address,
        paymentStatus: paymentStatus ?? PaymentStatus.PENDING,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Registration successful",
      data: userInfo,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, message: "Registration failed" },
      { status: 500 }
    );
  }
}
