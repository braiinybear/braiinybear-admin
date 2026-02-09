import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { MangementRole } from "@prisma/client";
interface ChangeRoleRequestBody {
  adminId: string;
  userId: string;
  role: MangementRole;
}

export interface ChangeRoleResponse {
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
): Promise<NextResponse<ChangeRoleResponse>> {
  try {
    const body: ChangeRoleRequestBody = await request.json();

    const { adminId, userId, role } = body;


    // Validate required fields
    if (!adminId || !userId || !role) {
      return NextResponse.json(
        {
          success: false,
          message: "All fields are required",
        },
        { status: 400 },
      );
    }
    // Check admin user exists and has permission
    const adminUser = await db.mangement.findUnique({ where: { id: adminId } });
    if (!adminUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Admin user not found",
        },
        { status: 404 },
      );
    }

    if (adminUser.role !== MangementRole.ADMIN) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 403 },
      );
    }
    // Check if target user exists
    const targetUser = await db.mangement.findUnique({
      where: { id: userId },
    });
    if (!targetUser) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 },
      );
    }

    if(targetUser.id === adminId){

      return NextResponse.json(
        {
          success: false,
          message: "You cannot change your own role",
        },
        { status: 400 },
      );
    }
    // Update user role
    const updatedUser = await db.mangement.update({
      where: { id: userId },
      data: { role: role },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Management user role updated successfully",
        data: {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          role: updatedUser.role,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("error in updating the role:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred during role update",
      },
      { status: 500 },
    );
  } finally {
    await db.$disconnect();
  }
}
