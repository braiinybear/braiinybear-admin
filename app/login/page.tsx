// app/login/page.tsx
"use client";

import { signIn } from "next-auth/react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { User, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await signIn("credentials", {
      name: username,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.ok) {
      toast.success("Logged in!");
      router.push("/");
    } else {
      toast.error("Invalid credentials");
    }
  };

  return (
    <div
      style={{
        backgroundImage: 'url("/images/BraiinyBear.jpg")',
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
      className="flex min-h-screen items-center justify-center p-6 relative"
    >
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/50"></div>

      {/* Login Card */}
      <Card className="w-full max-w-md border-0 shadow-2xl relative z-10 bg-white/95 backdrop-blur-sm">
        <CardHeader className="space-y-0.5 py-2 px-6">
          {/* Logo */}
          <div className="flex justify-center mb-2">
            <Image
              width={64}
              height={64}
              src="/logo/BRAIINYBEAR.png"
              alt="BraiinyBear Logo"
              className="w-14 h-14 object-contain brightness-110"
            />
          </div>

          <CardTitle className="text-lg font-bold text-center text-gray-900">
            BraiinyBear Login
          </CardTitle>
          <p className="text-center text-xs text-gray-500">
            Login to your account
          </p>
        </CardHeader>

        <CardContent className="px-6 py-3">
          <form onSubmit={handleLogin} className="space-y-2.5">
            {/* Username Field */}
            <div className="space-y-0.5">
              <Label htmlFor="username" className="text-gray-700 font-medium text-xs">
                Username
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="pl-9 bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500 h-8 text-xs"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-0.5">
              <Label htmlFor="password" className="text-gray-700 font-medium text-xs">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-9 pr-9 bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500 h-8 text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-3.5 w-3.5" />
                  ) : (
                    <Eye className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <Button
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-1 mt-3 transition-all text-xs"
              type="submit"
              disabled={loading || !username || !password}
            >
              {loading ? (
                <div className="flex items-center gap-1">
                  <Loader2 className="h-2.5 w-2.5 animate-spin" />
                  Logging in...
                </div>
              ) : (
                "Login"
              )}
            </Button>

            {/* Register Link */}
            <p className="text-center text-xs text-gray-600 mt-2">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-blue-600 hover:underline font-semibold">
                Register here
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
