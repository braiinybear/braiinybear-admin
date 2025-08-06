import { headers } from "next/headers";
import { notFound } from "next/navigation";
import BlogEditor, { Blog } from "@/components/blog/BlogEditor";

type EditBlogPageProps = {
  params: {
    id: string;
  };
};

export default async function EditBlogPage({ params }: EditBlogPageProps) {
  const { id } = params;

  const headersList = headers(); // headers() returns Headers object directly, no need to await
  const host = headersList.get("host");
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
}
