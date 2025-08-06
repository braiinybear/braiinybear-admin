// app/admin/layout.tsx
import { ReactNode } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  BookText,
  Video,
  GraduationCap,
  LayoutDashboard,
} from "lucide-react";

export default async function AdminLayout({ children }: { children: ReactNode }) {

    const session = await getAuthSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-100 border-r p-6 space-y-6 hidden md:block">
        <h2 className="text-2xl font-bold mb-6">Admin Panel</h2>
        <nav className="flex flex-col gap-4">
          <SidebarLink
            href="/"
            icon={<LayoutDashboard size={18} />}
            text="Dashboard"
            className="hover:text-blue-400"
          />
          {/* <SidebarLink
            href="/admin/blogs"
            icon={<BookText size={18} />}
            text="Blogs"
            className="hover:text-blue-400"
          /> */}
          <SidebarLink
            href="/admin/videos"
            icon={<Video size={18} />}
            text="Videos"
            className="hover:text-blue-400"
          />
          <SidebarLink
            href="/admin/courses"
            icon={<GraduationCap size={18} />}
            text="Courses"
            className="hover:text-blue-400"
          />
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}

function SidebarLink({
  href,
  icon,
  text,
  className = "",
}: {
  href: string;
  icon: ReactNode;
  text: string;
  className?: string;
}) {
  return (
    <Button
      asChild
      variant="ghost"
      className={`justify-start w-full flex gap-2 text-sm ${className}`}
    >
      <Link href={href} className="cursor-pointer">
        {icon}
        {text}
      </Link>
    </Button>
  );
}
