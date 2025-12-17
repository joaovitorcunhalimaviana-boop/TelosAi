import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

interface QuickLinkProps {
  href: string;
  title: string;
  description: string;
  icon?: React.ReactNode;
}

export function QuickLink({ href, title, description, icon }: QuickLinkProps) {
  return (
    <Link href={href} className="group">
      <Card className="border-0 bg-white/70 backdrop-blur-md shadow-lg shadow-blue-900/5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ring-1 ring-gray-100 h-full group">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {icon && <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#0A2647] to-[#144272] text-white shadow-md group-hover:scale-110 transition-transform">{icon}</div>}
              <CardTitle className="text-xl font-bold text-gray-800 group-hover:text-[#0A2647] transition-colors">
                {title}
              </CardTitle>
            </div>
            <div className="p-2 rounded-full bg-blue-50 text-[#0A2647] opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0">
              <ArrowRight className="h-5 w-5" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-sm font-medium text-gray-500 leading-relaxed">
            {description}
          </CardDescription>
        </CardContent>
      </Card>
    </Link>
  );
}
