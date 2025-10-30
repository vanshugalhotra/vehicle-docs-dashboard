import { ReactNode } from "react";
import {
  LayoutDashboard,
  Car,
  FileText,
  Link,
  Bell,
  Users,
  Settings,
  Plus,
  FolderSymlink,
  CalendarSync,
  Blinds,
  Truck,
  Layers2,
  Type,
  MapPin
} from "lucide-react";

export type SidebarSize = "expanded" | "collapsed";

export interface SidebarContextState {
  size: SidebarSize;
  isCollapsed: boolean;
  expand: () => void;
  toggle: () => void;
  setSize: (s: SidebarSize) => void;
}

export interface SidebarItemConfig {
  type?: "brand"; // optional, used for brand/title
  label: string;
  icon?: ReactNode;
  path?: string;
  children?: SidebarItemConfig[];
}


export const sidebarConfig: SidebarItemConfig[] = [
  {
    type: "brand",
    label: "Yash Group",
  },
  {
    label: "Dashboard",
    icon: <LayoutDashboard size={24} />,
    path: "/",
  },
  {
    label: "Vehicles",
    icon: <Car size={24} />,
    children: [
      { label: "Add Vehicle", path: "/vehicles/add", icon: <Plus size={20} /> },
      { label: "View Vehicles", path: "/vehicles", icon: <Car size={20} /> },
    ],
  },
  {
    label: "Documents",
    icon: <FileText size={24} />,
    path: "/document-types"
  },
  {
    label: "Linkages",
    icon: <Link size={24} />,
    children: [
      { label: "Add Linkage", path: "/linkages/add", icon: <Plus size={20} /> },
      { label: "View Linkages", path: "/linkages", icon: <FolderSymlink size={20} /> },
    ],
  },
  {
    label: "Reminders",
    icon: <Bell size={24} />,
    children: [
      {
        label: "Add Reminder",
        path: "/reminders/add",
        icon: <Plus size={20} />,
      },
      { label: "View Reminders", path: "/reminders", icon: <CalendarSync size={20} /> },
    ],
  },
  {
    label: "Others",
    icon: <Blinds size={24} />,
    children: [
      { label: "Drivers", path: "/others/drivers", icon: <Truck size={20} /> },
      { label: "Owners", path: "/others/owners", icon: <Users size={20} /> },
      { label: "Categories", path: "/others/vehicle-categories", icon: <Layers2 size={20} /> },
      { label: "Types", path: "/others/vehicle-types", icon: <Type size={20} /> },
    { label: "Locations", path: "/others/locations", icon: <MapPin size={20} /> },
    ],
  },
  {
    label: "Settings",
    icon: <Settings size={24} />,
    path: "/settings",
  },
];
