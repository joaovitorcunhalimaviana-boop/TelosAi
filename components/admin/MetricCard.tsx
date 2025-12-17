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
    <Card className="border-0 bg-white/70 backdrop-blur-md shadow-lg shadow-blue-900/5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ring-1 ring-gray-100">
      <CardHeader className="pb-3 border-b border-gray-100/50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bold text-gray-500 uppercase tracking-wider">
            {title}
          </CardTitle>
          <div className="p-2 rounded-lg bg-blue-50 text-[#0A2647]">
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="text-3xl font-bold text-[#0A2647] mb-2 font-mono tracking-tight">
          {value}
        </div>
        {description && (
          <p className="text-xs text-gray-500 font-medium">{description}</p>
        )}
        {trend && (
          <div className={`text-xs font-bold mt-2 flex items-center gap-1 ${trend.isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
            <span>{trend.isPositive ? '↑' : '↓'}</span>
            <span>{Math.abs(trend.value)}%</span>
            <span className="text-gray-400 font-normal ml-1">vs mês anterior</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
