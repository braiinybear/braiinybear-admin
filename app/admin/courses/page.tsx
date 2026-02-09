"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";
import { Trash2, Pencil, Plus, GraduationCap, Search, Loader2, CheckSquare, Square } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

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

  const toggleCourseSelection = (courseId: string) => {
    setSelectedCourses((prev) => {
      if (prev.includes(courseId)) {
        return prev.filter((id) => id !== courseId);
      } else {
        return [...prev, courseId];
      }
    });
  };

  const selectAllCourses = () => {
    setSelectedCourses(courses.map((course) => course.id));
  };

  const unselectAllCourses = () => {
    setSelectedCourses([]);
  };

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
              setCourses((prev) => prev.filter((c) => !selectedCourses.includes(c.id)));
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

    const updates: BulkCourseUpdates = {};
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
        fetchCourses(search);
      } else {
        toast.error("Failed to update courses");
      }
    } catch {
      toast.error("Failed to update courses");
    }
  };

  useEffect(() => {
    fetchCourses();
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

  const filteredCourses = courses.filter((course) =>
    course.title.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "ongoing":
        return "bg-green-100 text-green-700 border-green-200";
      case "upcoming":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "completed":
        return "bg-gray-100 text-gray-700 border-gray-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Course Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your courses, bulk edit, and track status
          </p>
        </div>

        {/* Stats */}
        <Card className="md:w-auto">
          <CardContent className="flex items-center gap-2 p-4">
            <GraduationCap className="w-5 h-5 text-purple-600" />
            <div>
              <p className="text-2xl font-bold">{courses.length}</p>
              <p className="text-xs text-muted-foreground">Total Courses</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="all" className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4" />
            All Courses
          </TabsTrigger>
          <TabsTrigger value="create" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create New
          </TabsTrigger>
        </TabsList>

        {/* All Courses Tab */}
        <TabsContent value="all" className="space-y-4 mt-6">
          {/* Search and Bulk Actions */}
          <Card>
            <CardContent className="p-4 space-y-4">
              {/* Search */}
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search courses by title..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Bulk Actions */}
              <div className="flex items-center gap-3 flex-wrap">
                <Button
                  variant={isBulkMode ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setIsBulkMode(!isBulkMode);
                    setSelectedCourses([]);
                  }}
                >
                  {isBulkMode ? (
                    <>
                      <CheckSquare className="w-4 h-4 mr-2" />
                      Exit Bulk Mode
                    </>
                  ) : (
                    <>
                      <Square className="w-4 h-4 mr-2" />
                      Bulk Select
                    </>
                  )}
                </Button>

                {isBulkMode && (
                  <>
                    <Button variant="outline" size="sm" onClick={selectAllCourses}>
                      Select All
                    </Button>
                    <Button variant="outline" size="sm" onClick={unselectAllCourses}>
                      Deselect All
                    </Button>

                    {selectedCourses.length > 0 && (
                      <>
                        <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete ({selectedCourses.length})
                        </Button>
                        <Button size="sm" onClick={() => setShowBulkEditModal(true)}>
                          <Pencil className="w-4 h-4 mr-2" />
                          Edit ({selectedCourses.length})
                        </Button>
                      </>
                    )}

                    <Badge variant="secondary">
                      {selectedCourses.length} selected
                    </Badge>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Courses Grid */}
          {loading || fetching ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600 mb-4" />
                <p className="text-sm text-muted-foreground">Loading courses...</p>
              </CardContent>
            </Card>
          ) : filteredCourses.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <GraduationCap className="w-16 h-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {search ? "No courses found" : "No courses yet"}
                </h3>
                <p className="text-sm text-muted-foreground text-center max-w-md">
                  {search
                    ? "Try adjusting your search query"
                    : "Create your first course to get started"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {filteredCourses.map((course) => (
                <Card
                  key={course.id}
                  className={`overflow-hidden transition-all flex flex-col justify-end hover:shadow-lg ${selectedCourses.includes(course.id) ? "ring-2 ring-purple-500" : ""
                    }`}
                >
                  <div className="relative w-full h-48">
                    {isBulkMode && (
                      <div className="absolute top-3 left-3 z-10">
                        <input
                          type="checkbox"
                          checked={selectedCourses.includes(course.id)}
                          onChange={() => toggleCourseSelection(course.id)}
                          className="w-5 h-5 cursor-pointer accent-purple-600"
                        />
                      </div>
                    )}
                    <Image
                      src={course.image}
                      alt={course.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 25vw"
                    />
                  </div>

                  <CardContent className="p-4 space-y-3">
                    <div>
                      <h2 className="font-semibold text-base line-clamp-2 mb-2">
                        {course.title}
                      </h2>
                      <Badge className={getStatusColor(course.status)} variant="outline">
                        {course.status}
                      </Badge>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        className="flex-1"
                        variant="outline"
                        size="sm"
                        disabled={navigatingToEdit === course.id || isBulkMode}
                        onClick={() => {
                          setNavigatingToEdit(course.id);
                          router.push(`/admin/courses/${course.id}`);
                        }}
                      >
                        {navigatingToEdit === course.id ? (
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
                        disabled={deletingId === course.id || isBulkMode}
                        onClick={() => handleDelete(course.id)}
                      >
                        {deletingId === course.id ? (
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
          {!loading && !fetching && filteredCourses.length > 0 && (
            <p className="text-sm text-muted-foreground text-center">
              Showing {filteredCourses.length} of {courses.length} courses
            </p>
          )}
        </TabsContent>

        {/* Create Tab */}
        <TabsContent value="create" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Create New Course
              </CardTitle>
              <CardDescription>
                Click the button below to create a new course
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/courses/create">
                <Button className="w-full" size="lg">
                  <Plus className="w-5 h-5 mr-2" />
                  Create New Course
                </Button>
              </Link>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Bulk Edit Modal */}
      <Dialog open={showBulkEditModal} onOpenChange={setShowBulkEditModal}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Bulk Edit Courses ({selectedCourses.length} selected)
            </DialogTitle>
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
                  className="w-4 h-4 cursor-pointer accent-purple-600"
                />
                <Label htmlFor="update-fee" className="cursor-pointer">
                  Update Total Fee
                </Label>
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
                  className="w-4 h-4 cursor-pointer accent-purple-600"
                />
                <Label htmlFor="update-duration" className="cursor-pointer">
                  Update Duration
                </Label>
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
                  className="w-4 h-4 cursor-pointer accent-purple-600"
                />
                <Label htmlFor="update-status" className="cursor-pointer">
                  Update Status
                </Label>
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
                  className="w-4 h-4 cursor-pointer accent-purple-600"
                />
                <Label htmlFor="update-category" className="cursor-pointer">
                  Update Category
                </Label>
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
            <Button onClick={handleBulkEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
