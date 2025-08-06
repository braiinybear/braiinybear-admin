import BlogEditor from "@/components/blog/BlogEditor";

export default function CreateBlogPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Create New Blog</h1>
      <BlogEditor />
    </div>
  );
}
