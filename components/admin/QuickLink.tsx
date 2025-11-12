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
      <Card className="border-2 hover:shadow-lg hover:border-blue-600 transition-all cursor-pointer h-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {icon && <div className="text-blue-600">{icon}</div>}
              <CardTitle className="text-xl group-hover:text-blue-600 transition-colors">
                {title}
              </CardTitle>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
          </div>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-sm">
            {description}
          </CardDescription>
        </CardContent>
      </Card>
    </Link>
  );
}
