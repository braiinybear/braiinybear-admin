// app/admin/courses/[id]/page.tsx
import { notFound } from "next/navigation";
import CourseEditor, { Course } from "@/components/course/CourseEditor";

export default async function EditCoursePage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/courses/${id}`,
    {
      cache: "no-store",
    }
  );
  if (!res.ok) return notFound();
  const course: Course = await res.json();

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Edit Course</h1>
      <CourseEditor initialData={course} />
    </div>
  );
}
