"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import LogoutButton from "@/components/LogoutButton";
import {
    BookText,
    Video,
    GraduationCap,
    User,
    Users,
    Menu,
    X,
} from "lucide-react";

interface SidebarProps {
    children?: ReactNode;
}

export default function MobileSidebar({ children }: SidebarProps) {
    const [isOpen, setIsOpen] = useState(false);

    const toggleSidebar = () => setIsOpen(!isOpen);
    const closeSidebar = () => setIsOpen(false);

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={toggleSidebar}
                className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg hover:bg-gray-100 transition-colors"
                aria-label="Toggle menu"
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Overlay */}
            {isOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/50 z-40"
                    onClick={closeSidebar}
                />
            )}

            {/* Mobile Sidebar */}
            <aside
                className={`
          fixed top-0 left-0 h-full w-64 bg-gray-100 border-r p-6 space-y-6 z-40
          transform transition-transform duration-300 ease-in-out
          md:hidden
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
            >
                <h2 className="text-2xl font-bold mb-6 mt-12">Admin Panel</h2>
                <nav className="flex flex-col gap-4">
                    <SidebarLink
                        href="/admin/blogs"
                        icon={<BookText size={18} />}
                        text="Blogs"
                        className="hover:text-blue-400"
                        onClick={closeSidebar}
                    />
                    <SidebarLink
                        href="/admin/videos"
                        icon={<Video size={18} />}
                        text="Videos"
                        className="hover:text-blue-400"
                        onClick={closeSidebar}
                    />
                    <SidebarLink
                        href="/admin/courses"
                        icon={<GraduationCap size={18} />}
                        text="Courses"
                        className="hover:text-blue-400"
                        onClick={closeSidebar}
                    />
                    <SidebarLink
                        href="/admin/user"
                        icon={<User size={18} />}
                        text="Users"
                        className="hover:text-blue-400"
                        onClick={closeSidebar}
                    />
                    <SidebarLink
                        href="/admin/management"
                        icon={<Users size={18} />}
                        text="Management"
                        className="hover:text-blue-400"
                        onClick={closeSidebar}
                    />

                    {/* Logout Button */}
                    <div className="mt-auto pt-4 border-t">
                        <LogoutButton />
                    </div>
                </nav>
            </aside>

            {/* Desktop Sidebar */}
            <aside className="w-64 bg-gray-100 border-r p-6 space-y-6 hidden md:block">
                <h2 className="text-2xl font-bold mb-6">Admin Panel</h2>
                <nav className="flex flex-col gap-4">
                    <SidebarLink
                        href="/admin/blogs"
                        icon={<BookText size={18} />}
                        text="Blogs"
                        className="hover:text-blue-400"
                    />
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
                    <SidebarLink
                        href="/admin/user"
                        icon={<User size={18} />}
                        text="Users"
                        className="hover:text-blue-400"
                    />
                    <SidebarLink
                        href="/admin/management"
                        icon={<Users size={18} />}
                        text="Management"
                        className="hover:text-blue-400"
                    />

                    {/* Logout Button */}
                    <div className="mt-auto pt-4 border-t">
                        <LogoutButton />
                    </div>
                </nav>
            </aside>
        </>
    );
}

function SidebarLink({
    href,
    icon,
    text,
    className = "",
    onClick,
}: {
    href: string;
    icon: ReactNode;
    text: string;
    className?: string;
    onClick?: () => void;
}) {
    return (
        <Button
            asChild
            variant="ghost"
            className={`justify-start w-full flex gap-2 text-sm ${className}`}
            onClick={onClick}
        >
            <Link href={href} className="cursor-pointer">
                {icon}
                {text}
            </Link>
        </Button>
    );
}
