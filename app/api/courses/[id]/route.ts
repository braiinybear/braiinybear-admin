import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// GET
export async function GET(req: NextRequest, context: { params: { id: string } }) {
  const { id } = context.params;

  try {
    const course = await db.course.findUnique({ where: { id } });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    return NextResponse.json(course);
  } catch (error) {
    console.error("[COURSE_GET_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PATCH
export async function PATCH(req: NextRequest, context: { params: { id: string } }) {
  const { id } = context.params;
  const body = await req.json();

  try {
    const updatedCourse = await db.course.update({
      where: { id },
      data: body,
    });

    return NextResponse.json(updatedCourse);
  } catch (error) {
    console.error("[COURSE_UPDATE_ERROR]", error);
    return NextResponse.json({ error: "Failed to update course" }, { status: 500 });
  }
}

// DELETE
export async function DELETE(req: NextRequest, context: { params: { id: string } }) {
  const { id } = context.params;

  try {
    await db.course.delete({ where: { id } });
    return NextResponse.json({ message: "Course deleted successfully" });
  } catch (error) {
    console.error("[COURSE_DELETE_ERROR]", error);
    return NextResponse.json({ error: "Failed to delete course" }, { status: 500 });
  }
}
