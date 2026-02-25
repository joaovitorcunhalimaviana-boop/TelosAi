import { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function MetricCard({ title, value, icon: Icon, description, trend }: MetricCardProps) {
  return (
    <Card className="border-0 backdrop-blur-md shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300" style={{ backgroundColor: '#111520', boxShadow: '0 0 0 1px #1E2535' }}>
      <CardHeader className="pb-3" style={{ borderBottom: '1px solid #1E2535' }}>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bold uppercase tracking-wider" style={{ color: '#7A8299' }}>
            {title}
          </CardTitle>
          <div className="p-2 rounded-lg" style={{ backgroundColor: '#1E2535', color: '#14BDAE' }}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="text-3xl font-bold mb-2 font-mono tracking-tight" style={{ color: '#F0EAD6' }}>
          {value}
        </div>
        {description && (
          <p className="text-xs font-medium" style={{ color: '#7A8299' }}>{description}</p>
        )}
        {trend && (
          <div className={`text-xs font-bold mt-2 flex items-center gap-1 ${trend.isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
            <span>{trend.isPositive ? '↑' : '↓'}</span>
            <span>{Math.abs(trend.value)}%</span>
            <span className="font-normal ml-1" style={{ color: '#7A8299' }}>vs mês anterior</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
