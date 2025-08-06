import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const blog = await db.blog.findUnique({
      where: { id: params.id },
    });

    if (!blog) return NextResponse.json({ error: "Blog not found" }, { status: 404 });

    return NextResponse.json(blog);
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch blog" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { title, excerpt, content } = body;

    const blog = await db.blog.update({
      where: { id: params.id },
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
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await db.blog.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Deleted" });
  } catch (err) {
    console.error("DELETE /api/blogs/:id error:", err);
    return NextResponse.json({ error: "Failed to delete blog" }, { status: 500 });
  }
}
