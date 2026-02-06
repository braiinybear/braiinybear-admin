"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";
import { Trash2, Pencil, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

type Course = {
  id: string;
  title: string;
  image: string;
  status: string;
};
type BulkCourseUpdates = {
  totalFee?: string;
  duration?: string;
  status?: string;
  category?: string;
};
export default function AdminCourseList() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);

  const [isBulkMode, setIsBulkMode] = useState(false);
  const [search, setSearch] = useState("");
  const [fetching, setFetching] = useState(false);
  const [navigatingToEdit, setNavigatingToEdit] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Bulk edit states
  const [showBulkEditModal, setShowBulkEditModal] = useState(false);
  const [bulkEditData, setBulkEditData] = useState({
    totalFee: "",
    duration: "",
    status: "",
    category: "",
  });
  const [fieldsToUpdate, setFieldsToUpdate] = useState({
    totalFee: false,
    duration: false,
    status: false,
    category: false,
  });

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

  // toggle selection for a single course

  const toggleCourseSelection = (courseId: string) => {
    setSelectedCourses((prev) => {

      if (prev.includes(courseId)) {
        return prev.filter((id) => id !== courseId)
      } else {
        return [...prev, courseId]
      }
    })
  }

  // select all courses

  const selectAllCourses = () => {
    setSelectedCourses(courses.map((course => course.id)));
  }

  // unselect all courses

  const unselectAllCourses = () => {
    setSelectedCourses([]);
  }

  const handleBulkDelete = async () => {
    if (selectedCourses.length === 0) {
      toast.error("No courses selected");
      return;
    }

    toast("Are you sure you want to delete these courses?", {
      description: `This will delete ${selectedCourses.length} course(s). This action cannot be undone.`,
      action: {
        label: "Delete",
        onClick: async () => {
          try {
            const res = await fetch("/api/courses/bulk-delete", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ courseIds: selectedCourses }),
            });

            if (res.ok) {
              // Remove deleted courses from state
              setCourses(prev => prev.filter(c => !selectedCourses.includes(c.id)));
              toast.success(`${selectedCourses.length} course(s) deleted`);
              setSelectedCourses([]);
              setIsBulkMode(false);
            } else {
              toast.error("Failed to delete courses");
            }
          } catch {
            toast.error("Failed to delete courses");
          }
        },
      },
    });
  };

  const handleBulkEdit = async () => {
    if (selectedCourses.length === 0) {
      toast.error("No courses selected");
      return;
    }

    // Build update object with only checked fields
    // here is the error
    const updates: BulkCourseUpdates= {};
    if (fieldsToUpdate.totalFee && bulkEditData.totalFee.trim()) {
      updates.totalFee = bulkEditData.totalFee.trim();
    }
    if (fieldsToUpdate.duration && bulkEditData.duration.trim()) {
      updates.duration = bulkEditData.duration.trim();
    }
    if (fieldsToUpdate.status && bulkEditData.status) {
      updates.status = bulkEditData.status;
    }
    if (fieldsToUpdate.category && bulkEditData.category.trim()) {
      updates.category = bulkEditData.category.trim();
    }

    // Validate at least one field is selected
    if (Object.keys(updates).length === 0) {
      toast.error("Please select at least one field to update");
      return;
    }

    try {
      const res = await fetch("/api/courses/bulk-edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseIds: selectedCourses,
          updates,
        }),
      });

      if (res.ok) {
        toast.success(`${selectedCourses.length} course(s) updated`);
        setShowBulkEditModal(false);
        setSelectedCourses([]);
        setIsBulkMode(false);
        // Reset form
        setBulkEditData({
          totalFee: "",
          duration: "",
          status: "",
          category: "",
        });
        setFieldsToUpdate({
          totalFee: false,
          duration: false,
          status: false,
          category: false,
        });
        fetchCourses(search); // Refresh the list
      } else {
        toast.error("Failed to update courses");
      }
    } catch {
      toast.error("Failed to update courses");
    }
  };

  useEffect(() => {
    fetchCourses(); // Initial fetch
  }, []);

  useEffect(() => {
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
            <Plus className="w-4 h-4" />
            Create New Course
          </Button>
        </Link>
      </div>

      <div className="relative w-full max-w-sm mb-4">

        {/* Bulk Actions Toolbar */}
        <div className="mb-4 flex items-center gap-3 flex-wrap">
          <Button
            variant={isBulkMode ? "default" : "outline"}
            onClick={() => {
              setIsBulkMode(!isBulkMode);
              setSelectedCourses([]); // Clear selections when toggling
            }}
          >
            {isBulkMode ? "Exit Bulk Mode" : "Bulk Select"}
          </Button>

          {isBulkMode && (
            <>
              <Button variant="outline" onClick={selectAllCourses}>
                Select All
              </Button>
              <Button variant="outline" onClick={unselectAllCourses}>
                Deselect All
              </Button>

              {selectedCourses.length > 0 && (
                <>
                  <Button variant="destructive" onClick={handleBulkDelete}>
                    Delete ({selectedCourses.length})
                  </Button>
                  <Button variant="default" onClick={() => setShowBulkEditModal(true)}>
                    Edit ({selectedCourses.length})
                  </Button>
                </>
              )}

              <span className="text-sm text-gray-600">
                {selectedCourses.length} course(s) selected
              </span>
            </>
          )}
        </div>

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
              className={`border rounded-xl shadow-sm overflow-hidden bg-white flex flex-col ${selectedCourses.includes(course.id) ? 'ring-4 ring-blue-500' : ''
                }`}
            >
              <div className="relative w-full h-40">

                {isBulkMode && (
                  <div className="absolute top-2 left-2 z-10">
                    <input
                      type="checkbox"
                      checked={selectedCourses.includes(course.id)}
                      onChange={() => toggleCourseSelection(course.id)}
                      className="w-5 h-5 cursor-pointer"
                    />
                  </div>
                )}
                <Image
                  src={course.image}
                  alt={course.title}
                  fill
                  className="object-cover rounded-t-xl"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>

              <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <h2 className="font-semibold text-lg truncate">
                    {course.title}
                  </h2>
                  <p className="text-xs text-gray-500">{course.status}</p>
                </div>

                <div className="flex justify-between gap-2 pt-2">
                  <Button
                    className="hover:bg-blue-500 hover:text-white cursor-pointer hover:scale-[1.05] transition-transform"
                    variant="outline"
                    size="sm"
                    disabled={navigatingToEdit === course.id || isBulkMode}
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
                    disabled={deletingId === course.id || isBulkMode}
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

      {/* Bulk Edit Modal */}
      <Dialog open={showBulkEditModal} onOpenChange={setShowBulkEditModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Bulk Edit Courses ({selectedCourses.length} selected)</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="update-fee"
                  checked={fieldsToUpdate.totalFee}
                  onChange={(e) =>
                    setFieldsToUpdate({ ...fieldsToUpdate, totalFee: e.target.checked })
                  }
                  className="w-4 h-4 cursor-pointer"
                />
                <Label htmlFor="update-fee" className="cursor-pointer">Update Total Fee</Label>
              </div>
              <Input
                placeholder="e.g., 40,000 + Hostel"
                value={bulkEditData.totalFee}
                onChange={(e) =>
                  setBulkEditData({ ...bulkEditData, totalFee: e.target.value })
                }
                disabled={!fieldsToUpdate.totalFee}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="update-duration"
                  checked={fieldsToUpdate.duration}
                  onChange={(e) =>
                    setFieldsToUpdate({ ...fieldsToUpdate, duration: e.target.checked })
                  }
                  className="w-4 h-4 cursor-pointer"
                />
                <Label htmlFor="update-duration" className="cursor-pointer">Update Duration</Label>
              </div>
              <Input
                placeholder="e.g., 3 Months"
                value={bulkEditData.duration}
                onChange={(e) =>
                  setBulkEditData({ ...bulkEditData, duration: e.target.value })
                }
                disabled={!fieldsToUpdate.duration}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="update-status"
                  checked={fieldsToUpdate.status}
                  onChange={(e) =>
                    setFieldsToUpdate({ ...fieldsToUpdate, status: e.target.checked })
                  }
                  className="w-4 h-4 cursor-pointer"
                />
                <Label htmlFor="update-status" className="cursor-pointer">Update Status</Label>
              </div>
              <select
                value={bulkEditData.status}
                onChange={(e) =>
                  setBulkEditData({ ...bulkEditData, status: e.target.value })
                }
                disabled={!fieldsToUpdate.status}
                className="w-full border rounded-md px-3 py-2 text-sm"
              >
                <option value="">Select status...</option>
                <option>Ongoing</option>
                <option>Upcoming</option>
                <option>Completed</option>
              </select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="update-category"
                  checked={fieldsToUpdate.category}
                  onChange={(e) =>
                    setFieldsToUpdate({ ...fieldsToUpdate, category: e.target.checked })
                  }
                  className="w-4 h-4 cursor-pointer"
                />
                <Label htmlFor="update-category" className="cursor-pointer">Update Category</Label>
              </div>
              <Input
                placeholder="e.g., Veterinary Courses"
                value={bulkEditData.category}
                onChange={(e) =>
                  setBulkEditData({ ...bulkEditData, category: e.target.value })
                }
                disabled={!fieldsToUpdate.category}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkEditModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleBulkEdit}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
