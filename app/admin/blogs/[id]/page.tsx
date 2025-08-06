import { headers } from "next/headers";
import { notFound } from "next/navigation";
import BlogEditor, { Blog } from "@/components/blog/BlogEditor";

const EditBlogPage = async ({
  params,
}: {
  params: Promise<{ id: string }>; // 👈 params is now a Promise in Next.js 15
}) => {
  const { id } = await params; // 👈 Must await params

  const headersList = await headers(); // 👈 Must await headers() too
  const host = headersList.get("host") || "localhost:3000";
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";

  try {
    const res = await fetch(`${protocol}://${host}/api/blogs/${id}`, {
      cache: "no-store",
    });

    if (!res.ok) return notFound();

    const blog: Blog = await res.json();

    return (
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Edit Blog</h1>
        <BlogEditor initialData={blog} />
      </div>
    );
  } catch (error) {
    console.error("Failed to load blog:", error);
    return notFound();
  }
};

export default EditBlogPage;
