"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { signIn } from "next-auth/react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { User, Mail, Lock, Eye, EyeOff, Loader2} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);


  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/management", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        toast.error(data.message || "Registration failed");
        return;
      }

      toast.success("Registered! Logging you in...");

      // ✅ Auto login using NextAuth
      const login = await signIn("credentials", {
        name,
        password,
        redirect: false,
      });

      if (login?.ok) {
        router.push("/");
      } else {
        toast.error("Login failed after registration");
      }

    } catch (error) {
      console.error(error);
      toast.error("Registration error");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div
      className="flex min-h-screen items-center justify-center p-6 relative bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: 'url(/images/BraiinyBear.jpg)',
      }}
    >
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/50"></div>

      {/* Register Card */}
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
            BraiinyBear Registeration
          </CardTitle>
          <p className="text-center text-xs text-gray-500">
            Create your account
          </p>
        </CardHeader>

        <CardContent className="px-6 py-3">
          <form onSubmit={handleRegister} className="space-y-2">
            {/* Name Field */}
            <div className="space-y-0.5">
              <Label htmlFor="name" className="text-gray-700 font-medium text-xs">
                Full Name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="pl-9 bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500 h-8 text-xs"
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-0.5">
              <Label htmlFor="email" className="text-gray-700 font-medium text-xs">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  placeholder="Enter your password"
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

            {/* Register Button */}
            <Button
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-1 mt-2.5 transition-all text-xs"
              type="submit"
              disabled={loading || !name || !email || !password}
            >
              {loading ? (
                <div className="flex items-center gap-1">
                  <Loader2 className="h-2.5 w-2.5 animate-spin" />
                  Registering...
                </div>
              ) : (
                "Register"
              )}
            </Button>

            {/* Login Link */}
            <p className="text-center text-xs text-gray-600 mt-2">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-600 hover:underline font-semibold">
                Login
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
