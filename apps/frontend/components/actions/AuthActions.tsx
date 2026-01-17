"use client";

import React from "react";
import { LogOut, LogIn, User as UserIcon } from "lucide-react";
import { AppButton } from "@/components/ui/AppButton";
import { AppText } from "@/components/ui/AppText";
import { AppBadge } from "@/components/ui/AppBadge";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

interface AuthActionsProps {
  className?: string;
}

export const AuthActions: React.FC<AuthActionsProps> = ({ className }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();

  const getDisplayName = () => {
    if (user?.fullName) return user.fullName;
    else if (user?.email) return user.email.split("@")[0];
    return "User";
  };

  const getUserEmail = () => user?.email || "user@example.com";

  const truncateEmail = (email: string, maxLength = 30) => {
    if (email.length <= maxLength) return email;
    return email.substring(0, maxLength - 3) + "...";
  };

  if (!isAuthenticated) {
    return (
      <div className={`flex items-center gap-3 ${className || ""}`}>
        <AppButton
          size="sm"
          variant="outline"
          startIcon={<LogIn size={16} />}
          onClick={() => (window.location.href = "/login")}
          className="transition-all duration-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          aria-label="Sign in to your account"
        >
          Login
        </AppButton>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3`}>
      <div className="flex items-center gap-2">
        {/* Welcome Greeting */}
        <div className="flex">
          <AppText
            size="body"
            variant="secondary"
            className="whitespace-nowrap"
          >
            Hi,
          </AppText>
          <AppText
            size="body"
            variant="primary"
            className="font-semibold capitalize mx-1.5"
          >
            {getDisplayName()}
          </AppText>
        </div>
      </div>

      {/* User Status Badge */}
      <AppBadge variant="success" size="sm" className="flex items-center gap-1">
        <UserIcon size={12} />
        <span className="text-xs font-medium">
          {truncateEmail(getUserEmail())}
        </span>
      </AppBadge>

      {/* Logout Button */}
      <AppButton
        size="sm"
        variant="outline"
        startIcon={<LogOut size={16} />}
        onClick={() => {
          logout();
          router.push("/login");
        }}
        className="hover:bg-error/5 hover:text-error hover:border-error/20 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error focus-visible:ring-offset-2"
        aria-label={`Sign out as ${getDisplayName()}`}
      >
        Logout
      </AppButton>
    </div>
  );
};
