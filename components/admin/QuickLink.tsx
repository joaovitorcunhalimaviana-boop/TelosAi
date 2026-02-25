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
      <Card className="border-0 backdrop-blur-md shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full group" style={{ backgroundColor: '#111520', boxShadow: '0 0 0 1px #1E2535' }}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {icon && <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#0D7377] to-[#0A5A5E] text-white shadow-md group-hover:scale-110 transition-transform">{icon}</div>}
              <CardTitle className="text-xl font-bold group-hover:text-[#14BDAE] transition-colors" style={{ color: '#F0EAD6' }}>
                {title}
              </CardTitle>
            </div>
            <div className="p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0" style={{ backgroundColor: '#1E2535', color: '#14BDAE' }}>
              <ArrowRight className="h-5 w-5" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-sm font-medium leading-relaxed" style={{ color: '#7A8299' }}>
            {description}
          </CardDescription>
        </CardContent>
      </Card>
    </Link>
  );
}
