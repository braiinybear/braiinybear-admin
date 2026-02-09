// app/admin/layout.tsx
import { ReactNode } from "react";
import { getAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import MobileSidebar from "@/components/MobileSidebar";

export default async function AdminLayout({ children }: { children: ReactNode }) {

  const session = await getAuthSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen flex overflow-hidden">
      {/* Sidebar - handles both mobile and desktop */}
      <MobileSidebar />

      {/* Main Content - scrollable */}
      <main className="flex-1 p-6 md:p-6 pt-20 md:pt-6 overflow-y-auto h-screen">{children}</main>
    </div>
  );
}
