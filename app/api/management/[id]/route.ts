import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!id || typeof id !== "string") {
    return NextResponse.json(
      { error: "Invalid management user ID" },
      { status: 400 }
    );
  }

  try {
    await db.mangement.delete({
      where: { id },
    });
    return NextResponse.json(
      {
        success: true,
        message: "Management user deleted successfully",
        id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[MANAGEMENT_DELETE_ERROR]", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete management user",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
