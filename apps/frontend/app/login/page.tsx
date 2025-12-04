"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppInput } from "@/components/ui/AppInput";
import { AppButton } from "@/components/ui/AppButton";
import { useAuth } from "@/hooks/useAuth";
import { Shield, Mail, Lock } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login, loginLoading } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const user = await login({ email, password });
      if (user) {
        router.push("/");
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Login failed";
      setError(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 via-white to-indigo-50 px-4 py-8">
      <div className="w-full max-w-md">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-linear-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Yash Group Dashboard
          </h1>
          <p className="text-gray-600 text-sm">
            Sign in to access your dashboard.
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleLogin}
          className="bg-white rounded-2xl shadow-xl p-8 flex flex-col gap-6 border border-gray-100"
        >
          <div>
            <AppInput
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={error.includes("email") ? error : ""}
              required
              prefixIcon={<Mail className="w-4 h-4 text-gray-400" />}
              placeholder="Enter your email"
              className="w-full"
            />
          </div>

          <div>
            <AppInput
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={error.includes("password") ? error : ""}
              required
              prefixIcon={<Lock className="w-4 h-4 text-gray-400" />}
              placeholder="Enter your password"
              className="w-full"
            />
          </div>

          {error && !error.includes("email") && !error.includes("password") && (
            <p className="text-red-500 text-sm text-center bg-red-50 px-3 py-2 rounded-lg border border-red-200">
              {error}
            </p>
          )}

          <AppButton
            type="submit"
            variant="primary"
            loading={loginLoading}
            fullWidth
            className="bg-linear-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Sign In
          </AppButton>

          {/* Footer Info */}
          <div className="text-center pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              © 2025 Yash Group. All rights reserved.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
