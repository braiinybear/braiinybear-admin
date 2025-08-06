import { NextResponse } from "next/server";
import { db } from "@/lib/db"; // adjust path based on your structure
import { Prisma } from "@prisma/client"; // <-- import Prisma

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";

  const where = search
    ? {
        title: {
          contains: search,
          mode: Prisma.QueryMode.insensitive, // <-- use Prisma enum here
        },
      }
    : {};

  const blogs = await db.blog.findMany({
    where,
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json({ blogs });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, excerpt, content, image } = body;  // <-- add image here

    if (!title || !content || !image) {
      return NextResponse.json(
        { error: "Title, content, and image are required" },
        { status: 400 }
      );
    }

    const slug = title
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "");

    const blog = await db.blog.create({
      data: {
        title,
        excerpt,
        content,
        slug,
        image,  // <-- pass image here
      },
    });

    return NextResponse.json(blog);
  } catch (err) {
    console.error("POST /api/blogs error:", err);
    return NextResponse.json(
      { error: "Failed to create blog" },
      { status: 500 }
    );
  }
}

