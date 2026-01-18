"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchWithAuth } from "@/lib/utils/fetchWithAuth";
import { apiRoutes } from "@/lib/apiRoutes";

export interface User {
  id: string;
  email: string;
  fullName?: string;
  mobile?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterRequestPayload {
  fullName?: string;
  mobile?: string;
  email: string;
  password: string;
}

export interface VerifyRegisterOtpPayload extends RegisterRequestPayload {
  otp: string;
}

export interface ForgotPasswordRequestPayload {
  email: string;
}

export interface ResetPasswordPayload {
  email: string;
  otp: string;
  password: string;
}

export function useAuth() {
  const queryClient = useQueryClient();

  // Fetch current user on mount (using cookie)
  const { data: user, refetch: refetchUser } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      try {
        return await fetchWithAuth<User>(apiRoutes.auth.me, {
          credentials: "include",
        });
      } catch {
        return null;
      }
    },
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    retry: false,
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (payload: LoginPayload) => {
      const loggedInUser = await fetchWithAuth<User>(apiRoutes.auth.login, {
        method: "POST",
        body: JSON.stringify(payload),
        credentials: "include",
      });
      return loggedInUser;
    },
    onSuccess: (loggedInUser) => {
      // Update the cache with the logged-in user
      queryClient.setQueryData(["auth", "me"], loggedInUser);
    },
    onSettled: () => {
      // Also refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await fetchWithAuth(apiRoutes.auth.logout, {
        method: "POST",
        credentials: "include",
      });
      return null;
    },
    onSuccess: () => {
      // Clear the user from cache
      queryClient.setQueryData(["auth", "me"], null);
      queryClient.clear();
    },
  });

  /* ──────────────────────────────────────────────── */
  /* REGISTER */
  /* ──────────────────────────────────────────────── */

  const registerRequestOtpMutation = useMutation({
    mutationFn: async (payload: RegisterRequestPayload) => {
      return fetchWithAuth(apiRoutes.auth.register_requestOTP, {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
  });

  const registerVerifyOtpMutation = useMutation({
    mutationFn: async (payload: VerifyRegisterOtpPayload) => {
      const user = await fetchWithAuth<User>(
        apiRoutes.auth.register_verifyOTP,
        {
          method: "POST",
          body: JSON.stringify(payload),
          credentials: "include",
        },
      );
      return user;
    },
    onSuccess: (user) => {
      queryClient.setQueryData(["auth", "me"], user);
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    },
  });

  /* ──────────────────────────────────────────────── */
  /* FORGOT PASSWORD */
  /* ──────────────────────────────────────────────── */

  const forgotPassRequestOtpMutation = useMutation({
    mutationFn: async (payload: ForgotPasswordRequestPayload) => {
      return fetchWithAuth(apiRoutes.auth.forgetpass_requestOTP, {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
  });

  const forgotPassVerifyOtpMutation = useMutation({
    mutationFn: async (payload: ResetPasswordPayload) => {
      return fetchWithAuth(apiRoutes.auth.forgetpass_verifyOTP, {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
  });

  return {
    user,
    isAuthenticated: !!user,

    login: loginMutation.mutateAsync,
    loginLoading: loginMutation.isPending,

    logout: logoutMutation.mutateAsync,

    registerRequestOtp: registerRequestOtpMutation.mutateAsync,
    registerRequestOtpLoading: registerRequestOtpMutation.isPending,

    registerVerifyOtp: registerVerifyOtpMutation.mutateAsync,
    registerVerifyOtpLoading: registerVerifyOtpMutation.isPending,

    forgotPassRequestOtp: forgotPassRequestOtpMutation.mutateAsync,
    forgotPassRequestOtpLoading: forgotPassRequestOtpMutation.isPending,

    forgotPassVerifyOtp: forgotPassVerifyOtpMutation.mutateAsync,
    forgotPassVerifyOtpLoading: forgotPassVerifyOtpMutation.isPending,

    refetchUser,
  };
}
