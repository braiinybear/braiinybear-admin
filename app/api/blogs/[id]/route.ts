import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";


export async function GET(
  req: NextRequest,
  context: { params: { id: string } } // ✅ fixed typing
) {
  const { id } = context.params;

  try {
    const blog = await db.blog.findUnique({
      where: { id },
    });

    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    return NextResponse.json(blog);
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch blog" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const { id } = context.params;

  try {
    const body = await req.json();
    const { title, excerpt, content } = body;

    const blog = await db.blog.update({
      where: { id },
      data: {
        title,
        excerpt,
        content,
      },
    });

    return NextResponse.json(blog);
  } catch (err) {
    console.error("PATCH /api/blogs/:id error:", err);
    return NextResponse.json({ error: "Failed to update blog" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const { id } = context.params;

  try {
    await db.blog.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Deleted" });
  } catch (err) {
    console.error("DELETE /api/blogs/:id error:", err);
    return NextResponse.json({ error: "Failed to delete blog" }, { status: 500 });
  }
}
