import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PrivateLayout } from "@/components/PrivateLayout";
import { AnalyticsDashboardClient } from "./AnalyticsDashboardClient";

export default async function AnalyticsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  return (
    <PrivateLayout>
      <AnalyticsDashboardClient userName={session.user.name || "Médico"} />
    </PrivateLayout>
  );
}
