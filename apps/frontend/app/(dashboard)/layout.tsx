import { AuthActions } from "@/components/actions/AuthActions";
import { AppLayout } from "@/components/layout/applayout";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <AppLayout title="Yash Group Dashboard" rightActions={<AuthActions />}>
      {children}
    </AppLayout>
  );
}
