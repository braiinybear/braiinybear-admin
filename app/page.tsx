// app/page.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  Book, 
  Video,
   GraduationCap } from "lucide-react";

export default function Home() {
  
  return (
    <main className="min-h-screen px-6 py-12 bg-gray-100 flex flex-col items-center justify-center text-center font-sans">
      <h1 className="text-4xl font-bold mb-4">📊 Admin Dashboard</h1>
      <p className="text-gray-600 mb-12">Manage your content below</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-xl w-full">
        <Link href="/admin/blogs" className="group">
          <Button variant="outline" className="w-full h-32 flex flex-col items-center justify-center gap-2 group-hover:bg-blue-100">
            <Book className="w-6 h-6" />
            <span>Manage Blogs</span>
          </Button>
        </Link>

        <Link href="/admin/videos" className="group">
          <Button variant="outline" className="w-full h-32 flex flex-col items-center justify-center gap-2 group-hover:bg-purple-100">
            <Video className="w-6 h-6" />
            <span>Manage Videos</span>
          </Button>
        </Link>

        <Link href="/admin/courses" className="group">
          <Button variant="outline" className="w-full h-32 flex flex-col items-center justify-center gap-2 group-hover:bg-green-100">
            <GraduationCap className="w-6 h-6" />
            <span>Manage Courses</span>
          </Button>
        </Link>
      </div>
    </main>
  );
}
