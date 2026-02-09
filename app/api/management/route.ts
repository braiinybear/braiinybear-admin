import { NextRequest, NextResponse } from "next/server";

import bcrypt from "bcryptjs";
import { getToken } from "next-auth/jwt";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { MangementRole } from "@prisma/client";

// Types for request and response
export interface ManagementRegisterRequestBody {
  name: string;
  email: string;
  password: string;
}

export interface ManagementRegisterResponse {
  success: boolean;
  message: string;
  data?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export async function POST(
  request: NextRequest,
): Promise<NextResponse<ManagementRegisterResponse>> {
  try {
    const body: ManagementRegisterRequestBody = await request.json();

    // Validate required fields
    if (!body.name || !body.email || !body.password) {
      return NextResponse.json(
        {
          success: false,
          message: "All fields are required",
        },
        { status: 400 },
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email format",
        },
        { status: 400 },
      );
    }

    // Validate password length
    if (body.password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message: "Password must be at least 6 characters long",
        },
        { status: 400 },
      );
    }

    // Check if user already exists
    const existingUser = await db.mangement.findUnique({
      where: { email: body.email },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "User with this email already exists",
        },
        { status: 409 },
      );
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(body.password, saltRounds);

    // Create management user in database
    const newUser = await db.mangement.create({
      data: {
        name: body.name,
        email: body.email,
        password: hashedPassword,
        role: MangementRole.EMPLOYEE,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Management user registered successfully",
        data: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Management registration error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred during registration",
      },
      { status: 500 },
    );
  } finally {
    await db.$disconnect();
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Try getToken first
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    let isAdmin = false;

    if (token?.role === MangementRole.ADMIN) {
      isAdmin = true;
    } else {
      // Fallback to server session
      const session = await getAuthSession();
      if (session?.user?.role === MangementRole.ADMIN) {
        isAdmin = true;
      }
    }

    if (!isAdmin) {
      return NextResponse.json(
        { success: false, message: "Only admins can fetch employees" },
        { status: 403 },
      );
    }

    // Fetch all management users
    const users = await db.mangement.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Management users fetched successfully",
        data: users,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching management users:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while fetching management users",
      },
      { status: 500 },
    );
  } finally {
    await db.$disconnect();
  }
}
