"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";
import { Trash2, Pencil, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

type Blog = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  createdAt: string;
};

export default function AdminBlogList() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [fetching, setFetching] = useState(false);
  const [navigatingToEdit, setNavigatingToEdit] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();

  const fetchBlogs = async (query = "") => {
    setFetching(true);
    try {
      const res = await fetch(`/api/blogs?search=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error("Failed to fetch blogs");
      const data = await res.json();
      setBlogs(data.blogs || []);
    } catch {
      toast.error("Failed to fetch blogs");
    } finally {
      setFetching(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchBlogs(search.trim());
    }, 500);

    return () => clearTimeout(handler);
  }, [search]);

  const handleDelete = async (id: string) => {
    toast("Are you sure you want to delete this blog?", {
      description: "This action cannot be undone.",
      action: {
        label: "Delete",
        onClick: async () => {
          setDeletingId(id);
          try {
            const res = await fetch(`/api/blogs/${id}`, { method: "DELETE" });
            if (res.ok) {
              setBlogs((prev) => prev.filter((b) => b.id !== id));
              toast.success("Blog deleted");
            } else {
              toast.error("Failed to delete blog");
            }
          } catch {
            toast.error("Failed to delete blog");
          } finally {
            setDeletingId(null);
          }
        },
      },
    });
  };

  if (loading) return <p className="text-center p-4">Loading blogs...</p>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          📝 All Blogs
        </h1>

        <Link href="/admin/blogs/create">
          <Button className="whitespace-nowrap flex items-center gap-2">
            <Plus />
            Create New Blog
          </Button>
        </Link>
      </div>

      <div className="relative w-full max-w-sm mb-4">
        <input
          type="text"
          placeholder="Search blogs by title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded-md px-3 py-2 w-full pr-10"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer"
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      {fetching ? (
        <p className="text-center p-4">Loading blogs...</p>
      ) : blogs.length === 0 ? (
        <p className="text-center p-4 text-gray-500">No blogs found.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {blogs.map((blog) => (
            <div
              key={blog.id}
              className="border rounded-xl shadow-sm overflow-hidden bg-white p-4 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <h2 className="font-semibold text-lg truncate">{blog.title}</h2>
                <p className="text-sm text-gray-600 line-clamp-3">{blog.excerpt}</p>
                <p className="text-xs text-gray-400">
                  {new Date(blog.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div className="flex justify-between gap-2 pt-4">
                <Button
                  className="hover:bg-blue-500 hover:text-white cursor-pointer hover:scale-[1.05] transition-transform"
                  variant="outline"
                  size="sm"
                  disabled={navigatingToEdit === blog.id}
                  onClick={() => {
                    setNavigatingToEdit(blog.id);
                    router.push(`/admin/blogs/${blog.id}`);
                  }}
                >
                  {navigatingToEdit === blog.id ? (
                    <span className="animate-pulse">Loading...</span>
                  ) : (
                    <>
                      <Pencil className="w-4 h-4 mr-1" />
                      Edit
                    </>
                  )}
                </Button>

                <Button
                  className="cursor-pointer hover:scale-[1.05] transition-transform"
                  variant="destructive"
                  size="sm"
                  disabled={deletingId === blog.id}
                  onClick={() => handleDelete(blog.id)}
                >
                  {deletingId === blog.id ? (
                    <span className="animate-pulse">Deleting...</span>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </>
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
