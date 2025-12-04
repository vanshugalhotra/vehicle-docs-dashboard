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
      <div className="w-full max-w-lg animate-fade-in">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="mx-auto w-20 h-20 bg-linear-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-xl hover:scale-105 transition-transform duration-300">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2 bg-linear-to-r from-blue-600 to-indigo-700 bg-clip-text">
            Yash Group Dashboard
          </h1>
          <p className="text-gray-600 text-base leading-relaxed max-w-sm mx-auto">
            Sign in to access your dashboard.
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleLogin}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 flex flex-col gap-6 border border-white/20 transition-all duration-300 hover:shadow-3xl"
        >
          <div className="space-y-1">
            <AppInput
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={error.includes("email") ? error : ""}
              required
              prefixIcon={<Mail className="w-5 h-5 text-gray-400 shrink-0" />}
              placeholder="Enter your email"
              className="w-full transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <div className="space-y-1">
            <AppInput
              label="Password"
              type={"password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={error.includes("password") ? error : ""}
              required
              prefixIcon={<Lock className="w-5 h-5 text-gray-400 shrink-0" />}
              placeholder="Enter your password"
              className="w-full transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 pr-10"
            />
          </div>

          {error && !error.includes("email") && !error.includes("password") && (
            <div className="animate-pulse">
              <p className="text-red-600 text-sm text-center bg-red-50/80 px-4 py-3 rounded-xl border border-red-200 backdrop-blur-sm">
                {error}
              </p>
            </div>
          )}

          <AppButton
            type="submit"
            variant="primary"
            loading={loginLoading}
            fullWidth
            disabled={!email || !password}
            className="bg-linear-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none"
          >
            {loginLoading ? "Logging In..." : "Log In"}
          </AppButton>

          {/* Footer Info */}
          <div className="text-center pt-6 border-t border-gray-200/50">
            <p className="text-xs text-gray-500 leading-relaxed">
              © 2025 Yash Group. All rights reserved.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
