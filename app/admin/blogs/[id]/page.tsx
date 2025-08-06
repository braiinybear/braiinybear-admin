import { headers } from "next/headers";
import { notFound } from "next/navigation";
import BlogEditor, { Blog } from "@/components/blog/BlogEditor";

const EditBlogPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;

  const headersList = await headers();
  const host = headersList.get("host") || "https://braiinybear-admin.vercel.app/";
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";

  const res = await fetch(`${protocol}://${host}/api/blogs/${id}`, { cache: "no-store" });
  if (!res.ok) return notFound();

  const blog: Blog = await res.json();

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Edit Blog</h1>
      <BlogEditor initialData={blog} />
    </div>
  );
};

export default EditBlogPage;
