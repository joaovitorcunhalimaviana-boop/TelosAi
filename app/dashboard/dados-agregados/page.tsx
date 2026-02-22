import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { PrivateLayout } from "@/components/PrivateLayout";
import { DadosAgregadosClient } from "./DadosAgregadosClient";

export default async function DadosAgregadosPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <PrivateLayout>
      <DadosAgregadosClient userName={user.name || user.email?.split("@")[0] || "Médico"} />
    </PrivateLayout>
  );
}
