import { AlertTriangle, Calendar, Clock, Ban, CheckCircle } from "lucide-react";

// Color scheme configuration
export const getColorScheme = (color: string) => {
  const schemes = {
    red: {
      primary: "text-red-600",
      light: "bg-red-50",
      border: "border-red-200",
      button: "bg-red-600! hover:bg-red-700! text-white",
      badge: "bg-red-100 text-red-700",
      metricBg: "bg-red-50/80",
      metricIcon: "text-red-500",
    },
    orange: {
      primary: "text-orange-600",
      light: "bg-orange-50",
      border: "border-orange-200",
      button: "bg-orange-600! hover:bg-orange-700! text-white",
      badge: "bg-orange-100 text-orange-700",
      metricBg: "bg-orange-50/80",
      metricIcon: "text-orange-500",
    },
    yellow: {
      primary: "text-yellow-600",
      light: "bg-yellow-50",
      border: "border-yellow-200",
      button: "bg-yellow-600! hover:bg-yellow-700! text-white",
      badge: "bg-yellow-100 text-yellow-700",
      metricBg: "bg-yellow-50/80",
      metricIcon: "text-yellow-500",
    },
    blue: {
      primary: "text-blue-600",
      light: "bg-blue-50",
      border: "border-blue-200",
      button: "bg-blue-600! hover:bg-blue-700! text-white",
      badge: "bg-blue-100 text-blue-700",
      metricBg: "bg-blue-50/80",
      metricIcon: "text-blue-500",
    },
    green: {
      primary: "text-green-600",
      light: "bg-green-50",
      border: "border-green-200",
      button: "bg-green-600! hover:bg-green-700! text-white",
      badge: "bg-green-100 text-green-700",
      metricBg: "bg-green-50/80",
      metricIcon: "text-green-500",
    },
  };
  return schemes[color as keyof typeof schemes] || schemes.red;
};

// Card configuration for summary cards
export const getCardConfig = (title: string) => {
  const configs = {
    "expired": {
      title: "Expired",
      color: "red",
      icon: Ban,
      urgency: "high",
    },
    "today": {
      title: "Expiring Today",
      color: "orange",
      icon: Clock,
      urgency: "high",
    },
    "in_1_day": {
      title: "Expiring in 1 day",
      color: "orange",
      icon: AlertTriangle,
      urgency: "medium",
    },
    "in_1_week": {
      title: "Expiring in week",
      color: "yellow",
      icon: Calendar,
      urgency: "medium",
    },
    "in_1_month": {
      title: "Expiring in month",
      color: "blue",
      icon: Calendar,
      urgency: "low",
    },
    "in_1_year": {
      title: "Expiring in year",
      color: "green",
      icon: CheckCircle,
      urgency: "low",
    },
  };
  return configs[title as keyof typeof configs] || configs.expired;
};

// Status configuration for linkage cards
export const getStatusConfig = (title: string) => {
  const configs = {
    "expired": {
      color: "red",
      icon: Ban,
    },
    "today": {
      color: "orange",
      icon: Clock,
    },
    "in_1_day": {
      color: "orange",
      icon: AlertTriangle,
    },
    "in_1_week": {
      color: "yellow",
      icon: Calendar,
    },
    "in_1_month": {
      color: "blue",
      icon: Calendar,
    },
    "in_1_year": {
      color: "green",
      icon: CheckCircle,
    },
  };
  return configs[title as keyof typeof configs] || configs.expired;
};

// Urgency badge helper
export const getUrgencyBadge = (urgency: string) => {
  switch (urgency) {
    case "high":
      return "High Priority";
    case "medium":
      return "Medium Priority";
    case "low":
      return "Low Priority";
    default:
      return "Priority";
  }
};
