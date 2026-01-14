import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { PaymentStatus } from "@prisma/client";
import { withCors } from "@/lib/cors";

export type User = {
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

export async function POST(req: Request) {
    try {
        const body: User = await req.json();
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
            ))
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
        }))
    } catch (err) {
        console.error(err);
        return withCors(NextResponse.json(
            { success: false, message: "Registration failed" },
            { status: 500 }
        ))
    }
}
