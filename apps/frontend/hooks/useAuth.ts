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

  return {
    user,
    isAuthenticated: !!user,

    // login
    login: loginMutation.mutateAsync,
    loginLoading: loginMutation.isPending,
    loginError: loginMutation.error,

    // logout
    logout: logoutMutation.mutateAsync,
    logoutLoading: logoutMutation.isPending,
    logoutError: logoutMutation.error,

    refetchUser,
  };
}
