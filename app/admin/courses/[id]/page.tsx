import { notFound } from "next/navigation";
import CourseEditor, { Course } from "@/components/course/CourseEditor";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditCoursePage({ params }: Props) {
  const { id } = await params;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://braiinybear-admin.vercel.app/";
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
