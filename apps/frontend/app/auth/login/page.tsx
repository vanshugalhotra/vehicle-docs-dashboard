"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppInput } from "@/components/ui/AppInput";
import { AppButton } from "@/components/ui/AppButton";
import { useAuth } from "@/hooks/useAuth";
import { Shield, Mail, Lock, UserPlus, KeyRound } from "lucide-react";
import Link from "next/link";
import { routes } from "@/lib/routes";
import { toastUtils } from "@/lib/utils/toastUtils";
import { Footer } from "@/components/layout/footer/Footer";

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
        toastUtils.success("Logged in successfully!");
        router.push(routes.home);
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
        <div className="text-center mb-10">
          <div className="mx-auto w-20 h-20 bg-linear-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-xl hover:scale-105 transition-transform duration-300">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2 bg-linear-to-r from-blue-600 to-indigo-700 bg-clip-text">
            Yash Group Dashboard
          </h1>
          <p className="text-gray-600 text-base leading-relaxed max-w-sm mx-auto">
            Sign in to access your dashboard
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

          {/* Forgot Password Link */}
          <div className="text-right -mt-2">
            <Link
              href={routes.forgotPassword}
              className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200 hover:underline"
            >
              <KeyRound className="w-3.5 h-3.5" />
              Forgot your password?
            </Link>
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

          {/* Divider */}
          <div className="relative flex items-center my-2">
            <div className="grow border-t border-gray-300/50"></div>
            <span className="shrink mx-4 text-sm text-gray-500">or</span>
            <div className="grow border-t border-gray-300/50"></div>
          </div>

          <Link href={routes.register}>
            <AppButton
              type="button"
              variant="outline"
              fullWidth
              className="border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400 transition-all duration-300 shadow-sm hover:shadow"
            >
              <div className="flex items-center justify-center gap-2">
                <UserPlus className="w-4 h-4" />
                Create New Account
              </div>
            </AppButton>
          </Link>

          <Footer />
        </form>
      </div>
    </div>
  );
}
