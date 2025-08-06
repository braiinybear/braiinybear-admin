import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// GET
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const course = await db.course.findUnique({ where: { id } });
    if (!course) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(course);
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

// PATCH
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();

  try {
    const updated = await db.course.update({
      where: { id },
      data: body,
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("[COURSE_UPDATE_ERROR]", error);
    return NextResponse.json({ error: "Failed to update course" }, { status: 500 });
  }
}

// DELETE
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    await db.course.delete({ where: { id } });
    return NextResponse.json({ message: "Deleted successfully" });
  } catch (error) {
    console.error("[COURSE_DELETE_ERROR]", error);
    return NextResponse.json({ error: "Failed to delete course" }, { status: 500 });
  }
}
