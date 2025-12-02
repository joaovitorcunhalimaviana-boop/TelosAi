import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { PrivateLayout } from "@/components/PrivateLayout";
import DashboardClient from "./DashboardClient";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <PrivateLayout>
      <ErrorBoundary>
        <DashboardClient
          userRole={user.role}
          userName={user.name || user.email?.split('@')[0] || 'Médico'}
        />
      </ErrorBoundary>
    </PrivateLayout>
  );
}
