// app/page.tsx
import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth";

export default async function HomePage() {
    // Check authentication status
    const session = await getAuthSession();

    // If not authenticated, redirect to login
    if (!session || !session.user) {
        redirect("/login");
    }

    // Get user role
    const userRole = session.user.role;


    // Role-based redirection
    switch (userRole) {
        case "ADMIN":
            redirect("/admin/blogs");
        case "SALES":
            redirect("/sales");
        case "TECHNICAL":
            redirect("/technical");
        case "HR":
            redirect("/hr");
        case "MEDIA":
            redirect("/media");
        case "EMPLOYEE":
            redirect("/employee");
        default:
            // Fallback for unknown roles
            redirect("/login");
    }
}
