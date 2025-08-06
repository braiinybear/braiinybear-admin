// app/admin/courses/[id]/page.tsx
import { notFound } from "next/navigation";
import CourseEditor, { Course } from "@/components/course/CourseEditor";

type PageProps = {
  params: Promise<{ id: string }>; // ✅ params is now a Promise in Next.js 15+
};

export default async function EditCoursePage({ params }: PageProps) {
  const { id } = await params; // ✅ Must await to use id

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  const res = await fetch(`${baseUrl}/api/courses/${id}`, {
    cache: "no-store",
  });

  if (!res.ok) return notFound();

  const course: Course = await res.json();

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Edit Course</h1>
      <CourseEditor initialData={course} />
    </div>
  );
}
