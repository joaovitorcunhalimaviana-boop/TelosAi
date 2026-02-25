import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DollarSign, Shield, FileText, BarChart3 } from "lucide-react";
import { NotificationBell } from "@/components/notifications/NotificationBell";

interface DashboardNavProps {
  userRole: string;
}

export function DashboardNav({ userRole }: DashboardNavProps) {
  return (
    <div className="flex gap-2 items-center">
      {/* Notificações em Tempo Real */}
      <NotificationBell />
      {/* Dados Agregados para médicos */}
      {userRole === "medico" && (
        <Link href="/dashboard/dados-agregados">
          <Button size="sm" variant="outline" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Dados Agregados
          </Button>
        </Link>
      )}

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
          <Button size="sm" variant="outline" className="gap-2 border-[#0D7377] text-[#0D7377] hover:bg-teal-50">
            <Shield className="h-4 w-4" />
            Admin Dashboard
          </Button>
        </Link>
      )}
    </div>
  );
}
