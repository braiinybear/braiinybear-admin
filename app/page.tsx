// app/page.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Book, Video, GraduationCap, User } from "lucide-react";
import Image from "next/image";
import { Card } from "@/components/ui/card";

export default function Home() {
  return (
    <main
      style={{
        backgroundImage: 'url("/images/BraiinyBear.jpg")',
        backgroundSize: "cover", // fills screen without distortion
        backgroundPosition: "center", // keeps image centered
        backgroundRepeat: "no-repeat", // avoids tiling
        minHeight: "100vh", // full window height
      }}
      className="min-h-screen px-6 py-12 bg-gray-100 flex flex-col items-center justify-center text-center font-sans relative"
    >
      {/* Black Overlay */}
      <div className="absolute inset-0 bg-black/60"></div>

      {/* Content Wrapper */}
      <div className="relative z-10">
        <Card className="bg-transparent backdrop-blur-0 border-0 shadow-none px-6 py-6 md:px-8 md:py-8 max-w-3xl">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 text-center md:text-left px-2 py-4">
            <Image
              width={80}
              height={80}
              src="/logo/BRAIINYBEAR.png"
              alt="BraiinyBear Logo"
              className="w-20 h-20 md:w-28 md:h-28 object-contain"
            />

            <div>
              <h1 className="text-2xl md:text-4xl font-bold mb-2 text-white drop-shadow-lg">
                BraiinyBear Dashboard
              </h1>
              <p className="text-white/90 text-sm md:text-base drop-shadow-md">
                Manage content&apos;s below
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-2xl w-full mx-auto mt-4">
            <Link href="/admin/blogs" className="group">
              <Button
                variant="outline"
                className="w-full h-32 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 hover:from-blue-100 hover:to-blue-200 hover:shadow-lg transition-all duration-300 rounded-lg"
              >
                <Book className="w-12 h-12 text-blue-600 group-hover:scale-110 transition-transform" />
                <span className="font-semibold text-gray-800">
                Blogs
                </span>
              </Button>
            </Link>

            <Link href="/admin/videos" className="group">
              <Button
                variant="outline"
                className="w-full h-32 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 hover:from-purple-100 hover:to-purple-200 hover:shadow-lg transition-all duration-300 rounded-lg"
              >
                <Video className="w-12 h-12 text-purple-600 group-hover:scale-110 transition-transform" />
                <span className="font-semibold text-gray-800">
                  Videos
                </span>
              </Button>
            </Link>

            <Link href="/admin/courses" className="group">
              <Button
                variant="outline"
                className="w-full h-32 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-green-50 to-green-100 border border-green-200 hover:from-green-100 hover:to-green-200 hover:shadow-lg transition-all duration-300 rounded-lg"
              >
                <GraduationCap className="w-12 h-12 text-green-600 group-hover:scale-110 transition-transform" />
                <span className="font-semibold text-gray-800">
                  Courses
                </span>
              </Button>
            </Link>

            <Link href="/admin/user" className="group">
              <Button
                variant="outline"
                className="w-full h-32 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 hover:from-amber-100 hover:to-amber-200 hover:shadow-lg transition-all duration-300 rounded-lg"
              >
                <User className="w-12 h-12 text-amber-600 group-hover:scale-110 transition-transform" />
                <span className="font-semibold text-gray-800">
                  Users
                </span>
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </main>
  );
}
