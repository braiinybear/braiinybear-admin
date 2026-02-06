// import { NextRequest, NextResponse } from "next/server";
// import { db } from "@/lib/db";
// const allowedFields = [
//   "totalFee",
//   "duration",
//   "status",
//   "category",
// ] as const;

// export async function POST(req: NextRequest) {
//     try {
//         const { courseIds, updates } = await req.json();

//         // Validate input
//         if (!Array.isArray(courseIds) || courseIds.length === 0) {
//             return NextResponse.json(
//                 { error: "Invalid course IDs" },
//                 { status: 400 }
//             );
//         }

//         if (!updates || Object.keys(updates).length === 0) {
//             return NextResponse.json(
//                 { error: "No updates provided" },
//                 { status: 400 }
//             );
//         }

//         // Validate allowed fields (security measure)
//         const allowedFields = ["totalFee", "duration", "status", "category"];
//         //here is the error
//         const updateFields: CourseUpdateFields = {};

//         for (const [key, value] of Object.entries(updates)) {
//             if (allowedFields.includes(key)) {
//                 updateFields[key] = value;
//             }
//         }

//         if (Object.keys(updateFields).length === 0) {
//             return NextResponse.json(
//                 { error: "No valid fields to update" },
//                 { status: 400 }
//             );
//         }

//         // Update multiple courses
//         const result = await db.course.updateMany({
//             where: {
//                 id: {
//                     in: courseIds,
//                 },
//             },
//             data: updateFields,
//         });

//         return NextResponse.json({
//             success: true,
//             updatedCount: result.count,
//         });
//     } catch (err) {
//         console.error("Bulk edit failed:", err);
//         return NextResponse.json(
//             { error: "Internal Server Error" },
//             { status: 500 }
//         );
//     }
// }




import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * Allowed fields for bulk update
 */
const allowedFields = [
  "totalFee",
  "duration",
  "status",
  "category",
] as const;

type AllowedField = typeof allowedFields[number];

type CourseUpdateFields = {
  totalFee?: string;
  duration?: string;
  status?: string;
  category?: string;
};

export async function POST(req: NextRequest) {
  try {
    const { courseIds, updates }: {
      courseIds: string[];
      updates: Partial<CourseUpdateFields>;
    } = await req.json();

    // Validate input
    if (!Array.isArray(courseIds) || courseIds.length === 0) {
      return NextResponse.json(
        { error: "Invalid course IDs" },
        { status: 400 }
      );
    }

    if (!updates || Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No updates provided" },
        { status: 400 }
      );
    }

    const updateFields: CourseUpdateFields = {};

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key as AllowedField)) {
        updateFields[key as AllowedField] = value;
      }
    }

    if (Object.keys(updateFields).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    // Update multiple courses
    const result = await db.course.updateMany({
      where: {
        id: {
          in: courseIds,
        },
      },
      data: updateFields,
    });

    return NextResponse.json({
      success: true,
      updatedCount: result.count,
    });
  } catch (error) {
    console.error("Bulk edit failed:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
