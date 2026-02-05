import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
    try {
        const { courseIds } = await req.json();

        // Validate input
        if (!Array.isArray(courseIds) || courseIds.length === 0) {
            return NextResponse.json(
                { error: "Invalid course IDs" },
                { status: 400 }
            );
        }

        // Delete multiple courses
        const result = await db.course.deleteMany({
            where: {
                id: {
                    in: courseIds,
                },
            },
        });

        return NextResponse.json({
            success: true,
            deletedCount: result.count,
        });
    } catch (err) {
        console.error("Bulk delete failed:", err);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
