"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppInput } from "@/components/ui/AppInput";
import { AppButton } from "@/components/ui/AppButton";
import { useAuth } from "@/hooks/useAuth";
import { Shield, Lock, KeyRound, LogIn } from "lucide-react";
import Link from "next/link";
import { routes } from "@/lib/routes";
import { toastUtils } from "@/lib/utils/toastUtils";
import { Footer } from "@/components/layout/footer/Footer";

export default function VerifyForgotPasswordPage() {
  const router = useRouter();
  const { forgotPassVerifyOtp, forgotPassVerifyOtpLoading } = useAuth();

  const [email, setEmail] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  /* ──────────────────────────────────────────────── */
  /* Load email from sessionStorage */
  /* ──────────────────────────────────────────────── */
  useEffect(() => {
    const stored = sessionStorage.getItem("pending_forgot_password_email");

    if (!stored) {
      router.replace(routes.forgotPassword);
      return;
    }

    const { email } = JSON.parse(stored);
    setEmail(email);
  }, [router]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) return;

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      await forgotPassVerifyOtp({
        email,
        otp,
        password,
      });

      // cleanup
      sessionStorage.removeItem("pending_forgot_password_email");
      toastUtils.success("Password reset successful. Please login.");
      router.replace(routes.login);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "OTP verification failed";
      setError(message);
    }
  };

  if (!email) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 via-white to-indigo-50 px-4 py-8">
      <div className="w-full max-w-lg animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-20 h-20 bg-linear-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-xl">
            <Shield className="w-10 h-10 text-white" />
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-2 bg-linear-to-r from-blue-600 to-indigo-700 bg-clip-text">
            Verify OTP
          </h1>

          <p className="text-gray-600 text-base max-w-sm mx-auto">
            Enter the OTP sent to <span className="font-semibold">{email}</span>
          </p>

          {/* Back to login */}
          <div className="mt-4 inline-flex items-center gap-2 text-sm bg-blue-50/50 px-4 py-2 rounded-full border border-blue-100">
            <span className="text-gray-600">Back to</span>
            <Link
              href={routes.login}
              className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-semibold hover:underline"
            >
              <LogIn className="w-3.5 h-3.5" />
              Login
            </Link>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleVerify}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 flex flex-col gap-6 border border-white/20"
        >
          <AppInput
            label="OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
            prefixIcon={<KeyRound className="w-5 h-5 text-gray-400" />}
            placeholder="Enter OTP"
            className="w-full"
          />

          <AppInput
            label="New Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            prefixIcon={<Lock className="w-5 h-5 text-gray-400" />}
            placeholder="Enter new password"
            className="w-full"
          />

          <AppInput
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            prefixIcon={<Lock className="w-5 h-5 text-gray-400" />}
            placeholder="Re-enter new password"
            className="w-full"
          />

          {error && (
            <p className="text-red-600 text-sm text-center bg-red-50/80 px-4 py-3 rounded-xl border border-red-200">
              {error}
            </p>
          )}

          <AppButton
            type="submit"
            variant="primary"
            loading={forgotPassVerifyOtpLoading}
            fullWidth
            disabled={!otp || !password || !confirmPassword}
            className="bg-linear-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 shadow-lg"
          >
            {forgotPassVerifyOtpLoading ? "Verifying..." : "Reset Password"}
          </AppButton>

          <Footer />
        </form>
      </div>
    </div>
  );
}
