"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";
import { Trash2, Pencil, Plus, BookText, Search, Loader2, Calendar, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";

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

  const filteredBlogs = blogs.filter((blog) =>
    blog.title.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Blog Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Create, edit, and manage your blog posts
          </p>
        </div>

        {/* Stats */}
        <Card className="md:w-auto">
          <CardContent className="flex items-center gap-2 p-4">
            <BookText className="w-5 h-5 text-orange-600" />
            <div>
              <p className="text-2xl font-bold">{blogs.length}</p>
              <p className="text-xs text-muted-foreground">Total Blogs</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="all" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            All Blogs
          </TabsTrigger>
          <TabsTrigger value="create" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create New
          </TabsTrigger>
        </TabsList>

        {/* All Blogs Tab */}
        <TabsContent value="all" className="space-y-4 mt-6">
          {/* Search */}
          <Card>
            <CardContent className="p-4">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search blogs by title..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Blogs Grid */}
          {loading || fetching ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-orange-600 mb-4" />
                <p className="text-sm text-muted-foreground">Loading blogs...</p>
              </CardContent>
            </Card>
          ) : filteredBlogs.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <BookText className="w-16 h-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {search ? "No blogs found" : "No blogs yet"}
                </h3>
                <p className="text-sm text-muted-foreground text-center max-w-md">
                  {search
                    ? "Try adjusting your search query"
                    : "Create your first blog post to get started"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {filteredBlogs.map((blog) => (
                <Card
                  key={blog.id}
                  className="overflow-hidden transition-all hover:shadow-lg flex flex-col"
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base line-clamp-2 min-h-[3rem]">
                      {blog.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-3 min-h-[4.5rem]">
                      {blog.excerpt}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="pt-0 mt-auto space-y-3">
                    {/* Date Badge */}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(blog.createdAt)}</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button
                        className="flex-1"
                        variant="outline"
                        size="sm"
                        disabled={navigatingToEdit === blog.id}
                        onClick={() => {
                          setNavigatingToEdit(blog.id);
                          router.push(`/admin/blogs/${blog.id}`);
                        }}
                      >
                        {navigatingToEdit === blog.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Pencil className="w-4 h-4 mr-1" />
                            Edit
                          </>
                        )}
                      </Button>

                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={deletingId === blog.id}
                        onClick={() => handleDelete(blog.id)}
                      >
                        {deletingId === blog.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Results count */}
          {!loading && !fetching && filteredBlogs.length > 0 && (
            <p className="text-sm text-muted-foreground text-center">
              Showing {filteredBlogs.length} of {blogs.length} blogs
            </p>
          )}
        </TabsContent>

        {/* Create Tab */}
        <TabsContent value="create" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Create New Blog Post
              </CardTitle>
              <CardDescription>
                Click the button below to create a new blog post
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/blogs/create">
                <Button className="w-full" size="lg">
                  <Plus className="w-5 h-5 mr-2" />
                  Create New Blog
                </Button>
              </Link>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
