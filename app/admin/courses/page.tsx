"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";
import { Trash2, Pencil, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

type Course = {
  id: string;
  title: string;
  image: string;
  status: string;
};

export default function AdminCourseList() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [fetching, setFetching] = useState(false);
  const [navigatingToEdit, setNavigatingToEdit] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();

  const fetchCourses = async (query = "") => {
    setFetching(true);
    try {
      const res = await fetch(`/api/courses?search=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error("Failed to fetch courses");
      const data = await res.json();
      setCourses(data.courses || []);
    } catch {
      toast.error("Failed to fetch courses");
    } finally {
      setFetching(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch on mount
    fetchCourses();
  }, []);

  useEffect(() => {
    // Debounce search input changes
    const handler = setTimeout(() => {
      fetchCourses(search.trim());
    }, 500);

    return () => clearTimeout(handler);
  }, [search]);

  const handleDelete = async (id: string) => {
    toast("Are you sure you want to delete this course?", {
      description: "This action cannot be undone.",
      action: {
        label: "Delete",
        onClick: async () => {
          setDeletingId(id);
          try {
            const res = await fetch(`/api/courses/${id}`, { method: "DELETE" });
            if (res.ok) {
              setCourses((prev) => prev.filter((c) => c.id !== id));
              toast.success("Course deleted");
            } else {
              toast.error("Failed to delete course");
            }
          } catch {
            toast.error("Failed to delete course");
          } finally {
            setDeletingId(null);
          }
        },
      },
    });
  };

  if (loading) return <p className="text-center p-4">Loading courses...</p>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          📚 All Courses
        </h1>

        <Link href="/admin/courses/create">
          <Button className="whitespace-nowrap flex items-center gap-2">
            <Plus />
            Create New Course
          </Button>
        </Link>
      </div>

      <div className="relative w-full max-w-sm mb-4">
        <input
          type="text"
          placeholder="Search courses by title..."
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
        <p className="text-center p-4">Loading courses...</p>
      ) : courses.length === 0 ? (
        <p className="text-center p-4 text-gray-500">No courses found.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {courses.map((course) => (
            <div
              key={course.id}
              className="border rounded-xl shadow-sm overflow-hidden bg-white"
            >
              <img
                src={course.image}
                alt={course.title}
                className="h-40 w-full object-cover"
              />
              <div className="p-4 space-y-2">
                <h2 className="font-semibold text-lg truncate">{course.title}</h2>
                <p className="text-xs text-gray-500">{course.status}</p>

                <div className="flex justify-between gap-2 pt-2">
                  <Button
                    className="hover:bg-blue-500 hover:text-white cursor-pointer hover:scale-[1.05] transition-transform"
                    variant="outline"
                    size="sm"
                    disabled={navigatingToEdit === course.id}
                    onClick={() => {
                      setNavigatingToEdit(course.id);
                      router.push(`/admin/courses/${course.id}`);
                    }}
                  >
                    {navigatingToEdit === course.id ? (
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
                    disabled={deletingId === course.id}
                    onClick={() => handleDelete(course.id)}
                  >
                    {deletingId === course.id ? (
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
