"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppInput } from "@/components/ui/AppInput";
import { AppButton } from "@/components/ui/AppButton";
import { useAuth } from "@/hooks/useAuth";
import { Shield, Mail, Lock, User, Phone, LogIn, Asterisk } from "lucide-react";
import Link from "next/link";
import { routes } from "@/lib/routes";
import { Footer } from "@/components/layout/footer/Footer";

export default function RegisterPage() {
  const router = useRouter();
  const { registerRequestOtp, registerRequestOtpLoading } = useAuth();

  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const payload = {
        fullName: fullName || undefined,
        mobile: mobile || undefined,
        email,
        password,
      };

      await registerRequestOtp(payload);

      sessionStorage.setItem(
        "pending_register_payload",
        JSON.stringify(payload),
      );
      router.push(routes.verifyRegister);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Registration failed";
      setError(message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 via-white to-indigo-50 px-4 py-8">
      <div className="w-full max-w-lg animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-20 h-20 bg-linear-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-xl hover:scale-105 transition-transform duration-300">
            <Shield className="w-10 h-10 text-white" />
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-2 bg-linear-to-r from-blue-600 to-indigo-700 bg-clip-text">
            Create Account
          </h1>
          {/* Already have account link */}
          <div className="inline-flex items-center gap-2 text-sm bg-blue-50/50 px-4 py-2 rounded-full border border-blue-100">
            <span className="text-gray-600">Already have an account?</span>
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-semibold transition-colors duration-200 hover:underline"
            >
              <LogIn className="w-3.5 h-3.5" />
              Sign In
            </Link>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleRegister}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 flex flex-col gap-6 border border-white/20 transition-all duration-300 hover:shadow-3xl"
        >
          {/* Full Name - Optional */}
          <div className="space-y-2">
            <div className="flex items-center gap-1">
              <label className="text-sm font-medium text-gray-700">
                Full Name
              </label>
              <span className="text-xs text-gray-500 italic">(optional)</span>
            </div>
            <AppInput
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              prefixIcon={<User className="w-5 h-5 text-gray-400" />}
              placeholder="Enter your full name"
              className="w-full"
            />
          </div>

          {/* Mobile - Optional */}
          <div className="space-y-2">
            <div className="flex items-center gap-1">
              <label className="text-sm font-medium text-gray-700">
                Mobile Number
              </label>
              <span className="text-xs text-gray-500 italic">(optional)</span>
            </div>
            <AppInput
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              prefixIcon={<Phone className="w-5 h-5 text-gray-400" />}
              placeholder="Enter your mobile number"
              className="w-full"
            />
          </div>

          {/* Email - Required */}
          <div className="space-y-2">
            <div className="flex items-center gap-1">
              <label className="text-sm font-medium text-gray-700">
                Email Address
              </label>
              <Asterisk className="w-3 h-3 text-red-500" />
            </div>
            <AppInput
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              prefixIcon={<Mail className="w-5 h-5 text-gray-400" />}
              placeholder="Enter your email address"
              className="w-full"
              error={error.toLowerCase().includes("email") ? error : ""}
            />
          </div>

          {/* Password - Required */}
          <div className="space-y-2">
            <div className="flex items-center gap-1">
              <label className="text-sm font-medium text-gray-700">
                Password
              </label>
              <Asterisk className="w-3 h-3 text-red-500" />
            </div>
            <AppInput
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              prefixIcon={<Lock className="w-5 h-5 text-gray-400" />}
              placeholder="Create a secure password"
              className="w-full"
              error={error.toLowerCase().includes("password") ? error : ""}
            />
          </div>

          {error &&
            !error.toLowerCase().includes("email") &&
            !error.toLowerCase().includes("password") && (
              <div className="animate-pulse">
                <p className="text-red-600 text-sm text-center bg-red-50/80 px-4 py-3 rounded-xl border border-red-200 backdrop-blur-sm">
                  {error}
                </p>
              </div>
            )}

          <AppButton
            type="submit"
            variant="primary"
            loading={registerRequestOtpLoading}
            fullWidth
            disabled={!email || !password}
            className="bg-linear-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none"
          >
            {registerRequestOtpLoading
              ? "Sending OTP..."
              : "Continue with OTP Verification"}
          </AppButton>

          <Footer />
        </form>
      </div>
    </div>
  );
}
