import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

interface CourseCreateBody {
  title: string;
  totalFee?: string;
  duration?: string;
  approvedBy?: string;
  category?: string;
  shortDescription?: string;
  fullDescription?: string;
  status?: string;
  image: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: CourseCreateBody = await req.json();

    const {
      title,
      totalFee = "",
      duration = "",
      approvedBy = "",
      category = "",
      shortDescription = "",
      fullDescription = "",
      status = "Ongoing",
      image,
    } = body;

    if (!title.trim() || !image.trim()) {
      return NextResponse.json(
        { error: "Title and image are required." },
        { status: 400 }
      );
    }

    const newCourse = await db.course.create({
      data: {
        title: title.trim(),
        totalFee: totalFee.trim(),
        duration: duration.trim(),
        approvedBy: approvedBy.trim(),
        category: category.trim(),
        shortDescription: shortDescription.trim(),
        fullDescription: fullDescription.trim(),
        status: status.trim(),
        image: image.trim(),
      },
    });

    return NextResponse.json({ course: newCourse }, { status: 201 });
  } catch (error) {
    console.error("Error in create course route:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
