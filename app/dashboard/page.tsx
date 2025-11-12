import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { PrivateLayout } from "@/components/PrivateLayout";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <PrivateLayout>
      <DashboardClient userRole={user.role} />
    </PrivateLayout>
  );
}
