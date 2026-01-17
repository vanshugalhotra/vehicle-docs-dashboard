"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppInput } from "@/components/ui/AppInput";
import { AppButton } from "@/components/ui/AppButton";
import { useAuth } from "@/hooks/useAuth";
import { Shield, Mail, LogIn } from "lucide-react";
import Link from "next/link";
import { routes } from "@/lib/routes";
import { Footer } from "@/components/layout/footer/Footer";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { forgotPassRequestOtp, forgotPassRequestOtpLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await forgotPassRequestOtp({ email });

      sessionStorage.setItem(
        "pending_forgot_password_email",
        JSON.stringify({ email }),
      );

      router.push(routes.verifyForgotPassword);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to send OTP";
      setError(message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 via-white to-indigo-50 px-4 py-8">
      <div className="w-full max-w-lg animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-20 h-20 bg-linear-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-xl">
            <Shield className="w-10 h-10 text-white" />
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-2 bg-linear-to-r from-blue-600 to-indigo-700 bg-clip-text">
            Forgot Password
          </h1>

          <p className="text-gray-600 text-base max-w-sm mx-auto">
            Enter your registered email to receive an OTP
          </p>

          {/* Back to login */}
          <div className="mt-4 inline-flex items-center gap-2 text-sm bg-blue-50/50 px-4 py-2 rounded-full border border-blue-100">
            <span className="text-gray-600">Remembered your password?</span>
            <Link
              href={routes.login}
              className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-semibold hover:underline"
            >
              <LogIn className="w-3.5 h-3.5" />
              Sign In
            </Link>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleRequestOtp}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 flex flex-col gap-6 border border-white/20"
        >
          <AppInput
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            prefixIcon={<Mail className="w-5 h-5 text-gray-400" />}
            placeholder="Enter your registered email"
            className="w-full"
            error={error.toLowerCase().includes("email") ? error : ""}
          />

          {error && !error.toLowerCase().includes("email") && (
            <p className="text-red-600 text-sm text-center bg-red-50/80 px-4 py-3 rounded-xl border border-red-200">
              {error}
            </p>
          )}

          <AppButton
            type="submit"
            variant="primary"
            loading={forgotPassRequestOtpLoading}
            fullWidth
            disabled={!email}
            className="bg-linear-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 shadow-lg"
          >
            {forgotPassRequestOtpLoading ? "Sending OTP..." : "Send OTP"}
          </AppButton>

          <Footer />
        </form>
      </div>
    </div>
  );
}
