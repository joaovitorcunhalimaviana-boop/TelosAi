import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DollarSign, Shield, FileText } from "lucide-react";
import { NotificationBell } from "@/components/notifications/NotificationBell";

interface DashboardNavProps {
  userRole: string;
}

export function DashboardNav({ userRole }: DashboardNavProps) {
  return (
    <div className="flex gap-2 items-center">
      {/* Notificações em Tempo Real */}
      <NotificationBell />
      {/* Protocolos para médicos */}
      {userRole === "medico" && (
        <Link href="/dashboard/protocolos">
          <Button size="sm" variant="outline" className="gap-2">
            <FileText className="h-4 w-4" />
            Protocolos
          </Button>
        </Link>
      )}

      {/* Billing link para médicos */}
      {userRole === "medico" && (
        <Link href="/dashboard/billing">
          <Button size="sm" variant="outline" className="gap-2">
            <DollarSign className="h-4 w-4" />
            Meu Plano
          </Button>
        </Link>
      )}

      {/* Admin link para admins */}
      {userRole === "admin" && (
        <Link href="/admin">
          <Button size="sm" variant="outline" className="gap-2 border-blue-600 text-blue-600 hover:bg-blue-50">
            <Shield className="h-4 w-4" />
            Admin Dashboard
          </Button>
        </Link>
      )}
    </div>
  );
}
