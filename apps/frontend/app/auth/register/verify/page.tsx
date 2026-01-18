"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppInput } from "@/components/ui/AppInput";
import { AppButton } from "@/components/ui/AppButton";
import { useAuth } from "@/hooks/useAuth";
import { Shield, KeyRound } from "lucide-react";
import { routes } from "@/lib/routes";
import { toastUtils } from "@/lib/utils/toastUtils";

interface PendingRegisterPayload {
  fullName?: string;
  mobile?: string;
  email: string;
  password: string;
}

export default function VerifyRegisterPage() {
  const router = useRouter();
  const { registerVerifyOtp, registerVerifyOtpLoading } = useAuth();

  const [otp, setOtp] = useState("");
  const [payload, setPayload] = useState<PendingRegisterPayload | null>(null);
  const [error, setError] = useState("");

  // ────────────────────────────────────────────────
  // Load pending registration payload
  // ────────────────────────────────────────────────
  useEffect(() => {
    const stored = sessionStorage.getItem("pending_register_payload");

    if (!stored) {
      router.replace(routes.register);
      return;
    }

    try {
      setPayload(JSON.parse(stored));
    } catch {
      sessionStorage.removeItem("pending_register_payload");
      router.replace(routes.register);
    }
  }, [router]);

  // ────────────────────────────────────────────────
  // Submit OTP verification
  // ────────────────────────────────────────────────
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!payload) return;

    try {
      await registerVerifyOtp({
        ...payload,
        otp,
      });

      // Cleanup
      sessionStorage.removeItem("pending_register_payload");
      toastUtils.success("Account created successfully!");
      // Redirect to login
      router.replace(routes.login);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "OTP verification failed";
      setError(message);
    }
  };

  if (!payload) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 via-white to-indigo-50 px-4 py-8">
      <div className="w-full max-w-lg animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-20 h-20 bg-linear-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-xl">
            <Shield className="w-10 h-10 text-white" />
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-2 bg-linear-to-r from-blue-600 to-indigo-700 bg-clip-text">
            Verify Your Email
          </h1>

          <p className="text-gray-600 text-base max-w-sm mx-auto">
            Enter the OTP sent to
            <span className="font-medium text-gray-800 ml-1">
              {payload.email}
            </span>
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleVerify}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 flex flex-col gap-6 border border-white/20"
        >
          <AppInput
            label="One-Time Password"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
            prefixIcon={<KeyRound className="w-5 h-5 text-gray-400" />}
            placeholder="Enter 6-digit OTP"
            className="w-full text-center tracking-widest text-lg"
          />

          {error && (
            <p className="text-red-600 text-sm text-center bg-red-50/80 px-4 py-3 rounded-xl border border-red-200">
              {error}
            </p>
          )}

          <AppButton
            type="submit"
            variant="primary"
            loading={registerVerifyOtpLoading}
            fullWidth
            disabled={!otp}
            className="bg-linear-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 shadow-lg"
          >
            {registerVerifyOtpLoading
              ? "Verifying..."
              : "Verify & Create Account"}
          </AppButton>

          {/* Footer */}
          <div className="text-center pt-6 border-t border-gray-200/50">
            <p className="text-xs text-gray-500">
              Didn’t receive the OTP? Please check spam or retry registration.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
