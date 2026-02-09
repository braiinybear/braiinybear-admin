"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export default function EmployeePage() {
    const handleSignOut = async () => {
        await signOut({
            callbackUrl: '/login',
            redirect: true
        });
    };

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold">Employee Dashboard</h1>
                <p className="text-muted-foreground mt-1">
                    Welcome to your employee portal
                </p>
            </div>

            {/* Sign Out Card */}
            <Card className="p-6 max-w-md">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h2 className="font-semibold text-lg">Sign Out</h2>
                        <p className="text-sm text-muted-foreground">
                            Click below to sign out of your account
                        </p>
                    </div>
                    <Button
                        onClick={handleSignOut}
                        variant="destructive"
                        className="gap-2"
                    >
                        <LogOut size={18} />
                        Sign Out
                    </Button>
                </div>
            </Card>
        </div>
    );
}