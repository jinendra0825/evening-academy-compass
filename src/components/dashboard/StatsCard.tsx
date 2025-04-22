
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReactNode } from "react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  description?: string;
  change?: {
    value: number;
    isPositive: boolean;
  };
}

export const StatsCard = ({
  title,
  value,
  icon,
  description,
  change,
}: StatsCardProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="text-primary h-5 w-5">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
        {change && (
          <div className="flex items-center space-x-1">
            <span className={change.isPositive ? "text-green-500" : "text-red-500"}>
              {change.isPositive ? "+" : "-"}{Math.abs(change.value)}%
            </span>
            <p className="text-xs text-muted-foreground">from last month</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
