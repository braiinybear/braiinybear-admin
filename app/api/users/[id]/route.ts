import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await db.userInfo.findUnique({
      where: { id: params.id },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: user }, { status: 200 });
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { success: false, message: "Fetching user failed" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();

    const user = await db.userInfo.update({
      where: { id: params.id },
      data: body,
    });

    return NextResponse.json(
      { success: true, message: "User updated", data: user },
      { status: 200 }
    );
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { success: false, message: "Updating user failed" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await db.userInfo.delete({
      where: { id: params.id },
    });

    return NextResponse.json(
      { success: true, message: "User deleted" },
      { status: 200 }
    );
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { success: false, message: "Deleting user failed" },
      { status: 500 }
    );
  }
}