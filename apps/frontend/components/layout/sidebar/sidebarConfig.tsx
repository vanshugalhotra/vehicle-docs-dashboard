import { LayoutDashboard, Car, Settings, Users, Bell } from "lucide-react";
import { SidebarItemConfig } from "./types";

export const sidebarConfig: SidebarItemConfig[] = [
  {
    label: "Dashboard",
    icon: <LayoutDashboard size={18} />,
    path: "/dashboard",
  },
  {
    label: "Vehicles",
    icon: <Car size={18} />,
    path: "/vehicles",
  },
  {
    label: "Masters",
    children: [
      {
        label: "Drivers",
        icon: <Users size={18} />,
        path: "/drivers",
      },
      {
        label: "Owners",
        icon: <Users size={18} />,
        path: "/owners",
      },
    ],
  },
  {
    label: "Reminders",
    icon: <Bell size={18} />,
    path: "/reminders",
  },
  {
    label: "Settings",
    icon: <Settings size={18} />,
    path: "/settings",
  },
];
