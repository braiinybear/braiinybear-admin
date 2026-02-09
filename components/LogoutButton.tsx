"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
    const handleLogout = async () => {
        await signOut({
            callbackUrl: '/login',
            redirect: true
        });
    };

    return (
        <Button
            onClick={handleLogout}
            variant="ghost"
            className="justify-start w-full flex gap-2 text-sm hover:text-red-500 hover:bg-red-50"
        >
            <LogOut size={18} />
            Logout
        </Button>
    );
}
